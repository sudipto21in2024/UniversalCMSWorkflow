/**
 * scripts/scaffold-block-css.mjs
 *
 * Deterministic AST-to-CSS Scaffolder
 * ──────────────────────────────────
 * Extracts mathematical geometry, backdrop blur, padding, and border radius
 * from a confirmed Figma AST node, and outputs or appends a clean, scoped CSS
 * block to src/styles/blocks.css with deterministic boundary comments:
 *
 *   ---------<blockName>--------------
 *   ... scoped styles ...
 *   ---------<blockName>--------------
 *
 * Usage:
 *   node scripts/scaffold-block-css.mjs 27309:223 heroEditorialBlock [--append]
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const blocksCssPath = path.join(rootDir, "src", "styles", "blocks.css");

const args = process.argv.slice(2);
const nodeId = args[0];
const blockName = args[1];
const shouldAppend = args.includes("--append");

if (!nodeId || !blockName) {
  console.error("Usage: node scripts/scaffold-block-css.mjs <figma_node_id> <blockName> [--append]");
  console.error("Example: node scripts/scaffold-block-css.mjs 27309:223 heroEditorialBlock --append");
  process.exit(1);
}

// 1. Extract AST spec
let spec;
try {
  const stdout = execSync(`node scripts/figma-dump.mjs extract-spec ${nodeId}`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  spec = JSON.parse(stdout);
} catch (err) {
  console.error(`❌ Failed to extract AST spec for node "${nodeId}":`, err.message);
  process.exit(1);
}

// 2. Format class name from blockName
const cssSelector = `.block-${blockName.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()).replace(/^-/, "")}`;

// 3. Compile CSS rules
const cssRules = [];
cssRules.push(`/* -------------------------------------------------------------------------- */`);
cssRules.push(`/* ---------${blockName}-------------- */`);
cssRules.push(`/* -------------------------------------------------------------------------- */`);
cssRules.push(`${cssSelector} {`);

if (spec.layout.height && spec.layout.height > 0) {
  cssRules.push(`  min-height: ${spec.layout.height}px;`);
}
if (spec.layout.padding.top > 0) cssRules.push(`  padding-top: ${spec.layout.padding.top}px;`);
if (spec.layout.padding.bottom > 0) cssRules.push(`  padding-bottom: ${spec.layout.padding.bottom}px;`);
if (spec.layout.padding.left > 0) cssRules.push(`  padding-left: ${spec.layout.padding.left}px;`);
if (spec.layout.padding.right > 0) cssRules.push(`  padding-right: ${spec.layout.padding.right}px;`);

cssRules.push(`}`);

// Check interactive components (Buttons, CTAs, Badges)
for (const comp of spec.components || []) {
  const compSelector = `${cssSelector} .${comp.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  cssRules.push(``);
  cssRules.push(`${compSelector} {`);
  const width = comp.width || comp.dimensions?.width || 0;
  const height = comp.height || comp.dimensions?.height || 0;
  if (width > 0) cssRules.push(`  width: ${width}px;`);
  if (height > 0) cssRules.push(`  height: ${height}px;`);
  if (comp.cornerRadius > 0) cssRules.push(`  border-radius: ${comp.cornerRadius}px;`);

  // Solid fill with opacity
  const solidFill = comp.fills?.find((f) => f.type === "SOLID");
  if (solidFill) {
    if (solidFill.opacity < 1 && solidFill.color) {
      // Convert hex to rgba
      const hex = solidFill.color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      cssRules.push(`  background: rgba(${r}, ${g}, ${b}, ${Math.round(solidFill.opacity * 100) / 100});`);
    } else if (solidFill.color) {
      cssRules.push(`  background: ${solidFill.color};`);
    }
  }

  // Blur effects
  const blur = comp.effects?.find((e) => e.type === "BACKGROUND_BLUR");
  if (blur && blur.radius > 0) {
    cssRules.push(`  backdrop-filter: blur(${blur.radius}px);`);
    cssRules.push(`  -webkit-backdrop-filter: blur(${blur.radius}px);`);
  }

  cssRules.push(`}`);
}

cssRules.push(`/* ---------${blockName}-------------- */`);
const generatedCss = cssRules.join("\n") + "\n";

console.log("\nGenerated Block CSS:\n");
console.log(generatedCss);

if (shouldAppend) {
  if (fs.existsSync(blocksCssPath)) {
    const existing = fs.readFileSync(blocksCssPath, "utf-8");
    if (existing.includes(`/* ---------${blockName}-------------- */`)) {
      console.log(`⚠️ Block "${blockName}" already exists in ${blocksCssPath}. Skipping duplicate append.`);
    } else {
      fs.appendFileSync(blocksCssPath, "\n" + generatedCss, "utf-8");
      console.log(`✔ Appended scoped styles for "${blockName}" to ${blocksCssPath}`);
    }
  }
}
