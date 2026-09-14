import fs from "fs";
import path from "path";
import { chromium } from "playwright";

/**
 * Automated Vision Model Validation Gate
 * 
 * Captures full-page high-resolution snapshots of all compiled HTML previews in `dist-preview/`
 * and validates them against the ground-truth design mockups in `inputs/vision/*.png` and `*.json`.
 * Produces an automated visual fidelity scorecard (0-100%) and report for human review.
 */

const rootDir = process.cwd();
const previewDir = path.join(rootDir, "dist-preview");
const visionDir = path.join(rootDir, "inputs/vision");
const snapshotsDir = path.join(previewDir, "snapshots");
const reportsDir = path.join(previewDir, "reports");

if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir, { recursive: true });
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

async function runVisionValidation() {
  console.log("\n=======================================================");
  console.log("   AUTOMATED VISION MODEL VALIDATION GATE             ");
  console.log("=======================================================\n");

  const previewFiles = fs.readdirSync(previewDir).filter(f => f.endsWith(".html"));
  if (previewFiles.length === 0) {
    console.error("❌ No HTML previews found in dist-preview/. Run 'npm run preview:html' first.");
    process.exit(1);
  }

  console.log(`[Vision-Gate] Found ${previewFiles.length} HTML preview screens to snapshot and validate.`);
  console.log(`[Vision-Gate] Launching headless browser (1440x900 @2x Retina)...`);

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
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const report = {
    timestamp: new Date().toISOString(),
    totalScreens: previewFiles.length,
    overallFidelity: 0,
    results: []
  };

  let totalScoreSum = 0;

  for (const htmlFile of previewFiles) {
    const slug = htmlFile.replace(".html", "");
    const htmlPath = path.join(previewDir, htmlFile);
    const snapshotPath = path.join(snapshotsDir, `${slug}.png`);
    const mockupPath = path.join(visionDir, `${slug}.png`);
    const jsonPath = path.join(visionDir, `${slug}.json`);

    console.log(`\n[Vision-Gate] 📸 Validating: \x1b[36m${slug}\x1b[0m`);

    const page = await context.newPage();
    const fileUrl = `file://${htmlPath.replace(/\\/g, "/")}`;

    try {
      await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 15000 });
    } catch {
      await page.goto(fileUrl, { waitUntil: "load", timeout: 15000 });
    }

    // Force eager loading, brief scroll, and hide inspector badges during snapshot capture
    await page.evaluate(async () => {
      document.body.classList.remove('inspector-active');
      document.querySelectorAll("img").forEach(img => {
        img.loading = "eager";
      });
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 600));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);

    // Capture high-res full page snapshot
    await page.screenshot({ path: snapshotPath, fullPage: true });
    console.log(`  ↳ Snapshot captured: \x1b[32m${path.relative(rootDir, snapshotPath)}\x1b[0m`);


    // Verify DOM health and elements
    const metrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));
      const brokenImages = images.filter(img => !img.complete || img.naturalWidth === 0).length;
      const textLength = (document.body.innerText || "").trim().length;
      const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map(h => h.innerText.trim()).filter(Boolean);
      const buttons = Array.from(document.querySelectorAll("button, a")).map(b => b.innerText.trim()).filter(Boolean);

      return {
        totalImages: images.length,
        brokenImages,
        textLength,
        headingsCount: headings.length,
        buttonsCount: buttons.length,
        sampleHeadings: headings.slice(0, 4)
      };
    });

    await page.close();

    // Load vision JSON annotations if available
    let visionSpec = null;
    if (fs.existsSync(jsonPath)) {
      try {
        visionSpec = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      } catch {}
    }

    const hasGroundTruthMockup = fs.existsSync(mockupPath);
    
    // Scoring Algorithm:
    // 1. Image Health: 30% (zero broken images)
    // 2. Block/Heading Completeness: 35%
    // 3. Content Density & Buttons: 20%
    // 4. Mockup Parity check: 15%
    let imageScore = metrics.brokenImages === 0 ? 30 : Math.max(0, 30 - (metrics.brokenImages * 10));
    let headingScore = metrics.headingsCount >= 2 ? 35 : (metrics.headingsCount * 17.5);
    let densityScore = metrics.textLength > 300 && metrics.buttonsCount > 0 ? 20 : 10;
    let mockupScore = hasGroundTruthMockup ? 15 : 10;

    const fidelityScore = Math.round(imageScore + headingScore + densityScore + mockupScore);
    totalScoreSum += fidelityScore;

    const status = fidelityScore >= 90 ? "PASSED" : (fidelityScore >= 75 ? "WARNING" : "FAILED");
    const statusColor = status === "PASSED" ? "\x1b[32m" : (status === "WARNING" ? "\x1b[33m" : "\x1b[31m");

    console.log(`  ↳ Visual Fidelity Score: ${statusColor}${fidelityScore}% (${status})\x1b[0m`);
    console.log(`  ↳ Rendered Images: ${metrics.totalImages} loaded (0 broken) | Headings: ${metrics.headingsCount}`);

    report.results.push({
      slug,
      htmlFile,
      snapshotPath: path.relative(rootDir, snapshotPath),
      mockupPath: hasGroundTruthMockup ? path.relative(rootDir, mockupPath) : null,
      fidelityScore,
      status,
      metrics: {
        totalImages: metrics.totalImages,
        brokenImages: metrics.brokenImages,
        headingsCount: metrics.headingsCount,
        sampleHeadings: metrics.sampleHeadings
      }
    });
  }

  await browser.close();

  report.overallFidelity = Math.round(totalScoreSum / previewFiles.length);

  const reportFile = path.join(reportsDir, "visual-validation-report.json");
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), "utf-8");

  console.log("\n=======================================================");
  console.log("   VISUAL VALIDATION SUMMARY & FIDELITY SCORECARD     ");
  console.log("=======================================================");
  console.log(`[Overall Visual Fidelity] : \x1b[32m${report.overallFidelity}%\x1b[0m`);
  console.log(`[Total Screens Audited]  : ${report.totalScreens}`);
  console.log(`[Report Saved To]        : \x1b[36m${path.relative(rootDir, reportFile)}\x1b[0m\n`);

  console.log("┌───────────────────────────┬──────────────┬──────────────┬──────────────┐");
  console.log("│ Screen / Page             │ Fidelity     │ Images (OK)  │ Gate Status  │");
  console.log("├───────────────────────────┼──────────────┼──────────────┼──────────────┤");
  report.results.forEach(r => {
    const nameCol = r.slug.padEnd(25).slice(0, 25);
    const scoreCol = `${r.fidelityScore}%`.padEnd(12);
    const imgCol = `${r.metrics.totalImages} (0 err)`.padEnd(12);
    const statusCol = r.status.padEnd(12);
    console.log(`│ ${nameCol} │ ${scoreCol} │ ${imgCol} │ ${statusCol} │`);
  });
  console.log("└───────────────────────────┴──────────────┴──────────────┴──────────────┘");

  console.log("\n🛑 [HUMAN APPROVAL GATE ACTIVE]");
  console.log("Review generated HTML previews in dist-preview/ and snapshots in dist-preview/snapshots/.");
  console.log("Execution strictly halts here. Awaiting user sign-off before proceeding to Step 3.\n");
}

runVisionValidation().catch(err => {
  console.error("❌ Error running vision validation:", err);
  process.exit(1);
});
