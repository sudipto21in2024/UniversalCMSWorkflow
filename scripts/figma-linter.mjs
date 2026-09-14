// scripts/figma-linter.mjs
import fs from "node:fs";
import path from "node:path";
import { printHeader, printStep, printErrorBanner, printSummaryCard, colors } from "./reporter.mjs";

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

function validateEnvironment() {
  if (!FIGMA_TOKEN || FIGMA_TOKEN.trim() === "" || FIGMA_TOKEN.includes("figd_your_actual_token_here")) {
    printErrorBanner({
      title: "Missing Figma Access Token",
      message: "FIGMA_ACCESS_TOKEN is not configured or contains placeholder value in .env.local",
      context: "Figma API requests require a valid Personal Access Token.",
      fix: "Add `FIGMA_ACCESS_TOKEN=figd_...` to your `.env.local` file and rerun.",
    });
    process.exit(1);
  }
}

function parseFigmaUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Missing Figma URL parameter.");
  }
  const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
  const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
  if (!fileKeyMatch) {
    throw new Error("Invalid Figma URL format: Could not extract File Key from URL.");
  }
  return {
    fileKey: fileKeyMatch[1],
    nodeId: nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace("-", ":") : null,
  };
}

async function fetchFigmaNodes(fileKey, nodeId) {
  const endpoint = nodeId
    ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
    : `https://api.figma.com/v1/files/${fileKey}`;

  let res;
  try {
    res = await fetch(endpoint, {
      headers: { "X-Figma-Token": FIGMA_TOKEN },
    });
  } catch (netErr) {
    throw new Error(`Network connection error while contacting Figma API: ${netErr.message}`);
  }

  if (!res.ok) {
    const errorBody = await res.text();
    let hint = "Check file permissions and access token.";
    if (res.status === 401 || res.status === 403) {
      hint = "Your FIGMA_ACCESS_TOKEN may be expired or lack permissions to read this file.";
    } else if (res.status === 404) {
      hint = `File Key "${fileKey}" or Node ID "${nodeId}" was not found in Figma.`;
    } else if (res.status === 429) {
      hint = "Figma API rate limit exceeded. Please wait a few moments before retrying.";
    }
    const err = new Error(`Figma API returned HTTP ${res.status}: ${errorBody}`);
    err.status = res.status;
    err.hint = hint;
    throw err;
  }

  return res.json();
}

