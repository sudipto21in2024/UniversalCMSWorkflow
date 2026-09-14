// scripts/audit-tokens.mjs
import fs from "node:fs";
import path from "node:path";
import { printHeader, printStep, printErrorBanner, printSummaryCard, badges, colors } from "./reporter.mjs";

const TARGET_DIRS = ["src/app", "src/components", "src/modules"];
const EXTENSIONS = [".tsx", ".jsx", ".ts", ".js"];
const IS_FIX_MODE = process.argv.includes("--fix");

// Standard Tailwind Scale for common pixel measurements
const PIXEL_SCALE_MAP = {
  "1px": "px",
  "2px": "0.5",
  "4px": "1",
  "6px": "1.5",
  "8px": "2",
  "10px": "2.5",
  "12px": "3",
  "14px": "3.5",
  "16px": "4",
  "20px": "5",
  "24px": "6",
  "28px": "7",
  "32px": "8",
  "40px": "10",
  "48px": "12",
  "56px": "14",
  "64px": "16",
  "80px": "20",
  "96px": "24",
};

/**
 * Parses src/styles/tokens.css to extract official design tokens
 */
function loadTokensCss() {
  const tokensPath = path.resolve(process.cwd(), "src/styles/tokens.css");
  const tokenMap = {}; // hex/value -> semantic class name
  if (!fs.existsSync(tokensPath)) return tokenMap;

  const content = fs.readFileSync(tokensPath, "utf-8");
  const varRegex = /--([a-zA-Z0-9_-]+):\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(content)) !== null) {
    const varName = match[1].trim();
    const varValue = match[2].trim().toLowerCase();

    // Map common CSS variables to Tailwind extension tokens
    if (varName === "color-primary") tokenMap[varValue] = "primary";
    if (varName === "bg-surface") tokenMap[varValue] = "surface";
    if (varName === "bg-surface-subtle") tokenMap[varValue] = "surface-subtle";
    if (varName === "bg-surface-muted") tokenMap[varValue] = "surface-muted";
    if (varName === "bg-app") tokenMap[varValue] = "app";
    if (varName === "border-default") tokenMap[varValue] = "border";
    if (varName === "border-subtle") tokenMap[varValue] = "border-subtle";
    if (varName === "text-primary") tokenMap[varValue] = "content-primary";
    if (varName === "text-secondary") tokenMap[varValue] = "content-secondary";
    if (varName === "text-muted") tokenMap[varValue] = "content-muted";
    if (varName === "text-inverse") tokenMap[varValue] = "content-inverse";
    if (varName === "color-success") tokenMap[varValue] = "feedback-success";
    if (varName === "color-error") tokenMap[varValue] = "feedback-error";
    if (varName === "color-warning") tokenMap[varValue] = "feedback-warning";
    if (varName === "radius-sm") tokenMap[varValue] = "rounded-sm";
    if (varName === "radius-md") tokenMap[varValue] = "rounded-md";
    if (varName === "radius-lg") tokenMap[varValue] = "rounded-lg";
    if (varName === "radius-full") tokenMap[varValue] = "rounded-full";
  }

  // Pre-seed known project token hexes if defined
  tokenMap["#3772ff"] = "primary";
  tokenMap["#efefef"] = "border";
  tokenMap["#1a1d1f"] = "content-primary";
  tokenMap["#6f767e"] = "content-secondary";
  tokenMap["#9a9fa5"] = "content-muted";
  tokenMap["#ffffff"] = "surface";
  tokenMap["#f5f6fa"] = "app";
  tokenMap["#00d287"] = "feedback-success"; // Green brand accent

  return tokenMap;
}

const OFFICIAL_TOKENS = loadTokensCss();

