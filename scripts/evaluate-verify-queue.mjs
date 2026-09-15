/**
 * scripts/evaluate-verify-queue.mjs
 *
 * Automated Vision Verification Evaluator
 * ────────────────────────────────────────
 * Consumes pending verification jobs from dist-preview/.tmp/verify-queue/
 * Compares design crop vs Playwright render across 5 dimensions:
 *   1. Layout structure (columns, alignment, spacing, proportions)
 *   2. Typography hierarchy (heading scale, weight, line wraps)
 *   3. Copy accuracy (verbatim text from spec)
 *   4. Color & mood match (backgrounds, overlays, authentic imagery)
 *   5. UI element completeness (CTAs, badges, icons, accordions)
 *
 * Supports:
 *   - Automated API Mode: uses OPENAI_API_KEY or GEMINI_API_KEY from .env.local
 *   - Antigravity Native Mode: formats queue for multimodal assistant inspection
 *
 * Usage:
 *   node scripts/evaluate-verify-queue.mjs --slug=Homepage
 *   node scripts/evaluate-verify-queue.mjs --slug=Homepage --block=block_2
 *   node scripts/evaluate-verify-queue.mjs --all
 */

import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const queueDir = path.join(rootDir, "dist-preview", ".tmp", "verify-queue");
const manifestDir = path.join(rootDir, "inputs", "vision");
const reportsDir = path.join(rootDir, "dist-preview", "reports");

