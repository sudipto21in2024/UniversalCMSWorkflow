/**
 * scripts/verify-blocks.mjs
 *
 * Block-Level Vision Verification
 * ────────────────────────────────
 * For each block in the manifest:
 *   1. Crops the design region from the source PNG (runtime, temporary)
 *   2. Renders the HTML block in Playwright (runtime, temporary)
 *   3. Writes a comparison job to verify-queue/ for Antigravity Gemini
 *   4. Results are written back to the manifest + reports/
 *   5. Temp files are deleted after the run
 *
 * Vision model: Antigravity-native Gemini (no external API key required)
 *
 * Usage:
 *   node scripts/verify-blocks.mjs --slug=Homepage
 *   node scripts/verify-blocks.mjs --slug=Homepage --block=block_2
 *   node scripts/verify-blocks.mjs --all
 *
 * Part of: Block Vision Verification Pipeline
 * See: Docs/BLOCK_VISION_VERIFICATION_PLAN.md
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const rootDir = process.cwd();
const visionDir = path.join(rootDir, "inputs", "vision");
const tmpDir = path.join(rootDir, "dist-preview", ".tmp");
const reportsDir = path.join(rootDir, "dist-preview", "reports");

// ─── Directory Setup ───────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Cleanup ───────────────────────────────────────────────────────────────────
function cleanupTmp() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ─── PNG Crop using pngjs (already in devDependencies — no new deps) ──────────
async function cropDesignRegion(sourcePngPath, coords, outputPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(sourcePngPath)) {
      reject(new Error(`Source PNG not found: ${sourcePngPath}`));
      return;
    }

    const src = fs.createReadStream(sourcePngPath).pipe(new PNG());

    src.on("parsed", function () {
      const imgW = this.width;
      const imgH = this.height;

      // Convert percentage coords to absolute pixels
      const left   = Math.max(0, Math.round((coords.x / 100) * imgW));
      const top    = Math.max(0, Math.round((coords.y / 100) * imgH));
      const width  = Math.min(imgW - left, Math.round((coords.width / 100) * imgW));
      const height = Math.min(imgH - top, Math.round((coords.height / 100) * imgH));

      if (width <= 0 || height <= 0) {
        reject(new Error(`Invalid crop dimensions: ${width}x${height} from coords ${JSON.stringify(coords)}`));
        return;
      }

      const dst = new PNG({ width, height });

      PNG.bitblt(this, dst, left, top, width, height, 0, 0);

      const chunks = [];
      dst.pack()
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => {
          ensureDir(path.dirname(outputPath));
          fs.writeFileSync(outputPath, Buffer.concat(chunks));
          resolve({ width, height, left, top });
        })
        .on("error", reject);
    });

    src.on("error", reject);
  });
}

// ─── Playwright Block Render ───────────────────────────────────────────────────
async function renderBlockToImage(htmlBlockPath, outputPath, browser) {
  const fullPath = path.join(rootDir, htmlBlockPath);
  if (!fs.existsSync(fullPath)) {
    return null; // Block not generated yet — skip gracefully
  }

  const rawFragment = fs.readFileSync(fullPath, "utf-8");
  // Auto-inline local assets to base64 for reliable Playwright rendering
  const processedFragment = rawFragment.replace(/(?:src|href)=["'](assets\/[^"']+)["']/g, (match, relPath) => {
    const assetPath = path.join(rootDir, "dist-preview", relPath);
    if (fs.existsSync(assetPath)) {
      const ext = path.extname(assetPath).slice(1).toLowerCase();
      const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
      const b64 = fs.readFileSync(assetPath).toString("base64");
      return `src="data:${mime};base64,${b64}"`;
    }
    return match;
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300..800&family=Inter:wght@300..900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; letter-spacing: -0.04em; color: #000000; background-color: #FFFFFF; margin: 0; padding: 0; }
    h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Inter Tight', -apple-system, sans-serif; letter-spacing: -0.06em; }
  </style>
</head>
<body class="bg-white text-black antialiased">
  ${processedFragment}
</body>
</html>`;

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  try {
    await page.setContent(fullHtml, { waitUntil: "networkidle", timeout: 15000 });
  } catch {
    await page.setContent(fullHtml, { waitUntil: "load", timeout: 15000 });
  }

  // Eager-load images and let layout settle
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
    await new Promise((r) => setTimeout(r, 500));
  });
  await page.waitForTimeout(800);

  ensureDir(path.dirname(outputPath));
  await page.screenshot({ path: outputPath, fullPage: true });
  await page.close();

  return outputPath;
}

// ─── Write Verify Queue Item (consumed by Antigravity Gemini agent) ────────────
function writeVerifyQueueItem(slug, blockId, block, designCropPath, renderPath) {
  const queueDir = path.join(tmpDir, "verify-queue");
  ensureDir(queueDir);

  // Pull expected copy strings from notes
  const notesCopy = (block.notes || "")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8 && s.length < 120);

  const queueItem = {
    slug,
    blockId,
    title: block.title,
    category: block.category,
    classification: block.classification,
    designCropPath: path.relative(rootDir, designCropPath).replace(/\\/g, "/"),
    renderPath: path.relative(rootDir, renderPath).replace(/\\/g, "/"),
    coordinates: block.coordinates,
    figmaNodeId: block.figmaNodeId,
    keyFields: block.keyFields || [],
    expectedCopy: notesCopy.slice(0, 6),
    notes: block.notes,
    prompt: buildVisionPrompt(block, path.relative(rootDir, designCropPath), path.relative(rootDir, renderPath)),
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  const queuePath = path.join(queueDir, `${slug}-${blockId}.json`);
  fs.writeFileSync(queuePath, JSON.stringify(queueItem, null, 2), "utf-8");
  return queuePath;
}

// ─── Vision Prompt Template ────────────────────────────────────────────────────
function buildVisionPrompt(block, designImagePath, renderImagePath) {
  const fieldsStr = (block.keyFields || []).join(", ") || "N/A";
  return `You are a UI quality reviewer comparing a Figma design region against an HTML implementation.

IMAGE 1 (Design Reference): ${designImagePath}
  → Cropped region from the original Figma design mockup.
  → Block: "${block.title}" (${block.category})

IMAGE 2 (HTML Render): ${renderImagePath}
  → Browser screenshot of the implemented HTML block at 1440px viewport.

EXPECTED CONTENT:
  Key fields: ${fieldsStr}
  Reference notes: ${block.notes || "N/A"}

EVALUATE across 5 dimensions:
  1. Layout structure — columns, alignment, spacing, proportions
  2. Typography hierarchy — heading size, weight, scale
  3. Copy accuracy — are visible text strings from the design present?
  4. Color palette — backgrounds, text colors, accent tones
  5. UI element completeness — CTAs, badges, images, icons

Return a JSON object ONLY (no markdown, no explanation):
{
  "blockId": "${block.id || "unknown"}",
  "matchScore": <0-100>,
  "layoutMatch": "<exact|close|off>",
  "copyAccurate": <true|false>,
  "colorMatch": <true|false>,
  "missingElements": [],
  "issues": [
    { "type": "<layout|copy|color|missing>", "description": "...", "suggestion": "..." }
  ],
  "verdict": "<PASS|WARN|FAIL>"
}

Verdict thresholds: PASS >= 85 · WARN 70-84 · FAIL < 70`;
}

// ─── Report Writer ─────────────────────────────────────────────────────────────
function writeReport(slug, results) {
  ensureDir(reportsDir);
  const reportPath = path.join(reportsDir, `${slug}-block-verification.json`);

  const passed = results.filter((r) => r.verdict === "PASS").length;
  const warned = results.filter((r) => r.verdict === "WARN").length;
  const failed = results.filter((r) => r.verdict === "FAIL").length;
  const skipped = results.filter((r) => r.verdict === "SKIPPED").length;
  const avgScore = results
    .filter((r) => r.matchScore != null)
    .reduce((sum, r) => sum + r.matchScore, 0) / (results.length - skipped || 1);

  const report = {
    slug,
    generatedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      passed,
      warned,
      failed,
      skipped,
      averageScore: Math.round(avgScore),
    },
    blocks: results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  return reportPath;
}

// ─── Update Manifest Status ────────────────────────────────────────────────────
function updateManifestStatus(slug, blockId, result) {
  const manifestPath = path.join(visionDir, `${slug}.manifest.json`);
  if (!fs.existsSync(manifestPath)) return;

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (manifest.blocks && manifest.blocks[blockId]) {
      manifest.blocks[blockId].status.visualVerified = result.verdict === "PASS";
      manifest.blocks[blockId].status.verificationScore = result.matchScore;
      manifest.blocks[blockId].status.verificationVerdict = result.verdict;
      manifest.blocks[blockId].status.lastUpdated = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn(`  ⚠ Could not update manifest for ${blockId}: ${e.message}`);
  }
}

// ─── Print Results Table ───────────────────────────────────────────────────────
function printResults(slug, results) {
  const verdictColor = {
    PASS: "\x1b[32m",
    WARN: "\x1b[33m",
    FAIL: "\x1b[31m",
    SKIPPED: "\x1b[90m",
  };
  const reset = "\x1b[0m";

  console.log(`\n  Block Verification Results — ${slug}`);
  console.log("  ┌────────────┬──────────────────────────────┬───────┬──────────┐");
  console.log("  │ Block ID   │ Title                        │ Score │ Verdict  │");
  console.log("  ├────────────┼──────────────────────────────┼───────┼──────────┤");

  for (const r of results) {
    const id = r.blockId.padEnd(10).slice(0, 10);
    const title = (r.title || "").padEnd(28).slice(0, 28);
    const score = (r.matchScore != null ? `${r.matchScore}%` : "N/A").padEnd(5);
    const color = verdictColor[r.verdict] || "";
    console.log(`  │ ${id} │ ${title} │ ${score} │ ${color}${r.verdict.padEnd(8)}${reset} │`);
  }

  console.log("  └────────────┴──────────────────────────────┴───────┴──────────┘");

  const passed = results.filter((r) => r.verdict === "PASS").length;
  const total = results.length;
  const skipped = results.filter((r) => r.verdict === "SKIPPED").length;
  console.log(`\n  ${passed}/${total - skipped} blocks passed (${skipped} skipped — HTML not yet generated)`);
}

// ─── Core: Verify Blocks for One Slug ─────────────────────────────────────────
async function verifySlug(slug, targetBlockId, browser) {
  const manifestPath = path.join(visionDir, `${slug}.manifest.json`);
  if (!fs.existsSync(manifestPath)) {
    console.error(`  ✗ No manifest found for slug: ${slug}`);
    console.error(`    Run: npm run manifest:build -- --slug=${slug}`);
    return [];
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch (e) {
    console.error(`  ✗ Failed to parse manifest: ${e.message}`);
    return [];
  }

  const sourcePng = path.join(rootDir, manifest.sourceImage);
  if (!fs.existsSync(sourcePng)) {
    console.error(`  ✗ Source PNG not found: ${manifest.sourceImage}`);
    return [];
  }

  const blockEntries = Object.entries(manifest.blocks);
  const targetEntries = targetBlockId
    ? blockEntries.filter(([id]) => id === targetBlockId)
    : blockEntries;

  if (targetBlockId && targetEntries.length === 0) {
    console.error(`  ✗ Block "${targetBlockId}" not found in manifest for slug "${slug}"`);
    return [];
  }

  console.log(`\n  Processing ${targetEntries.length} block(s) for: \x1b[36m${slug}\x1b[0m`);

  const results = [];
  let idx = 0;

  for (const [blockId, block] of targetEntries) {
    idx++;
    const basename = block.canonicalBasename || blockId;
    const htmlPath = block.artifacts?.htmlBlock;

    process.stdout.write(`  [${idx}/${targetEntries.length}] ${blockId} — ${block.title}... `);

    // Skip if HTML not generated yet
    if (!htmlPath || !fs.existsSync(path.join(rootDir, htmlPath))) {
      console.log(`\x1b[90mSKIPPED (HTML not generated)\x1b[0m`);
      results.push({
        blockId, title: block.title, verdict: "SKIPPED", matchScore: null,
        reason: "HTML block file not found",
      });
      continue;
    }

    try {
      // Step B: Crop design region from source PNG (temporary)
      const cropDir = path.join(tmpDir, "crops", slug);
      const designCropPath = path.join(cropDir, `${blockId}_design.png`);
      await cropDesignRegion(sourcePng, block.coordinates, designCropPath);

      // Step C: Render HTML block in Playwright (temporary)
      const renderDir = path.join(tmpDir, "renders", slug);
      const renderPath = path.join(renderDir, `${blockId}_render.png`);
      await renderBlockToImage(htmlPath, renderPath, browser);

      // Step D: Write verify-queue item for Antigravity Gemini
      const queuePath = writeVerifyQueueItem(slug, blockId, { ...block, id: blockId }, designCropPath, renderPath);

      console.log(`\x1b[32m✓ queued\x1b[0m`);

      results.push({
        blockId,
        title: block.title,
        verdict: "QUEUED",
        matchScore: null,
        queueFile: path.relative(rootDir, queuePath).replace(/\\/g, "/"),
        designCrop: path.relative(rootDir, designCropPath).replace(/\\/g, "/"),
        renderFile: path.relative(rootDir, renderPath).replace(/\\/g, "/"),
        note: "Awaiting Antigravity Gemini vision evaluation",
      });

    } catch (err) {
      console.log(`\x1b[31m✗ ERROR\x1b[0m`);
      console.error(`    ${err.message}`);
      results.push({
        blockId, title: block.title, verdict: "ERROR",
        matchScore: null, error: err.message,
      });
    }
  }

  return results;
}

// ─── CLI Entry Point ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const blockArg = args.find((a) => a.startsWith("--block="))?.split("=")[1];
const doAll = args.includes("--all");

function discoverSlugs() {
  if (!fs.existsSync(visionDir)) return [];
  return fs
    .readdirSync(visionDir)
    .filter((f) => f.endsWith(".manifest.json"))
    .map((f) => f.replace(/\.manifest\.json$/, ""));
}

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║       Block Vision Verification Pipeline v2.0       ║");
console.log("║       Vision Model: Antigravity Gemini (native)     ║");
console.log("╚══════════════════════════════════════════════════════╝");

// Ensure .tmp is clean
cleanupTmp();

let browser;
try {
  browser = await chromium.launch({ channel: "msedge", headless: true });
} catch {
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }
}

const slugsToProcess = doAll
  ? discoverSlugs()
  : slugArg
    ? [slugArg]
    : [];

if (slugsToProcess.length === 0) {
  console.error("\n  Usage: node scripts/verify-blocks.mjs --slug=Homepage");
  console.error("         node scripts/verify-blocks.mjs --slug=Homepage --block=block_2");
  console.error("         node scripts/verify-blocks.mjs --all");
  await browser.close();
  process.exit(1);
}

const allResults = {};

for (const slug of slugsToProcess) {
  const results = await verifySlug(slug, blockArg, browser);
  if (results.length > 0) {
    allResults[slug] = results;
    const reportPath = writeReport(slug, results);
    printResults(slug, results);
    console.log(`\n  Report: \x1b[36m${path.relative(rootDir, reportPath)}\x1b[0m`);
  }
}

await browser.close();

// Summary across all slugs
const totalQueued = Object.values(allResults).flat().filter((r) => r.verdict === "QUEUED").length;
const totalSkipped = Object.values(allResults).flat().filter((r) => r.verdict === "SKIPPED").length;
const totalError = Object.values(allResults).flat().filter((r) => r.verdict === "ERROR").length;

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║               VERIFICATION QUEUE READY              ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log(`\n  Blocks queued for Gemini vision review : ${totalQueued}`);
console.log(`  Blocks skipped (HTML not generated)    : ${totalSkipped}`);
if (totalError > 0) console.log(`  Blocks with errors                     : ${totalError}`);
console.log(`\n  Queue files in: dist-preview/.tmp/verify-queue/`);
console.log(`  Each .json file contains the prompt, both image paths,`);
console.log(`  and all block metadata for the Antigravity Gemini agent.\n`);
console.log(`  ⚡ Run the Antigravity vision agent to process the queue.`);
console.log(`     Results will be written back to the manifest + reports.\n`);

// NOTE: .tmp/ is NOT deleted here intentionally.
// The Antigravity Gemini agent needs the crop/render images.
// cleanup-verify-tmp.mjs should be called AFTER the agent finishes.
console.log("  NOTE: dist-preview/.tmp/ preserved for Antigravity Gemini.");
console.log("        Run: node scripts/cleanup-verify-tmp.mjs after verification.\n");