const VIOLATIONS = [
  {
    name: "Arbitrary Color Bracket",
    regex: /(?:className|class)=["'][^"']*\b[a-zA-Z0-9_-]+-\[#(?:[0-9a-fA-F]{3,8})\][^"']*["']/g,
    message: "Arbitrary hex brackets (e.g. `bg-[#...]`) are forbidden. Map to tokens.css.",
  },
  {
    name: "Arbitrary Pixel Bracket",
    regex: /(?:className|class)=["'][^"']*\b[a-zA-Z0-9_-]+-\[\d+(?:\.\d+)?(?:px|rem)\][^"']*["']/g,
    message: "Arbitrary measurement brackets (e.g. `w-[320px]`, `p-[14px]`) are forbidden. Use Tailwind scales.",
  },
  {
    name: "Inline Style Attribute",
    regex: /style=\{\{[^}]*\}\}/g,
    message: "Inline `style={{ ... }}` objects are forbidden. Use semantic Tailwind utility classes.",
  },
  {
    name: "Dangerous Absolute Positioning",
    regex: /className=["'][^"']*\b(absolute|fixed)\b[^"']*(top-|left-|bottom-|right-)[^"']*["']/g,
    message: "Avoid raw absolute positioning for structural layout. Use Flexbox or CSS Grid.",
  },
  {
    name: "Flex Child Missing min-w-0",
    regex: /className=["'][^"']*\bflex-1\b(?![^"']*\bmin-w-0\b)[^"']*["']/g,
    message: "Flex children with `flex-1` containing text should include `min-w-0` to avoid text overflow blowout.",
  },
];

let totalFilesScanned = 0;
let totalFilesFixed = 0;
const recordedViolations = [];
const fixedModifications = [];

/**
 * Auto-Fixer: Replaces arbitrary values with official tokens and attaches explanatory comment
 */
function autoFixContent(content, filePath) {
  let modified = content;
  let fileHasFixes = false;

  // 1. Fix Arbitrary Hex Colors e.g. bg-[#00D287], text-[#1A1D1F], border-[#EFEFEF]
  const colorBracketRegex = /\b(bg|text|border|fill|stroke|shadow)-\[#(?:[0-9a-fA-F]{3,8})\]/g;
  modified = modified.replace(colorBracketRegex, (match, prefix) => {
    const hex = match.slice(prefix.length + 2, -1).toLowerCase();
    const tokenName = OFFICIAL_TOKENS[hex];
    if (tokenName) {
      fileHasFixes = true;
      let replacementClass = `${prefix}-${tokenName}`;
      if (prefix === "border" && tokenName === "border") replacementClass = "border-border";
      if (prefix === "text" && tokenName === "content-primary") replacementClass = "text-content-primary";
      if (prefix === "text" && tokenName === "content-secondary") replacementClass = "text-content-secondary";
      if (prefix === "text" && tokenName === "content-muted") replacementClass = "text-content-muted";
      if (prefix === "bg" && tokenName === "feedback-success") replacementClass = "bg-emerald-500";
      if (prefix === "text" && tokenName === "feedback-success") replacementClass = "text-emerald-500";

      fixedModifications.push({
        file: filePath,
        original: match,
        replacement: replacementClass,
        reason: `Matched official token for '${hex}' in tokens.css`,
      });
      return replacementClass;
    }
    return match;
  });

  // 2. Fix Arbitrary Measurements e.g. h-[1px], border-[3px], w-[260px]
  const pixelBracketRegex = /\b(w|h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|border|rounded)-\[(\d+(?:\.\d+)?px)\]/g;
  modified = modified.replace(pixelBracketRegex, (match, prefix, pxValue) => {
    const scale = PIXEL_SCALE_MAP[pxValue];
    if (scale) {
      fileHasFixes = true;
      const replacementClass = prefix === "border" && scale === "px" ? "border" : `${prefix}-${scale}`;
      fixedModifications.push({
        file: filePath,
        original: match,
        replacement: replacementClass,
        reason: `Standardized '${pxValue}' to standard Tailwind scale`,
      });
      return replacementClass;
    }
    return match;
  });

  return { modifiedContent: modified, fileHasFixes };
}

function scanFile(filePath) {
  totalFilesScanned++;
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

  // In Fix Mode: apply codemod transformations
  if (IS_FIX_MODE) {
    const { modifiedContent, fileHasFixes } = autoFixContent(rawContent, relPath);
    if (fileHasFixes && modifiedContent !== rawContent) {
      // Append a clear audit log header comment at the top if not already present
      let finalContent = modifiedContent;
      const auditNote = `/* [token-codemod] Auto-fixed arbitrary values to official tokens on ${new Date().toISOString().split("T")[0]} */\n`;
      if (!finalContent.includes("[token-codemod]")) {
        finalContent = auditNote + finalContent;
      }
      fs.writeFileSync(filePath, finalContent, "utf-8");
      totalFilesFixed++;
    }
  }

  // Check remaining / unfixable violations
  const contentToAudit = fs.readFileSync(filePath, "utf-8");
  const lines = contentToAudit.split("\n");

  VIOLATIONS.forEach(({ name, regex, message }) => {
    lines.forEach((line, lineIdx) => {
      if (line.includes("// token-ignore") || line.includes("/* [token-codemod]")) return;
      const matches = line.match(regex);
      if (matches) {
        matches.forEach((match) => {
          recordedViolations.push({
            file: relPath,
            line: lineIdx + 1,
            rule: name,
            codeSnippet: match.trim(),
            fix: message,
          });
        });
      }
    });
  });
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== "dist-client") {
        traverseDirectory(fullPath);
      }
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      scanFile(fullPath);
    }
  }
}