function rgbToHex(c) {
  if (!c) return "#000000";
  const r = Math.round(c.r * 255).toString(16).padStart(2, "0");
  const g = Math.round(c.g * 255).toString(16).padStart(2, "0");
  const b = Math.round(c.b * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`.toUpperCase();
}

const issues = {
  critical: [],
  warning: [],
  info: [],
};

let nodesAudited = 0;

function auditNode(node, parent = null) {
  if (!node) return;
  nodesAudited++;
  const nodeName = node.name || "Unnamed Layer";
  const nodeType = node.type;

  // 1. Raw Groups (Triggers coordinate-based positioning bug)
  if (nodeType === "GROUP") {
    issues.critical.push({
      node: nodeName,
      id: node.id,
      rule: "Raw Group Detected",
      message: "Group does not use Auto Layout. Needs Flexbox/Grid conversion.",
    });
  }

  // 2. Missing Auto Layout on Multi-Child Frames
  if (nodeType === "FRAME" && !node.layoutMode && node.children && node.children.length > 1) {
    if (parent && parent.type !== "DOCUMENT" && parent.type !== "CANVAS") {
      issues.critical.push({
        node: nodeName,
        id: node.id,
        rule: "Missing Auto Layout",
        message: "Frame has multiple children without Flexbox layout mode. Risks absolute positioning.",
      });
    }
  }

  // 3. Fixed Dimensions on Dynamic Text
  if (nodeType === "TEXT" && node.textAutoResize === "NONE") {
    issues.warning.push({
      node: nodeName,
      id: node.id,
      rule: "Fixed Text Bounds",
      message: "Text bounding box is fixed. Long dynamic strings will overflow or truncate abruptly.",
    });
  }

  // 4. Detached Hardcoded Fills
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach((fill) => {
      if (fill.type === "SOLID" && fill.visible !== false) {
        const isBound = node.styles?.fill || node.boundVariables?.fills;
        const hex = rgbToHex(fill.color);
        if (!isBound && !["#FFFFFF", "#000000"].includes(hex)) {
          issues.warning.push({
            node: nodeName,
            id: node.id,
            rule: "Detached Raw Color",
            message: `Uses unlinked raw color (${hex}). Map to a design token.`,
          });
        }
      }
    });
  }

  // 5. Interactive Component Sets Missing Error / Disabled States
  if (nodeType === "COMPONENT_SET") {
    const variantNames = (node.children || []).map((c) => (c.name || "").toLowerCase());
    const isInputOrButton = /input|field|select|button|dropdown/i.test(nodeName);

    if (isInputOrButton) {
      const hasErrorState = variantNames.some((v) => v.includes("error") || v.includes("invalid"));
      const hasDisabledState = variantNames.some((v) => v.includes("disabled"));
      if (!hasErrorState && /input|field|select/i.test(nodeName)) {
        issues.warning.push({
          node: nodeName,
          id: node.id,
          rule: "Missing Error State Variant",
          message: "Input Component Set has no 'Error' or 'Invalid' state variant.",
        });
      }
      if (!hasDisabledState) {
        issues.info.push({
          node: nodeName,
          id: node.id,
          rule: "Missing Disabled State Variant",
          message: "Component Set has no 'Disabled' state variant.",
        });
      }
    }
  }

  // 6. Unsemantic Layer Names
  const unsemanticPattern = /^(Frame|Group|Rectangle|Vector|Ellipse|Component|Instance)\s*\d+$/i;
  if (unsemanticPattern.test(nodeName.trim())) {
    issues.info.push({
      node: nodeName,
      id: node.id,
      rule: "Unsemantic Layer Name",
      message: `Layer '${nodeName}' lacks descriptive naming for code generation.`,
    });
  }

  if (node.children) {
    node.children.forEach((child) => auditNode(child, node));
  }
}

async function run() {
  const args = process.argv.slice(2);
  const dumpArgIndex = args.indexOf("--dump-path");
  const dumpPath = dumpArgIndex !== -1 ? args[dumpArgIndex + 1] : (args.includes("--offline") ? "Docs/DirectDataDump" : null);
  const nonFlagArgs = args.filter((a, i) => !a.startsWith("--") && (dumpArgIndex === -1 || (i !== dumpArgIndex && i !== dumpArgIndex + 1)));

  const figmaUrl = nonFlagArgs[0] || (dumpPath ? "offline-dump" : null);

  printHeader("Figma Pre-Flight Linter", "Auditing design tokens, auto-layout constraints, and typography (Direct Dump / API)");

  if (dumpPath) {
    console.log(`\n🛡️ [Rate Limit Protection Active] Auditing offline dump from: ${dumpPath}`);
    const resolvedDumpPath = path.isAbsolute(dumpPath) ? dumpPath : path.join(process.cwd(), dumpPath);
    
    // Find json files in dump directory
    const findJsonFiles = (dir) => {
      let results = [];
      if (!fs.existsSync(dir)) return results;
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results = results.concat(findJsonFiles(full));
        } else if (file.endsWith(".json") && !file.includes("VariablesModes")) {
          results.push(full);
        }
      }
      return results;
    };

    const jsonFiles = findJsonFiles(resolvedDumpPath);
    if (jsonFiles.length === 0) {
      printErrorBanner({
        title: "No Dump JSON Found",
        message: `Could not find any Figma JSON data files in "${dumpPath}".`,
        context: "Expected exported node/document JSON file.",
        fix: "Check that the dump folder contains the Figma JSON export file.",
      });
      process.exit(1);
    }

    const targetJsonPath = jsonFiles[0];
    printStep(1, 2, "Loading Offline Dump Hierarchy", path.relative(process.cwd(), targetJsonPath));
    const data = JSON.parse(fs.readFileSync(targetJsonPath, "utf-8"));
    const rootNode = data.nodes ? Object.values(data.nodes)[0]?.document : (data.document || data);

    printStep(2, 2, "Executing Structural Design Audits", "Evaluating local offline node tree...");
    auditNode(rootNode);

    console.log(`\n${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}             FIGMA PRE-FLIGHT AUDIT REPORT (OFFLINE)        ${colors.reset}`);
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);

    if (issues.critical.length > 0) {
      console.log(`${colors.red}${colors.bold}⛔ CRITICAL ISSUES (${issues.critical.length}):${colors.reset}`);
      issues.critical.forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${colors.red}${item.rule}${colors.reset}] "${colors.bold}${item.node}${colors.reset}" (ID: ${item.id})`);
        console.log(`     ↳ ${item.message}`);
      });
      console.log();
    }

    if (issues.warning.length > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠ WARNINGS (${issues.warning.length}):${colors.reset}`);
      issues.warning.forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${colors.yellow}${item.rule}${colors.reset}] "${colors.bold}${item.node}${colors.reset}" (ID: ${item.id})`);
        console.log(`     ↳ ${item.message}`);
      });
      console.log();
    }

    printSummaryCard("LINTER SUMMARY (OFFLINE)", [
      ["Nodes Audited", nodesAudited],
      ["Critical Issues", `${issues.critical.length > 0 ? colors.red : colors.green}${issues.critical.length}${colors.reset}`],
      ["Warnings", `${issues.warning.length > 0 ? colors.yellow : colors.green}${issues.warning.length}${colors.reset}`],
      ["Status", issues.critical.length > 0 ? `${colors.red}FAIL (Action Required)${colors.reset}` : `${colors.green}READY FOR CODEGEN${colors.reset}`],
    ]);

    process.exit(issues.critical.length > 0 ? 1 : 0);
  }

  if (!figmaUrl) {
    printErrorBanner({
      title: "Missing Required Argument",
      message: "No Figma URL or Dump Path provided.",
      context: "Usage: npm run figma:lint <FIGMA_URL> OR npm run figma:lint --dump-path Docs/DirectDataDump",
      fix: 'Provide a Figma URL or use `--dump-path <folder>` to audit offline.',
    });
    process.exit(1);
  }

  validateEnvironment();

  try {
    printStep(1, 3, "Parsing Figma URL", figmaUrl);
    const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
    console.log(`    ${colors.dim}↳ File Key: ${fileKey} | Target Node: ${nodeId || "Root Canvas"}${colors.reset}`);

    printStep(2, 3, "Fetching Document Hierarchy from Figma API", `Querying API endpoint for file: ${fileKey}`);
    const data = await fetchFigmaNodes(fileKey, nodeId);
    const rootNode = nodeId ? data.nodes[nodeId]?.document : data.document;
    if (!rootNode) {
      throw new Error(`Could not find document node for ID: "${nodeId}" in file: "${fileKey}".`);
    }

    printStep(3, 3, "Executing Structural Design Audits", "Evaluating auto-layout, colors, typography bounds, and variant states");
    auditNode(rootNode);

    console.log(`\n${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}             FIGMA PRE-FLIGHT AUDIT REPORT                  ${colors.reset}`);
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);

    if (issues.critical.length > 0) {
      console.log(`${colors.red}${colors.bold}⛔ CRITICAL ISSUES (${issues.critical.length}):${colors.reset}`);
      issues.critical.forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${colors.red}${item.rule}${colors.reset}] "${colors.bold}${item.node}${colors.reset}" (ID: ${item.id})`);
        console.log(`     ↳ ${item.message}`);
      });
      console.log();
    }

    if (issues.warning.length > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠ WARNINGS (${issues.warning.length}):${colors.reset}`);
      issues.warning.forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${colors.yellow}${item.rule}${colors.reset}] "${colors.bold}${item.node}${colors.reset}" (ID: ${item.id})`);
        console.log(`     ↳ ${item.message}`);
      });
      console.log();
    }

    if (issues.info.length > 0) {
      console.log(`${colors.cyan}${colors.bold}ℹ RECOMMENDATIONS (${issues.info.length}):${colors.reset}`);
      issues.info.forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${colors.cyan}${item.rule}${colors.reset}] "${colors.bold}${item.node}${colors.reset}" (ID: ${item.id})`);
        console.log(`     ↳ ${item.message}`);
      });
      console.log();
    }

    printSummaryCard("LINTER SUMMARY", [
      ["Nodes Audited", nodesAudited],
      ["Critical Issues", `${issues.critical.length > 0 ? colors.red : colors.green}${issues.critical.length}${colors.reset}`],
      ["Warnings", `${issues.warning.length > 0 ? colors.yellow : colors.green}${issues.warning.length}${colors.reset}`],
      ["Recommendations", issues.info.length],
      ["Status", issues.critical.length > 0 ? `${colors.red}FAIL (Action Required)${colors.reset}` : `${colors.green}READY FOR CODEGEN${colors.reset}`],
    ]);

    process.exit(issues.critical.length > 0 ? 1 : 0);
  } catch (err) {
    printErrorBanner({
      title: "Figma Linter Execution Failed",
      message: err.message,
      context: figmaUrl,
      fix: err.hint || "Verify Figma URL and ensure FIGMA_ACCESS_TOKEN is valid.",
    });
    process.exit(1);
  }
}

run();
