/**
 * scripts/generate-spec-lock.mjs
 *
 * Deterministic Spec Lock Contract Compiler
 * ──────────────────────────────────────────
 * Generates an immutable, mathematical specification contract (.spec.json)
 * for component blocks from offline Figma AST node trees and vision manifests.
 *
 * Usage:
 *   node scripts/generate-spec-lock.mjs --slug=Homepage --block=block_2
 *   node scripts/generate-spec-lock.mjs --all
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const visionDir = path.join(rootDir, "inputs", "vision");
const specsDir = path.join(rootDir, "dist-preview", "specs");

if (!fs.existsSync(specsDir)) {
  fs.mkdirSync(specsDir, { recursive: true });
}

// Derive canonical basename from targetSchema
function toCanonicalBasename(schema) {
  if (!schema) return "unknown-component";
  return schema
    .replace(/^(layout_|global_)/, "")
    .replace(/_/g, "-")
    .replace(/-(shelf|grid|feed|cards|split|banner|options|nav|receipt|table|flow|feature)$/, "");
}

// Map Figma primary/counter axis alignment to Tailwind classes
function mapAlignmentToTailwind(layout) {
  let justify = "justify-start";
  let items = "items-start";

  if (layout.primaryAxisAlignItems === "MAX") justify = "justify-end";
  else if (layout.primaryAxisAlignItems === "CENTER") justify = "justify-center";

  if (layout.counterAxisAlignItems === "MAX") items = "items-end";
  else if (layout.counterAxisAlignItems === "CENTER") items = "items-center";

  return { justify, items };
}

// CLI args
const args = process.argv.slice(2);
const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const blockArg = args.find((a) => a.startsWith("--block="))?.split("=")[1];
const isAll = args.includes("--all");

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║     DETERMINISTIC SPEC LOCK CONTRACT COMPILER        ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

function compileBlockSpec(slug, blockId, blockData) {
  const figmaNodeId = blockData.figmaNodeId || blockData.figmaNodeMap?.nodeId;
  const blockTitle = blockData.title || blockId;

  // STRICT HALT on missing node ID
  if (!figmaNodeId || typeof figmaNodeId !== "string" || figmaNodeId.trim() === "") {
    console.error(`❌ [STRICT HALT] Block "${blockId}" ("${blockTitle}") on "${slug}" has NO Figma Node ID.`);
    console.error(`   Mandatory Protocol: Missing or ambiguous node IDs require explicit user confirmation.`);
    return false;
  }

  // Extract raw AST spec using figma-dump.mjs
  let rawSpec;
  try {
    const stdout = execSync(`node scripts/figma-dump.mjs extract-spec ${figmaNodeId}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    rawSpec = JSON.parse(stdout);
  } catch (err) {
    console.error(`❌ Failed to extract AST spec for node "${figmaNodeId}":`, err.message);
    return false;
  }

  const canonicalName = toCanonicalBasename(blockData.targetSchema || blockTitle);
  const tailwindAlign = mapAlignmentToTailwind(rawSpec.layout);

  // Build the complete, deterministic Spec Lock Contract
  const specLockContract = {
    $schema: "https://universal-cms.workflow/schemas/component-spec.v1.json",
    meta: {
      canonicalName,
      blockId,
      pageSlug: slug,
      title: blockTitle,
      classification: blockData.classification || "Unique",
      targetSchema: blockData.targetSchema || "unknown",
      figmaNodeId,
      generatedAt: new Date().toISOString(),
      compilerVersion: "1.0.0",
    },
    layout: {
      dimensions: {
        width: rawSpec.layout.width,
        minHeight: rawSpec.layout.height,
      },
      alignment: {
        primaryAxis: rawSpec.layout.primaryAxisAlignItems,
        counterAxis: rawSpec.layout.counterAxisAlignItems,
        tailwindJustify: tailwindAlign.justify,
        tailwindItems: tailwindAlign.items,
      },
      padding: rawSpec.layout.padding,
      gap: rawSpec.layout.itemSpacing,
    },
    typography: rawSpec.typography.map((t) => ({
      layerId: t.id,
      layerName: t.name,
      text: t.text,
      fontFamily: t.fontFamily,
      fontWeight: t.fontWeight,
      fontSize: t.fontSize,
      letterSpacing: t.letterSpacing !== 0 ? `${t.letterSpacing / 100}em` : "normal",
      lineHeight: t.lineHeight,
      color: t.color || "#000000",
    })),
    components: rawSpec.components.map((c) => ({
      layerId: c.id,
      componentName: c.name,
      type: c.type,
      dimensions: { width: c.width, height: c.height },
      cornerRadius: c.cornerRadius,
      padding: c.padding,
      fills: c.fills,
      effects: c.effects,
      label: c.label,
    })),
    assets: rawSpec.assets || [],
    notes: blockData.notes || "",
    keyFields: blockData.keyFields || [],
  };

  const outputPath = path.join(specsDir, `${canonicalName}.spec.json`);
  fs.writeFileSync(outputPath, JSON.stringify(specLockContract, null, 2), "utf-8");

  console.log(`  ✔ Compiled Spec Lock: dist-preview/specs/${canonicalName}.spec.json`);
  console.log(`    ↳ Node ID: ${figmaNodeId} | Layout: ${tailwindAlign.justify} ${tailwindAlign.items} | Typo Layers: ${rawSpec.typography.length}`);
  return true;
}

if (isAll) {
  const manifestFiles = fs.readdirSync(visionDir).filter((f) => f.endsWith(".manifest.json"));
  let totalCompiled = 0;
  let totalHalted = 0;

  for (const file of manifestFiles) {
    const slug = file.replace(".manifest.json", "");
    const manifest = JSON.parse(fs.readFileSync(path.join(visionDir, file), "utf-8"));
    const blocks = manifest.blocks || {};

    console.log(`Processing screen: ${slug} (${Object.keys(blocks).length} blocks)...`);
    for (const [blockId, blockData] of Object.entries(blocks)) {
      if (blockData.figmaNodeId) {
        const ok = compileBlockSpec(slug, blockId, blockData);
        if (ok) totalCompiled++;
        else totalHalted++;
      }
    }
  }

  console.log(`\n=======================================================`);
  console.log(`Spec Lock Compilation Complete: ${totalCompiled} compiled, ${totalHalted} halted.`);
  console.log(`=======================================================\n`);
} else if (slugArg && blockArg) {
  const manifestPath = path.join(visionDir, `${slugArg}.manifest.json`);
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const blockData = manifest.blocks?.[blockArg];
  if (!blockData) {
    console.error(`Block "${blockArg}" not found in ${manifestPath}`);
    process.exit(1);
  }

  const ok = compileBlockSpec(slugArg, blockArg, blockData);
  if (!ok) process.exit(1);
} else {
  console.error("Usage:");
  console.error("  node scripts/generate-spec-lock.mjs --slug=<page_slug> --block=<block_id>");
  console.error("  node scripts/generate-spec-lock.mjs --all");
  process.exit(1);
}
