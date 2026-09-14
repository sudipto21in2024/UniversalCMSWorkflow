import fs from "fs";
import path from "path";

/**
 * Asset Tree-Shaker & Purger
 * Scans client source files (src/) for referenced figma-assets and removes unused files.
 */
export function cleanUnusedAssets({ dryRun = false } = {}) {
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, "src");
  const assetsDir = path.join(rootDir, "public", "figma-assets");

  if (!fs.existsSync(assetsDir)) {
    console.log("[Asset-Cleaner] No public/figma-assets directory found.");
    return { scanned: 0, removed: 0 };
  }

  // 1. Gather all files in src/
  function getCodeFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        files = files.concat(getCodeFiles(full));
      } else if (/\.(tsx|ts|jsx|js|css|json)$/i.test(item)) {
        files.push(full);
      }
    }
    return files;
  }

  const codeFiles = getCodeFiles(srcDir);
  const aggregatedCodeContent = codeFiles
    .map((f) => fs.readFileSync(f, "utf-8"))
    .join("\n");

  // 2. Gather all downloaded assets
  function getAssetFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        files = files.concat(getAssetFiles(full));
      } else {
        files.push(full);
      }
    }
    return files;
  }

  const assetFiles = getAssetFiles(assetsDir);
  let kept = 0;
  let removed = 0;
  const removedList = [];

  for (const assetPath of assetFiles) {
    const filename = path.basename(assetPath);
    // Check if filename is mentioned in any code file
    if (aggregatedCodeContent.includes(filename)) {
      kept++;
    } else {
      removed++;
      removedList.push(assetPath);
      if (!dryRun) {
        fs.unlinkSync(assetPath);
      }
    }
  }

  console.log(`[Asset-Cleaner] Scanned ${assetFiles.length} assets.`);
  console.log(`[Asset-Cleaner] Referenced & Kept: ${kept}`);
  console.log(`[Asset-Cleaner] Unreferenced: ${removed}`);
  if (removed > 0) {
    console.log(`[Asset-Cleaner] ${dryRun ? "Would remove:" : "Removed:"}`);
    removedList.slice(0, 10).forEach((f) => console.log(` - ${path.basename(f)}`));
    if (removedList.length > 10) {
      console.log(` ... and ${removedList.length - 10} more`);
    }
  }

  return { scanned: assetFiles.length, kept, removed, removedList };
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith("clean-assets.mjs")) {
  const isDryRun = process.argv.includes("--dry-run");
  cleanUnusedAssets({ dryRun: isDryRun });
}