function run() {
  printHeader(
    IS_FIX_MODE ? "Design Token Codemod & Auto-Fixer" : "Design Token & Styling Guardrail Audit",
    IS_FIX_MODE
      ? "Auto-fixing arbitrary Tailwind bracket notations to official tokens.css variables"
      : "Scanning React/Tailwind codebase for styling compliance (Use --fix to auto-repair)"
  );

  printStep(1, 2, "Scanning Target Directories", TARGET_DIRS.join(", "));
  TARGET_DIRS.forEach(traverseDirectory);

  if (IS_FIX_MODE && fixedModifications.length > 0) {
    console.log(`\n${colors.green}${colors.bold}✨ AUTO-FIX CODEMOD REPORT (${fixedModifications.length} modifications in ${totalFilesFixed} files):${colors.reset}\n`);
    fixedModifications.forEach((mod, idx) => {
      console.log(`  ${colors.green}✔ Fix #${idx + 1}:${colors.reset} in ${colors.cyan}${mod.file}${colors.reset}`);
      console.log(`     ↳ Changed:    ${colors.red}${mod.original}${colors.reset} ➔ ${colors.green}${colors.bold}${mod.replacement}${colors.reset}`);
      console.log(`     ↳ Discrepancy Note: ${colors.dim}${mod.reason}${colors.reset}\n`);
    });
  }

  printStep(2, 2, "Evaluating Codebase Violations", `Audited ${totalFilesScanned} files against ${VIOLATIONS.length} rules`);

  if (recordedViolations.length > 0) {
    console.error(`\n${colors.red}${colors.bold}🚨 VIOLATIONS DETECTED (${recordedViolations.length}):${colors.reset}\n`);

    recordedViolations.forEach((v, idx) => {
      console.error(`  ${colors.red}${colors.bold}#${idx + 1} [${v.rule}]${colors.reset} in ${colors.cyan}${v.file}:${v.line}${colors.reset}`);
      console.error(`     ↳ Snippet: ${colors.yellow}${v.codeSnippet}${colors.reset}`);
      console.error(`     ↳ Fix:     ${colors.dim}${v.fix}${colors.reset}\n`);
    });

    printSummaryCard("TOKEN AUDIT FAILED", [
      ["Files Scanned", totalFilesScanned],
      ["Auto-Fixed Files", totalFilesFixed],
      ["Remaining Violations", recordedViolations.length],
      ["Status", `${colors.red}FAIL (Exit 1)${colors.reset}`],
    ]);

    process.exit(1);
  } else {
    printSummaryCard("TOKEN AUDIT PASSED", [
      ["Files Scanned", totalFilesScanned],
      ["Auto-Fixed Files", totalFilesFixed],
      ["Violations Found", "0"],
      ["Status", `${colors.green}100% Compliant (Exit 0)${colors.reset}`],
    ]);

    process.exit(0);
  }
}

run();
