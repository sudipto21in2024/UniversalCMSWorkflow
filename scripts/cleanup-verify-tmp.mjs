/**
 * scripts/cleanup-verify-tmp.mjs
 *
 * Deletes the dist-preview/.tmp/ directory after the Antigravity Gemini
 * vision agent has finished processing the verify-queue.
 *
 * Run this manually after the agent has written results back to the manifests:
 *   node scripts/cleanup-verify-tmp.mjs
 */

import fs from "fs";
import path from "path";

const tmpDir = path.join(process.cwd(), "dist-preview", ".tmp");

if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log("✓ dist-preview/.tmp/ deleted.");
} else {
  console.log("  dist-preview/.tmp/ not found — nothing to clean up.");
}
