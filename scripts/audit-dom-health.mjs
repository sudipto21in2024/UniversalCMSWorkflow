import fs from "fs";
import path from "path";
import { chromium } from "playwright";

/**
 * DOM Structural Sanity & Tag Health Audit
 * 
 * Audits compiled HTML previews in `dist-preview/` for DOM sanity:
 * - Broken images (naturalWidth === 0)
 * - Empty headings or missing text
 * - Basic accessibility structure
 * 
 * Note: Visual pixel fidelity is verified by `verify-blocks.mjs`.
 */

const rootDir = process.cwd();
const previewDir = path.join(rootDir, "dist-preview");
const reportsDir = path.join(previewDir, "reports");

if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

async function runDomAudit() {
  console.log("\n=======================================================");
  console.log("   DOM STRUCTURAL SANITY & IMAGE HEALTH AUDIT         ");
  console.log("=======================================================\n");

  const previewFiles = fs.readdirSync(previewDir).filter((f) => f.endsWith(".html"));
  if (previewFiles.length === 0) {
    console.error("❌ No HTML previews found in dist-preview/. Run 'npm run preview:html' first.");
    process.exit(1);
  }

  console.log(`[DOM-Audit] Auditing ${previewFiles.length} preview screens for DOM integrity...`);

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

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  for (const htmlFile of previewFiles) {
    const slug = htmlFile.replace(".html", "");
    const htmlPath = path.join(previewDir, htmlFile);

    const page = await context.newPage();
    const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

    try {
      await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 15000 });
    } catch {
      await page.goto(fileUrl, { waitUntil: "load", timeout: 15000 });
    }

    // Force eager loading and brief scroll to trigger any lazy images
    await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 600));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(600);

    const metrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));
      const brokenImages = images.filter((img) => !img.complete || img.naturalWidth === 0).length;
      const textLength = (document.body.innerText || "").trim().length;
      const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map((h) => h.innerText.trim()).filter(Boolean);
      const buttons = Array.from(document.querySelectorAll("button, a")).map((b) => b.innerText.trim()).filter(Boolean);

      return {
        totalImages: images.length,
        brokenImages,
        textLength,
        headingsCount: headings.length,
        buttonsCount: buttons.length,
      };
    });

    await page.close();

    const isHealthy = metrics.brokenImages === 0 && metrics.headingsCount > 0 && metrics.textLength > 100;
    results.push({ slug, htmlFile, isHealthy, metrics });

    const statusColor = isHealthy ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    console.log(`  • ${slug.padEnd(25)} : ${statusColor} (Images: ${metrics.totalImages}, Broken: ${metrics.brokenImages}, Headings: ${metrics.headingsCount})`);
  }

  await browser.close();

  const allPassed = results.every((r) => r.isHealthy);
  console.log("\n=======================================================");
  console.log(`DOM Health Audit Result: ${allPassed ? "100% HEALTHY" : "DEFECTS DETECTED"}`);
  console.log("=======================================================\n");

  if (!allPassed) process.exit(1);
}

runDomAudit().catch((err) => {
  console.error("DOM audit error:", err);
  process.exit(1);
});