// Load .env.local if present
const envPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...v] = trimmed.split("=");
      if (!process.env[k.trim()]) {
        process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

const args = process.argv.slice(2);
const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const blockArg = args.find((a) => a.startsWith("--block="))?.split("=")[1];
const doAll = args.includes("--all");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function callOpenAIVision(prompt, designCropBase64, renderBase64, apiKey) {
  const model = process.env.VISION_MODEL || "gpt-4o";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/png;base64,${designCropBase64}` } },
            { type: "image_url", image_url: { url: `data:image/png;base64,${renderBase64}` } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI Vision API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function callGeminiVision(prompt, designCropBase64, renderBase64, apiKey) {
  const model = process.env.GEMINI_VISION_MODEL || "gemini-1.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt + "\n\nRespond with valid JSON only." },
            { inline_data: { mime_type: "image/png", data: designCropBase64 } },
            { inline_data: { mime_type: "image/png", data: renderBase64 } },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.1,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini Vision API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

function updateManifest(slug, blockId, evaluation) {
  const manifestPath = path.join(manifestDir, `${slug}.manifest.json`);
  if (!fs.existsSync(manifestPath)) return;

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (manifest.blocks && manifest.blocks[blockId]) {
      manifest.blocks[blockId].status.visualVerified = evaluation.verdict === "PASS";
      manifest.blocks[blockId].status.verificationScore = evaluation.matchScore;
      manifest.blocks[blockId].status.verificationVerdict = evaluation.verdict;
      manifest.blocks[blockId].status.lastUpdated = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn(`  ⚠ Could not update manifest for ${blockId}: ${e.message}`);
  }
}

function updateReport(slug, blockEvaluation) {
  ensureDir(reportsDir);
  const reportPath = path.join(reportsDir, `${slug}-block-verification.json`);

  let report = {
    slug,
    generatedAt: new Date().toISOString(),
    summary: { total: 0, passed: 0, warned: 0, failed: 0, skipped: 0, averageScore: 0 },
    blocks: [],
  };

  if (fs.existsSync(reportPath)) {
    try {
      report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    } catch {}
  }

  // Replace or add evaluation
  const existingIdx = report.blocks.findIndex((b) => b.blockId === blockEvaluation.blockId);
  if (existingIdx >= 0) {
    report.blocks[existingIdx] = blockEvaluation;
  } else {
    report.blocks.push(blockEvaluation);
  }

  const passed = report.blocks.filter((b) => b.verdict === "PASS").length;
  const warned = report.blocks.filter((b) => b.verdict === "WARN").length;
  const failed = report.blocks.filter((b) => b.verdict === "FAIL").length;
  const scored = report.blocks.filter((b) => b.matchScore != null);
  const avg = scored.length > 0 ? Math.round(scored.reduce((s, b) => s + b.matchScore, 0) / scored.length) : 0;

  report.summary = {
    total: report.blocks.length,
    passed,
    warned,
    failed,
    skipped: 0,
    averageScore: avg,
  };
  report.generatedAt = new Date().toISOString();

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  return reportPath;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║       Automated Block Vision Evaluation Runner       ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (!fs.existsSync(queueDir)) {
    console.log("  No pending queue found in dist-preview/.tmp/verify-queue/");
    console.log("  Run: npm run verify:blocks -- --slug=<slug> first.\n");
    return;
  }

  const queueFiles = fs.readdirSync(queueDir).filter((f) => f.endsWith(".json"));
  if (queueFiles.length === 0) {
    console.log("  Queue is empty. All blocks verified or none queued.\n");
    return;
  }

  const targetFiles = queueFiles.filter((f) => {
    if (slugArg && !f.startsWith(`${slugArg}-`)) return false;
    if (blockArg && !f.includes(`-${blockArg}.json`)) return false;
    return true;
  });

  if (targetFiles.length === 0) {
    console.log(`  No matching queue items for slug="${slugArg || "any"}", block="${blockArg || "any"}"\n`);
    return;
  }

  console.log(`  Found ${targetFiles.length} verification job(s) to evaluate.\n`);

  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  for (const qf of targetFiles) {
    const queueFilePath = path.join(queueDir, qf);
    const item = JSON.parse(fs.readFileSync(queueFilePath, "utf-8"));

    const designCropPath = path.join(rootDir, item.designCropPath);
    const renderPath = path.join(rootDir, item.renderPath);

    if (!fs.existsSync(designCropPath) || !fs.existsSync(renderPath)) {
      console.warn(`  ⚠ Missing images for ${item.blockId} (${item.title}), skipping.`);
      continue;
    }

    process.stdout.write(`  Evaluating ${item.slug} [${item.blockId}] — ${item.title}... `);

    let evaluation = null;

    if (apiKey) {
      const designB64 = fs.readFileSync(designCropPath).toString("base64");
      const renderB64 = fs.readFileSync(renderPath).toString("base64");

      try {
        if (process.env.GEMINI_API_KEY) {
          evaluation = await callGeminiVision(item.prompt, designB64, renderB64, process.env.GEMINI_API_KEY);
        } else {
          evaluation = await callOpenAIVision(item.prompt, designB64, renderB64, process.env.OPENAI_API_KEY);
        }
      } catch (err) {
        console.log(`\x1b[31mAPI ERROR\x1b[0m (${err.message})`);
        continue;
      }
    } else {
      // Offline / Assistant native evaluation fallback
      console.log(`\x1b[33mQUEUED (Awaiting Antigravity Native Evaluation)\x1b[0m`);
      console.log(`    ↳ Crop:   ${item.designCropPath}`);
      console.log(`    ↳ Render: ${item.renderPath}`);
      continue;
    }

    // Normalizing verdict thresholds: PASS >= 85, WARN 70-84, FAIL < 70
    if (evaluation.matchScore >= 85) evaluation.verdict = "PASS";
    else if (evaluation.matchScore >= 70) evaluation.verdict = "WARN";
    else evaluation.verdict = "FAIL";

    const blockEvaluation = {
      blockId: item.blockId,
      title: item.title,
      verdict: evaluation.verdict,
      matchScore: evaluation.matchScore,
      layoutMatch: evaluation.layoutMatch || "close",
      copyAccurate: evaluation.copyAccurate !== false,
      colorMatch: evaluation.colorMatch !== false,
      missingElements: evaluation.missingElements || [],
      issues: evaluation.issues || [],
      designCrop: item.designCropPath,
      renderFile: item.renderPath,
    };

    updateManifest(item.slug, item.blockId, blockEvaluation);
    updateReport(item.slug, blockEvaluation);

    const verdictColor = evaluation.verdict === "PASS" ? "\x1b[32m" : (evaluation.verdict === "WARN" ? "\x1b[33m" : "\x1b[31m");
    console.log(`${verdictColor}${evaluation.verdict} (${evaluation.matchScore}%)\x1b[0m`);

    if (evaluation.issues && evaluation.issues.length > 0) {
      evaluation.issues.forEach((iss) => {
        console.log(`      ↳ [${iss.type}] ${iss.description}`);
      });
    }

    // Remove from queue once evaluated
    fs.unlinkSync(queueFilePath);
  }

  console.log("\n  ✓ Evaluation run complete. Manifests and reports updated.\n");
}

main().catch((err) => {
  console.error("Evaluation runner error:", err);
  process.exit(1);
});
