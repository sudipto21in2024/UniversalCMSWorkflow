// scripts/figma-asset-sync.mjs
import fs from "node:fs";
import path from "node:path";
import { printHeader, printStep, printErrorBanner, printSummaryCard, printSuccess, printWarning, colors } from "./reporter.mjs";

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
    throw new Error("Invalid Figma URL: Missing File Key in URL.");
  }
  return {
    fileKey: fileKeyMatch[1],
    nodeId: nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace("-", ":") : null,
  };
}

async function fetchFigmaDocument(fileKey, nodeId) {
  const endpoint = nodeId
    ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
    : `https://api.figma.com/v1/files/${fileKey}`;

  let res;
  try {
    res = await fetch(endpoint, { headers: { "X-Figma-Token": FIGMA_TOKEN } });
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
    }
    const err = new Error(`Figma API returned HTTP ${res.status}: ${errorBody}`);
    err.status = res.status;
    err.hint = hint;
    throw err;
  }
  return res.json();
}

function sanitizeName(str) {
  return (str || "unnamed")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function collectAssetNodes(rootNode) {
  const vectors = [];
  const images = [];

  function traverse(node) {
    if (!node) return;
    const name = (node.name || "").toLowerCase();

    if (
      node.type === "VECTOR" ||
      node.type === "BOOLEAN_OPERATION" ||
      name.startsWith("icon/") ||
      name.startsWith("ic-") ||
      name.includes("logo")
    ) {
      vectors.push({ id: node.id, name: sanitizeName(node.name) });
      return;
    }

    if (node.fills && Array.isArray(node.fills)) {
      const hasImageFill = node.fills.some((f) => f.type === "IMAGE" && f.visible !== false);
      if (hasImageFill) {
        images.push({ id: node.id, name: sanitizeName(node.name) });
      }
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(rootNode);
  return { vectors, images };
}

function normalizeSvgCurrentColor(svgContent) {
  return svgContent.replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"');
}

async function downloadAssetBatch(fileKey, nodeList, format, destDir) {
  if (nodeList.length === 0) return { downloaded: {}, failed: [] };
  const ids = nodeList.map((n) => n.id).join(",");
  const endpoint = `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=${format}`;

  let res;
  try {
    res = await fetch(endpoint, { headers: { "X-Figma-Token": FIGMA_TOKEN } });
  } catch (netErr) {
    throw new Error(`Failed to request image download URLs: ${netErr.message}`);
  }

  if (!res.ok) {
    throw new Error(`Figma Image API returned HTTP ${res.status}: ${await res.text()}`);
  }

  const { images: imageMap } = await res.json();
  const manifestEntries = {};
  const failedList = [];
  fs.mkdirSync(destDir, { recursive: true });

  for (const item of nodeList) {
    const downloadUrl = imageMap[item.id];
    if (!downloadUrl) {
      printWarning(`No download URL provided by Figma for ${format.toUpperCase()} asset "${item.name}" (ID: ${item.id})`);
      failedList.push({ id: item.id, name: item.name, reason: "No URL returned by Figma" });
      continue;
    }

    const safeId = item.id.replace(/[:;/\\?%*|"<>]/g, "-");
    const fileName = `${item.name}-${safeId}.${format}`;
    const filePath = path.join(destDir, fileName);

    try {
      const assetRes = await fetch(downloadUrl);
      if (!assetRes.ok) {
        throw new Error(`HTTP ${assetRes.status}`);
      }

      if (format === "svg") {
        let svgText = await assetRes.text();
        svgText = normalizeSvgCurrentColor(svgText);
        fs.writeFileSync(filePath, svgText, "utf-8");
      } else {
        const buffer = Buffer.from(await assetRes.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
      }

      manifestEntries[item.id] = {
        name: item.name,
        format,
        localPath: path.relative(process.cwd(), filePath).replace(/\\/g, "/"),
        publicPath: `/figma-assets/${format === "svg" ? "icons" : "images"}/${fileName}`,
      };
      console.log(`    ${colors.green}✔${colors.reset} Saved: ${colors.dim}${fileName}${colors.reset}`);
    } catch (dlErr) {
      printWarning(`Failed downloading asset "${item.name}": ${dlErr.message}`);
      failedList.push({ id: item.id, name: item.name, reason: dlErr.message });
    }
  }

  return { downloaded: manifestEntries, failed: failedList };
}

async function run() {
  const args = process.argv.slice(2);
  const dumpArgIndex = args.indexOf("--dump-path");
  const dumpPath = dumpArgIndex !== -1 ? args[dumpArgIndex + 1] : (args.includes("--offline") ? "Docs/DirectDataDump" : null);
  const nonFlagArgs = args.filter((a, i) => !a.startsWith("--") && (dumpArgIndex === -1 || (i !== dumpArgIndex && i !== dumpArgIndex + 1)));

  const figmaUrl = nonFlagArgs[0] || (dumpPath ? "offline-dump" : null);
  const tag = nonFlagArgs[1] || "screen";

  printHeader("Figma Asset Sync & Normalizer", "Extracting icons, images, and structural AST (Direct Dump / API)");

  if (dumpPath) {
    console.log(`\n🛡️ [Rate Limit Protection Active] Ingesting offline dump from: ${dumpPath}`);
    const resolvedDumpPath = path.isAbsolute(dumpPath) ? dumpPath : path.join(process.cwd(), dumpPath);
    
    // Check possible asset locations
    const candidateDirs = [
      resolvedDumpPath,
      path.join(resolvedDumpPath, "light-dark-export", "light"),
      path.join(resolvedDumpPath, "light"),
      path.join(resolvedDumpPath, "dark"),
    ].filter((d) => fs.existsSync(d));

    const iconsDir = path.join(process.cwd(), "public", "figma-assets", "icons");
    const imgDir = path.join(process.cwd(), "public", "figma-assets", "images");
    fs.mkdirSync(iconsDir, { recursive: true });
    fs.mkdirSync(imgDir, { recursive: true });

    let copiedCount = 0;
    const manifestEntries = {};

    for (const cDir of candidateDirs) {
      const files = fs.readdirSync(cDir);
      for (const file of files) {
        if (file.endsWith(".png") || file.endsWith(".svg") || file.endsWith(".jpg") || file.endsWith(".webp")) {
          const srcFile = path.join(cDir, file);
          const ext = path.extname(file).slice(1);
          const isIcon = ext === "svg" || file.toLowerCase().includes("icon") || file.toLowerCase().includes("fill_") || file.toLowerCase().includes("exclude");
          const targetDir = isIcon ? iconsDir : imgDir;
          const destFile = path.join(targetDir, file);
          
          fs.copyFileSync(srcFile, destFile);
          copiedCount++;

          // Extract pseudo node-id if present in filename, e.g. "Card_1-1718_8205.png" -> "1718:8205"
          const idMatch = file.match(/-([I0-9_]+)\.[a-zA-Z0-9]+$/);
          const pseudoId = idMatch ? idMatch[1].replace(/_/g, ":") : file;
          
          manifestEntries[pseudoId] = {
            name: file.replace(/\.[^/.]+$/, ""),
            format: ext,
            localPath: path.relative(process.cwd(), destFile).replace(/\\/g, "/"),
            publicPath: `/figma-assets/${isIcon ? "icons" : "images"}/${file}`,
          };
        }
      }
    }

    const manifestPath = path.join(process.cwd(), "Docs", "figma-data", "asset-manifest.json");
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    let existingManifest = {};
    if (fs.existsSync(manifestPath)) {
      try { existingManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")); } catch {}
    }
    const merged = { ...existingManifest, ...manifestEntries };
    fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2));

    printSummaryCard("OFFLINE DUMP ASSET INGESTION SUMMARY", [
      ["Dump Location", dumpPath],
      ["Total Files Copied", copiedCount],
      ["Manifest Generated", path.relative(process.cwd(), manifestPath).replace(/\\/g, "/")],
      ["Status", `${colors.green}SUCCESS (Zero API calls made)${colors.reset}`],
    ]);
    process.exit(0);
  }

  if (!figmaUrl) {
    printErrorBanner({
      title: "Missing Required Argument",
      message: "No Figma URL or Dump Path provided.",
      context: "Usage: npm run figma:sync <FIGMA_URL> [tag_name] OR npm run figma:sync --dump-path Docs/DirectDataDump",
      fix: 'Provide a Figma URL or use `--dump-path <folder>` to run offline without API rate limits.',
    });
    process.exit(1);
  }

  validateEnvironment();

  try {
    printStep(1, 4, "Parsing Figma URL & Target Node", figmaUrl);
    const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
    console.log(`    ${colors.dim}↳ File Key: ${fileKey} | Target Node: ${nodeId || "Root Canvas"}${colors.reset}`);

    printStep(2, 4, "Fetching Structural AST from Figma API", `Caching AST data for tag "${tag}"...`);
    const rawData = await fetchFigmaDocument(fileKey, nodeId);

    const rawDir = path.join(process.cwd(), "docs", "figma-data", "raw");
    const snapshotDir = path.join(process.cwd(), "docs", "figma-data", "snapshots");
    fs.mkdirSync(rawDir, { recursive: true });
    fs.mkdirSync(snapshotDir, { recursive: true });

    // 1. Check for previous AST snapshot
    const rawPath = path.join(rawDir, `${tag}-ast.json`);
    let previousAst = null;
    if (fs.existsSync(rawPath)) {
      try {
        previousAst = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
      } catch {}
    }

    // 2. Save Timestamped Snapshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotPath = path.join(snapshotDir, `${timestamp}_${tag}_ast.json`);
    fs.writeFileSync(snapshotPath, JSON.stringify(rawData, null, 2));
    fs.writeFileSync(rawPath, JSON.stringify(rawData, null, 2));
    console.log(`    ${colors.green}✔${colors.reset} AST Snapshot saved at: ${colors.dim}${snapshotPath}${colors.reset}`);

    // 3. Compute Delta if previous AST existed
    if (previousAst) {
      try {
        const { diffAstSnapshots } = await import("../engine/scripts/ast-diff-engine.mjs");
        const registryPath = path.join(process.cwd(), "engine", "registry", "component-registry.json");
        const registry = fs.existsSync(registryPath) ? JSON.parse(fs.readFileSync(registryPath, "utf-8")) : null;
        
        const oldDoc = nodeId ? previousAst.nodes?.[nodeId]?.document : previousAst.document;
        const newDoc = nodeId ? rawData.nodes?.[nodeId]?.document : rawData.document;
        
        if (oldDoc && newDoc) {
          const delta = diffAstSnapshots(oldDoc, newDoc, registry);
          const deltaDir = path.join(process.cwd(), "docs", "figma-data", "delta");
          fs.mkdirSync(deltaDir, { recursive: true });
          const deltaFilePath = path.join(deltaDir, `delta-${timestamp}-${tag}.json`);
          fs.writeFileSync(deltaFilePath, JSON.stringify(delta, null, 2));

          if (delta.summary.hasChanges) {
            console.log(`    ${colors.yellow}⚡ Delta Detected:${colors.reset} ${delta.summary.totalModified} modified, ${delta.summary.totalAdded} added, ${delta.summary.totalRemoved} removed.`);
            if (delta.affectedComponents.length > 0) {
              console.log(`    ${colors.cyan}↳ Affected Components:${colors.reset} ${delta.affectedComponents.map((c) => c.component).join(", ")}`);
            }
          } else {
            console.log(`    ${colors.dim}↳ No structural AST changes detected compared to previous snapshot.${colors.reset}`);
          }
        }
      } catch (diffErr) {
        console.warn(`    ${colors.dim}Note: AST diff check skipped: ${diffErr.message}${colors.reset}`);
      }
    }

    printStep(3, 4, "Scanning AST for Vector Icons and Raster Images", "Collecting candidate nodes...");
    const rootNode = nodeId ? rawData.nodes[nodeId]?.document : rawData.document;
    if (!rootNode) {
      throw new Error(`Could not find document node for ID: "${nodeId}" in file: "${fileKey}".`);
    }

    const { vectors, images } = collectAssetNodes(rootNode);
    console.log(`    ${colors.dim}↳ Found ${vectors.length} vector candidate(s) and ${images.length} raster image candidate(s)${colors.reset}`);

    printStep(4, 4, "Downloading & Normalizing Assets", "Saving to public/figma-assets...");
    const iconsDir = path.join(process.cwd(), "public", "figma-assets", "icons");
    const imgDir = path.join(process.cwd(), "public", "figma-assets", "images");

    const svgResult = await downloadAssetBatch(fileKey, vectors, "svg", iconsDir);
    const pngResult = await downloadAssetBatch(fileKey, images, "png", imgDir);

    const manifestPath = path.join(process.cwd(), "docs", "figma-data", "asset-manifest.json");
    let masterManifest = {};
    if (fs.existsSync(manifestPath)) {
      try {
        masterManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      } catch {
        masterManifest = {};
      }
    }

    const merged = { ...masterManifest, ...svgResult.downloaded, ...pngResult.downloaded };
    fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2));

    const totalDownloaded = Object.keys(svgResult.downloaded).length + Object.keys(pngResult.downloaded).length;
    const totalFailed = svgResult.failed.length + pngResult.failed.length;

    printSummaryCard("ASSET SYNC SUMMARY", [
      ["Tag / Component", tag],
      ["Vectors Synced", Object.keys(svgResult.downloaded).length],
      ["Images Synced", Object.keys(pngResult.downloaded).length],
      ["Failed Assets", `${totalFailed > 0 ? colors.yellow : colors.green}${totalFailed}${colors.reset}`],
      ["Manifest Path", path.relative(process.cwd(), manifestPath).replace(/\\/g, "/")],
      ["Status", totalFailed > 0 ? `${colors.yellow}COMPLETED WITH WARNINGS${colors.reset}` : `${colors.green}SUCCESS (Exit 0)${colors.reset}`],
    ]);

    process.exit(0);
  } catch (err) {
    printErrorBanner({
      title: "Asset Sync Execution Failed",
      message: err.message,
      context: figmaUrl,
      fix: err.hint || "Verify Figma URL and ensure FIGMA_ACCESS_TOKEN is valid.",
    });
    process.exit(1);
  }
}

run();
