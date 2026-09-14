// scripts/visual-validate.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { printHeader, printStep, printErrorBanner, printSummaryCard, printWarning, colors, badges } from "./reporter.mjs";

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const STORYBOOK_BASE_URL = process.env.STORYBOOK_URL || "http://localhost:6006";

function validateEnvironment() {
  if (!FIGMA_TOKEN || FIGMA_TOKEN.trim() === "" || FIGMA_TOKEN.includes("figd_your_actual_token_here")) {
    printErrorBanner({
      title: "Missing Figma Access Token",
      message: "FIGMA_ACCESS_TOKEN is not configured or contains placeholder value in .env.local",
      context: "Visual validation requires downloading baseline renders from Figma API.",
      fix: "Add `FIGMA_ACCESS_TOKEN=figd_...` to your `.env.local` file.",
    });
    process.exit(1);
  }
}

async function checkStorybookServer(url) {
  try {
    const res = await fetch(`${url}/iframe.html`, { method: "HEAD", signal: AbortSignal.timeout(3000) });
    return res.ok || res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

function parseFigmaUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Missing Figma URL parameter.");
  }
  const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
  const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
  if (!fileKeyMatch || !nodeIdMatch) {
    throw new Error("Figma URL must contain both a File Key and a Node ID (e.g. ?node-id=123:456).");
  }
  return {
    fileKey: fileKeyMatch[1],
    nodeId: decodeURIComponent(nodeIdMatch[1]).replace("-", ":"),
  };
}

async function fetchFigmaSnapshot(fileKey, nodeId, destPath) {
  const endpoint = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`;
  let res;
  try {
    res = await fetch(endpoint, { headers: { "X-Figma-Token": FIGMA_TOKEN } });
  } catch (netErr) {
    throw new Error(`Failed to contact Figma Image API: ${netErr.message}`);
  }

  if (!res.ok) {
    throw new Error(`Figma Image API returned HTTP ${res.status}: ${await res.text()}`);
  }

  const { images } = await res.json();
  const imgUrl = images[nodeId];
  if (!imgUrl) {
    throw new Error(`No image URL returned by Figma for node ID "${nodeId}".`);
  }

  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to download rendered PNG from CDN: HTTP ${imgRes.status}`);
  }
  fs.writeFileSync(destPath, Buffer.from(await imgRes.arrayBuffer()));
}

async function captureStorybookScreenshot(storyId, destPath) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 2 });
    const canvasUrl = `${STORYBOOK_BASE_URL}/iframe.html?id=${storyId}&viewMode=story`;

    await page.goto(canvasUrl, { waitUntil: "networkidle", timeout: 15000 });
    const root = page.locator("#storybook-root > *").first();
    await root.waitFor({ state: "visible", timeout: 8000 });
    await root.screenshot({ path: destPath });
  } finally {
    await browser.close();
  }
}

function compareImages(img1Path, img2Path, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);

  const canvas1 = new PNG({ width, height });
  const canvas2 = new PNG({ width, height });
  PNG.bitblt(img1, canvas1, 0, 0, img1.width, img1.height, 0, 0);
  PNG.bitblt(img2, canvas2, 0, 0, img2.width, img2.height, 0, 0);

  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(canvas1.data, canvas2.data, diff.data, width, height, {
    threshold: 0.15,
  });

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  const totalPixels = width * height;
  const mismatchPercentage = ((numDiffPixels / totalPixels) * 100).toFixed(2);
  return { numDiffPixels, mismatchPercentage, diffPath, totalPixels };
}

