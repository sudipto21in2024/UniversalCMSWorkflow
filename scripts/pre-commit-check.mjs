/**
 * scripts/pre-commit-check.mjs
 *
 * Automated Pre-Commit Iron Gate Guard
 * ──────────────────────────────────────
 * Mechanically enforces non-negotiable repository governance before any Git commit:
 *   1. Rejects commit if any block in inputs/vision/*.manifest.json lacks a figmaNodeId.
 *   2. Rejects commit if any template markup references non-existent local assets.
 *   3. Rejects commit if any DOM health or image structural checks fail.
 *
 * Usage:
 *   node scripts/pre-commit-check.mjs
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const visionDir = path.join(rootDir, "inputs", "vision");
const assetsDir = path.join(rootDir, "assets");
const previewAssetsDir = path.join(rootDir, "dist-preview", "assets");

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║      AUTOMATED PRE-COMMIT QUALITY GATE (IRON GATE)   ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

let hasErrors = false;

// ─── CHECK 1: Figma Node ID Completeness ──────────────────────────────────────
console.log("[1/3] Validating Figma Node ID completeness across manifests...");
if (fs.existsSync(visionDir)) {
  const manifestFiles = fs.readdirSync(visionDir).filter((f) => f.endsWith(".manifest.json"));
  let missingCount = 0;
  let totalBlocks = 0;

  for (const file of manifestFiles) {
    const slug = file.replace(".manifest.json", "");
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(visionDir, file), "utf-8"));
      const blocks = manifest.blocks || {};
      for (const [blockId, blockData] of Object.entries(blocks)) {
        totalBlocks++;
        const nodeId = blockData.figmaNodeId;
        if (!nodeId || typeof nodeId !== "string" || nodeId.trim() === "") {
          console.error(`  ❌ [MISSING NODE ID] ${slug} -> Block "${blockId}" ("${blockData.title || blockId}") has NO Figma Node ID!`);
          missingCount++;
          hasErrors = true;
        }
      }
    } catch (e) {
      console.error(`  ❌ Error reading ${file}:`, e.message);
      hasErrors = true;
    }
  }

  if (missingCount === 0) {
    console.log(`  ✔ All ${totalBlocks} blocks have verified Figma Node IDs.`);
  } else {
    console.error(`  ❌ Total ${missingCount} block(s) missing Figma Node ID. Mandatory protocol: Halt & confirm with user.`);
  }
}

// ─── CHECK 2: Local Asset File Integrity ───────────────────────────────────────
console.log("\n[2/3] Checking local asset references in templates...");
const templateDirs = [
  path.join(rootDir, "dist-preview", "blocks", "unique"),
  path.join(rootDir, "dist-preview", "blocks", "shared"),
];

let brokenAssetCount = 0;
for (const dir of templateDirs) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html") || f.endsWith(".php"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      // Match src="assets/..."
      const assetMatches = content.matchAll(/src=["'](assets\/[^"']+)["']/g);
      for (const match of assetMatches) {
        const relAsset = match[1];
        const localPath1 = path.join(rootDir, relAsset);
        const localPath2 = path.join(previewAssetsDir, path.basename(relAsset));
        const localPath3 = path.join(assetsDir, path.basename(relAsset));

        if (!fs.existsSync(localPath1) && !fs.existsSync(localPath2) && !fs.existsSync(localPath3)) {
          console.error(`  ❌ [MISSING ASSET] ${file} references "${relAsset}", but file does NOT exist on disk!`);
          brokenAssetCount++;
          hasErrors = true;
        }
      }
    }
  }
}

if (brokenAssetCount === 0) {
  console.log("  ✔ All referenced template assets verified on local disk.");
} else {
  console.error(`  ❌ Total ${brokenAssetCount} broken asset reference(s) detected.`);
}

// ─── CHECK 3: DOM Structural Sanity & Image Health ─────────────────────────────
console.log("\n[3/3] Running DOM Structural Sanity & Image Health Audit...");
try {
  execSync("node scripts/audit-dom-health.mjs", { stdio: "inherit" });
  console.log("  ✔ DOM Structural Health Audit passed.");
} catch (e) {
  console.error("  ❌ DOM Structural Health Audit failed:", e.message);
  hasErrors = true;
}

// ─── SUMMARY & VERDICT ─────────────────────────────────────────────────────────
console.log("\n┌────────────────────────────────────────────────────────┐");
if (hasErrors) {
  console.log("│ ❌ PRE-COMMIT GATE: REJECTED                           │");
  console.log("│ Fix the reported errors above before committing code.  │");
  console.log("└────────────────────────────────────────────────────────┘\n");
  process.exit(1);
} else {
  console.log("│ ✔ PRE-COMMIT GATE: PASSED (Repository Clean & Valid)   │");
  console.log("└────────────────────────────────────────────────────────┘\n");
  process.exit(0);
}
