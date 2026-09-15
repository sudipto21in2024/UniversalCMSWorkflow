/**
 * scripts/verify-and-fix.mjs
 *
 * Closed-Loop Block Verification & Quality Gate
 * ──────────────────────────────────────────────
 * Runs an end-to-end verification pass for a component block:
 *   1. Compiles preview HTML (assemble-preview.mjs)
 *   2. Captures crop & Playwright render (verify-blocks.mjs)
 *   3. Evaluates visual match score (evaluate-verify-queue.mjs)
 *   4. Reports issues & gate verdict
 *
 * Usage:
 *   node scripts/verify-and-fix.mjs --slug=Homepage --block=block_2
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const args = process.argv.slice(2);
const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const blockArg = args.find((a) => a.startsWith("--block="))?.split("=")[1];

if (!slugArg || !blockArg) {
  console.error("Usage: node scripts/verify-and-fix.mjs --slug=<page_slug> --block=<block_id>");
  process.exit(1);
}

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log(`║      Closed-Loop Verification Gate: ${slugArg} (${blockArg})      ║`);
console.log("╚══════════════════════════════════════════════════════╝\n");

// Step 1: Re-assemble HTML preview
console.log("[1/3] Assembling HTML previews...");
try {
  execSync("node scripts/assemble-preview.mjs", { stdio: "inherit" });
} catch (e) {
  console.error("Failed to assemble previews:", e.message);
  process.exit(1);
}

// Step 2: Render & Crop
console.log(`\n[2/3] Capturing Playwright render & Figma design crop for ${blockArg}...`);
try {
  execSync(`node scripts/verify-blocks.mjs --slug=${slugArg} --block=${blockArg}`, { stdio: "inherit" });
} catch (e) {
  console.error("Failed to capture verification images:", e.message);
  process.exit(1);
}

// Step 3: Evaluate
console.log(`\n[3/3] Evaluating visual parity against design tokens...`);
try {
  execSync(`node scripts/evaluate-verify-queue.mjs --slug=${slugArg} --block=${blockArg}`, { stdio: "inherit" });
} catch (e) {
  console.error("Evaluation failed:", e.message);
  process.exit(1);
}

// Check final manifest status
const manifestPath = path.join(rootDir, "inputs", "vision", `${slugArg}.manifest.json`);
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const block = manifest.blocks?.[blockArg];
  if (block) {
    const status = block.status;
    console.log("\n┌────────────────────────────────────────────────────────┐");
    console.log(`│ BLOCK VERIFICATION GATE SUMMARY                        │`);
    console.log("├────────────────────────────────────────────────────────┤");
    console.log(`│ Block ID    : ${blockArg.padEnd(39)} │`);
    console.log(`│ Title       : ${(block.title || "").slice(0, 39).padEnd(39)} │`);
    console.log(`│ Score       : ${(status.verificationScore != null ? `${status.verificationScore}%` : "Awaiting Agent").padEnd(39)} │`);
    console.log(`│ Verdict     : ${(status.verificationVerdict || "PENDING").padEnd(39)} │`);
    console.log(`│ Verified    : ${(status.visualVerified ? "YES (Ready for Delivery)" : "NO").padEnd(39)} │`);
    console.log("└────────────────────────────────────────────────────────┘\n");

    if (status.verificationVerdict === "FAIL") {
      console.error("❌ Quality gate failed. Review issues in dist-preview/reports/ and repair block.");
      process.exit(1);
    }
  }
}
