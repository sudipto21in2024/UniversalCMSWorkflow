// scripts/run-visual-subagent.mjs
import fs from "node:fs";
import path from "node:path";
import { printHeader, printStep, printErrorBanner, printSummaryCard, printWarning, printSuccess, colors } from "./reporter.mjs";

async function runVisualEvaluation(componentName) {
  printHeader("AI Vision Sub-Agent Evaluator", `Analyzing visual delta between Figma baseline & Storybook render for [${componentName}]`);

  const snapshotDir = path.join(process.cwd(), "docs", "figma-data", "snapshots");
  const figmaImgPath = path.join(snapshotDir, `${componentName}-figma.png`);
  const browserImgPath = path.join(snapshotDir, `${componentName}-browser.png`);

  printStep(1, 3, "Validating Snapshot Inputs", `Checking ${snapshotDir}...`);
  if (!fs.existsSync(figmaImgPath) || !fs.existsSync(browserImgPath)) {
    printErrorBanner({
      title: "Snapshots Missing",
      message: `Required snapshot images for "${componentName}" were not found in ${snapshotDir}`,
      context: `Expected: ${componentName}-figma.png and ${componentName}-browser.png`,
      fix: `Run visual validation first to capture snapshots: npm run test:visual <FIGMA_URL> <STORY_ID> ${componentName}`,
    });
    process.exit(1);
  }
  console.log(`    ${colors.green}✔${colors.reset} Baseline snapshot: ${colors.dim}${figmaImgPath}${colors.reset}`);
  console.log(`    ${colors.green}✔${colors.reset} Browser snapshot:  ${colors.dim}${browserImgPath}${colors.reset}`);

  const figmaBase64 = fs.readFileSync(figmaImgPath).toString("base64");
  const browserBase64 = fs.readFileSync(browserImgPath).toString("base64");

  printStep(2, 3, "Preparing Vision Model Prompt", "Loading prompt configuration...");
  const promptPath = path.join(process.cwd(), ".antigravity", "prompts", "visual-subagent.md");
  const systemPrompt = fs.existsSync(promptPath)
    ? fs.readFileSync(promptPath, "utf-8")
    : "You are a visual comparison specialist. Compare Figma baseline vs browser render. Return JSON with matchStatus (PASS/FAIL), confidenceScore (0-100), and actionableFixes array of {property, current, expected, suggestedTailwindClass}.";

  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    printWarning("LLM_API_KEY / OPENAI_API_KEY not configured. Generating template fallback report for manual inspection.");
    const fallbackReport = {
      matchStatus: "FAIL",
      confidenceScore: 75,
      actionableFixes: [
        {
          property: "spacing / layout",
          current: "Visual difference detected in pixelmatch diff",
          expected: "Refer to Figma reference snapshot",
          suggestedTailwindClass: "Inspect padding, gap, and font-size tokens in tokens.css",
        },
      ],
    };
    const reportPath = path.join(snapshotDir, `${componentName}-vision-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(fallbackReport, null, 2));

    printSummaryCard("VISION EVALUATION (FALLBACK)", [
      ["Component", componentName],
      ["Status", `${colors.yellow}MANUAL REVIEW NEEDED (No LLM Key)${colors.reset}`],
      ["Report Saved", path.relative(process.cwd(), reportPath).replace(/\\/g, "/")],
    ]);
    return;
  }

  printStep(3, 3, "Invoking AI Vision Model", "Sending dual-snapshot payload to vision endpoint...");
  try {
    const subAgentResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.VISION_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Compare Figma baseline vs Browser render for component: ${componentName}` },
              { type: "image_url", image_url: { url: `data:image/png;base64,${figmaBase64}` } },
              { type: "image_url", image_url: { url: `data:image/png;base64,${browserBase64}` } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      }),
    });

    if (!subAgentResponse.ok) {
      throw new Error(`Vision API returned HTTP ${subAgentResponse.status}: ${await subAgentResponse.text()}`);
    }

    const data = await subAgentResponse.json();
    const report = JSON.parse(data.choices[0].message.content);
    const reportPath = path.join(snapshotDir, `${componentName}-vision-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const isPass = report.matchStatus === "PASS";

    console.log(`\n${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}             VISION SUB-AGENT DIAGNOSTIC REPORT             ${colors.reset}`);
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`Match Status    : ${isPass ? `${colors.green}${colors.bold}PASS${colors.reset}` : `${colors.red}${colors.bold}FAIL${colors.reset}`}`);
    console.log(`Confidence Score: ${report.confidenceScore || "N/A"}%`);
    console.log(`Report File     : ${reportPath}\n`);

    if (report.actionableFixes && report.actionableFixes.length > 0) {
      console.log(`${colors.yellow}${colors.bold}Actionable Fixes Suggested by Vision Agent:${colors.reset}`);
      report.actionableFixes.forEach((fix, idx) => {
        console.log(`  ${idx + 1}. [${colors.bold}${fix.property}${colors.reset}]`);
        console.log(`     ↳ Current:   ${fix.current}`);
        console.log(`     ↳ Expected:  ${fix.expected}`);
        console.log(`     ↳ Suggested: ${colors.cyan}${fix.suggestedTailwindClass}${colors.reset}\n`);
      });
    }

    process.exit(isPass ? 0 : 1);
  } catch (err) {
    printErrorBanner({
      title: "Vision Subagent Request Failed",
      message: err.message,
      context: `Component: ${componentName}`,
      fix: "Check LLM_API_KEY validity, network connectivity, and quota limits.",
    });
    process.exit(1);
  }
}

const componentName = process.argv[2];
if (componentName) {
  runVisualEvaluation(componentName);
} else {
  printErrorBanner({
    title: "Missing Component Name",
    message: "No target component name specified.",
    context: "Usage: node scripts/run-visual-subagent.mjs <ComponentName>",
    fix: "Provide component name (e.g., node scripts/run-visual-subagent.mjs button)",
  });
  process.exit(1);
}
