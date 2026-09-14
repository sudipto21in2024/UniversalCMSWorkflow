// scripts/figma-commenter.mjs
import { printHeader, printStep, printErrorBanner, printSummaryCard, printSuccess, colors } from "./reporter.mjs";

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

function validateEnvironment() {
  if (!FIGMA_TOKEN || FIGMA_TOKEN.trim() === "" || FIGMA_TOKEN.includes("figd_your_actual_token_here")) {
    printErrorBanner({
      title: "Missing Figma Access Token",
      message: "FIGMA_ACCESS_TOKEN is not configured or contains placeholder value in .env.local",
      context: "Posting comments requires a Figma Personal Access Token with write permissions.",
      fix: "Add `FIGMA_ACCESS_TOKEN=figd_...` to your `.env.local` file.",
    });
    process.exit(1);
  }
}

async function postFigmaComment(fileKey, nodeId, message) {
  printHeader("Figma Feedback Commenter", "Posting automated feedback to Figma canvas node");

  validateEnvironment();

  printStep(1, 2, "Preparing Comment Payload", `Target Node: ${nodeId} | File: ${fileKey}`);
  const endpoint = `https://api.figma.com/v1/files/${fileKey}/comments`;

  printStep(2, 2, "Posting Comment via Figma API", endpoint);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Figma-Token": FIGMA_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `🤖 [Dev-Linter Notice] ${message}`,
        client_meta: nodeId ? { node_id: nodeId, node_offset: { x: 0, y: 0 } } : undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let hint = "Verify token scope and ensure file permissions allow commenting.";
      if (response.status === 403) {
        hint = "Token does not have write/comment permissions on this Figma file.";
      }
      throw new Error(`Figma API returned HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    printSummaryCard("COMMENT POSTED SUCCESSFULLY", [
      ["File Key", fileKey],
      ["Node ID", nodeId],
      ["Comment ID", data.id || "OK"],
      ["Status", `${colors.green}SUCCESS (Exit 0)${colors.reset}`],
    ]);
    process.exit(0);
  } catch (err) {
    printErrorBanner({
      title: "Failed to Post Comment to Figma",
      message: err.message,
      context: `File: ${fileKey} | Node: ${nodeId}`,
      fix: "Check your Figma token permissions or verify that the node ID exists.",
    });
    process.exit(1);
  }
}

const [, , fileKey, nodeId, ...msgParts] = process.argv;

if (fileKey && nodeId && msgParts.length > 0) {
  postFigmaComment(fileKey, nodeId, msgParts.join(" "));
} else {
  printErrorBanner({
    title: "Missing Required Arguments",
    message: "File Key, Node ID, and Message are all required.",
    context: "Usage: node scripts/figma-commenter.mjs <FILE_KEY> <NODE_ID> <MESSAGE>",
    fix: 'Example: node scripts/figma-commenter.mjs "ABC123xyz" "1:2" "Please convert group to auto-layout."',
  });
  process.exit(1);
}