async function run() {
  const figmaUrl = process.argv[2];
  const storyId = process.argv[3];
  const tag = process.argv[4] || "component";

  printHeader("Visual Regression & Storybook Validator", "Comparing 2x Figma baseline render vs live Storybook component screenshot");

  if (!figmaUrl || !storyId) {
    printErrorBanner({
      title: "Missing Required Arguments",
      message: "Figma URL and Storybook Story ID are required.",
      context: "Usage: npm run test:visual <FIGMA_URL> <STORY_ID> [tag]",
      fix: 'Run: npm run test:visual "https://www.figma.com/design/KEY/Title?node-id=1:2" "ui-button--primary" "button"',
    });
  const dumpArgIndex = process.argv.indexOf("--dump-path");
  const dumpPath = dumpArgIndex !== -1 ? process.argv[dumpArgIndex + 1] : (process.argv.includes("--offline") ? "Docs/DirectDataDump" : null);

  const snapshotDir = path.join(process.cwd(), "docs", "figma-data", "snapshots");
  fs.mkdirSync(snapshotDir, { recursive: true });

  const figmaImgPath = path.join(snapshotDir, `${tag}-figma.png`);
  const browserImgPath = path.join(snapshotDir, `${tag}-browser.png`);
  const diffImgPath = path.join(snapshotDir, `${tag}-diff.png`);

  try {
    let baselineFound = false;

    // Check if offline dump has baseline image
    if (dumpPath || fs.existsSync(figmaImgPath)) {
      if (!fs.existsSync(figmaImgPath) && dumpPath) {
        const resolvedDump = path.isAbsolute(dumpPath) ? dumpPath : path.join(process.cwd(), dumpPath);
        const candidates = [
          path.join(resolvedDump, `${tag}.png`),
          path.join(resolvedDump, "light", `${tag}.png`),
          path.join(resolvedDump, "light-dark-export", "light", `${tag}.png`),
          path.join(resolvedDump, "Dashboard-1718_8000.png"),
        ];
        const match = candidates.find((c) => fs.existsSync(c));
        if (match) {
          fs.copyFileSync(match, figmaImgPath);
          baselineFound = true;
          console.log(`    ${colors.green}✔${colors.reset} Loaded baseline from offline dump: ${colors.dim}${match}${colors.reset}`);
        }
      } else if (fs.existsSync(figmaImgPath)) {
        baselineFound = true;
      }
    }

    if (!baselineFound) {
      if (!FIGMA_TOKEN || FIGMA_TOKEN.trim() === "" || FIGMA_TOKEN.includes("figd_your_actual_token_here")) {
        printErrorBanner({
          title: "Missing Figma Baseline Image",
          message: `Baseline image for "${tag}" not found locally and FIGMA_ACCESS_TOKEN is not configured.`,
          context: "To avoid rate limits on starter pack, provide a baseline image in Docs/DirectDataDump or configure baseline locally.",
          fix: `Place a reference PNG at docs/figma-data/snapshots/${tag}-figma.png or specify --dump-path.`,
        });
        process.exit(1);
      }

      printStep(2, 4, "Fetching Figma Baseline Snapshot from API", figmaUrl);
      const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
      await fetchFigmaSnapshot(fileKey, nodeId, figmaImgPath);
      console.log(`    ${colors.green}✔${colors.reset} Figma baseline saved: ${colors.dim}${figmaImgPath}${colors.reset}`);
    } else {
      printStep(2, 4, "Using Local Figma Baseline Snapshot (Offline)", figmaImgPath);
    }

    printStep(3, 4, "Capturing Storybook Component Screenshot", `Story ID: ${storyId}`);
    await captureStorybookScreenshot(storyId, browserImgPath);
    console.log(`    ${colors.green}✔${colors.reset} Browser render saved: ${colors.dim}${browserImgPath}${colors.reset}`);

    printStep(4, 4, "Executing Pixel-Level Image Comparison", "Running pixelmatch at 0.15 threshold...");
    const { mismatchPercentage, numDiffPixels, totalPixels } = compareImages(figmaImgPath, browserImgPath, diffImgPath);

    const isDrift = parseFloat(mismatchPercentage) > 2.0;

    printSummaryCard("VISUAL VALIDATION REPORT", [
      ["Component Tag", tag],
      ["Storybook Story", storyId],
      ["Mismatch Rate", `${isDrift ? colors.red : colors.green}${mismatchPercentage}%${colors.reset}`],
      ["Diff Pixels", `${numDiffPixels} / ${totalPixels}`],
      ["Figma Reference", path.relative(process.cwd(), figmaImgPath).replace(/\\/g, "/")],
      ["Browser Render", path.relative(process.cwd(), browserImgPath).replace(/\\/g, "/")],
      ["Diff Map", path.relative(process.cwd(), diffImgPath).replace(/\\/g, "/")],
      ["Result", isDrift ? `${colors.red}${colors.bold}DRIFT DETECTED (>2.0%)${colors.reset}` : `${colors.green}${colors.bold}PASS (Within Tolerance)${colors.reset}`],
    ]);

    if (isDrift) {
      console.log(`${colors.yellow}💡 Recommendation: Inspect "${diffImgPath}" or run \`node scripts/run-visual-subagent.mjs ${tag}\` to diagnose styling differences.${colors.reset}\n`);
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    printErrorBanner({
      title: "Visual Validation Error",
      message: err.message,
      context: `Story ID: ${storyId} | URL: ${figmaUrl}`,
      fix: "Ensure Storybook story exists and rendered component is visible.",
    });
    process.exit(1);
  }
}

run();
