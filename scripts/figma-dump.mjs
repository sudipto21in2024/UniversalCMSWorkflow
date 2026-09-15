import fs from "node:fs";
import path from "node:path";

const DEFAULT_DUMP_LIGHT = "Docs/DirectDataDump/light-dark-export/light/Dashboard (Community)-1788360891070.json";
const DEFAULT_DUMP_DARK = "Docs/DirectDataDump/light-dark-export/dark/Dashboard (Community)-1788360891070.json";
const ASSET_MANIFEST_PATH = "Docs/figma-data/asset-manifest.json";

function findJsonFiles(dir) {
  let results = [];
  try {
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(findJsonFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

function findDumpFile(customPath, isDark = false) {
  if (customPath) {
    const resolved = path.resolve(process.cwd(), customPath);
    if (fs.existsSync(resolved)) return resolved;
  }

  const preferred = isDark ? DEFAULT_DUMP_DARK : DEFAULT_DUMP_LIGHT;
  const preferredPath = path.resolve(process.cwd(), preferred);
  if (fs.existsSync(preferredPath)) {
    return preferredPath;
  }

  // Scan Docs/DirectDataDump
  const directDir = path.resolve(process.cwd(), "Docs/DirectDataDump");
  const directFiles = findJsonFiles(directDir);
  if (directFiles.length > 0) return directFiles[0];

  // Scan Docs/figma-data (exclude asset-manifest.json)
  const figmaDataDir = path.resolve(process.cwd(), "Docs/figma-data");
  const figmaFiles = findJsonFiles(figmaDataDir).filter(f => !f.endsWith("asset-manifest.json"));
  if (figmaFiles.length > 0) return figmaFiles[0];

  throw new Error(`Dump file not found. Place an AST dump in Docs/DirectDataDump/ or specify with --file=<path>.`);
}

function loadDump(customPath, isDark = false) {
  const filePath = findDumpFile(customPath, isDark);
  return {
    filePath,
    data: JSON.parse(fs.readFileSync(filePath, "utf8"))
  };
}

function loadAssetManifest() {
  const filePath = path.resolve(process.cwd(), ASSET_MANIFEST_PATH);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function getNodeChildren(node) {
  if (!node) return [];
  if (Array.isArray(node.children)) return node.children;
  if (Array.isArray(node.pages)) return node.pages;
  if (node.document) return [node.document];
  if (node.nodes && typeof node.nodes === "object") {
    return Object.values(node.nodes).map(n => n.document || n);
  }
  return [];
}

function findNodeById(node, targetId) {
  if (!node) return null;
  if (node.id === targetId) return node;
  const children = getNodeChildren(node);
  for (const child of children) {
    const found = findNodeById(child, targetId);
    if (found) return found;
  }
  return null;
}

function findNodesByName(node, query, results = []) {
  if (!node) return results;
  const q = query.toLowerCase();
  if (node.name && typeof node.name === "string" && node.name.toLowerCase().includes(q)) {
    results.push({ id: node.id, name: node.name, type: node.type });
  }
  const children = getNodeChildren(node);
  for (const child of children) {
    findNodesByName(child, query, results);
  }
  return results;
}

function extractTexts(node, results = []) {
  if (!node) return results;
  if (node.characters && typeof node.characters === "string") {
    results.push({
      id: node.id,
      name: node.name,
      text: node.characters.trim(),
      fontSize: node.fontSize,
      fontName: node.fontName,
      fills: node.fills,
    });
  }
  const children = getNodeChildren(node);
  for (const child of children) {
    extractTexts(child, results);
  }
  return results;
}

function extractColors(node, colorMap = new Map()) {
  if (!node) return colorMap;
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach(f => {
      if (f.type === "SOLID" && f.color) {
        const hex = ("#" + toHex(f.color.r) + toHex(f.color.g) + toHex(f.color.b)).toUpperCase();
        const count = colorMap.get(hex) || 0;
        colorMap.set(hex, count + 1);
      }
    });
  }
  const children = getNodeChildren(node);
  for (const child of children) {
    extractColors(child, colorMap);
  }
  return colorMap;
}

function extractTypography(node, typoMap = new Map()) {
  if (!node) return typoMap;
  if (node.characters && node.fontName) {
    const key = `${node.fontName.family} ${node.fontName.style} ${node.fontSize}px (lineHeight: ${node.lineHeight?.unit || 'AUTO'})`;
    const count = typoMap.get(key) || 0;
    typoMap.set(key, count + 1);
  }
  const children = getNodeChildren(node);
  for (const child of children) {
    extractTypography(child, typoMap);
  }
  return typoMap;
}

function findAssetsForNode(node, manifest, results = []) {
  if (!node) return results;
  if (manifest[node.id]) {
    results.push({
      nodeId: node.id,
      nodeName: node.name,
      asset: manifest[node.id],
    });
  }
  const children = getNodeChildren(node);
  for (const child of children) {
    findAssetsForNode(child, manifest, results);
  }
  return results;
}

function getHierarchyTree(node, depth = 0, maxDepth = 4) {
  if (!node || depth > maxDepth) return [];
  const children = getNodeChildren(node);
  const item = {
    id: node.id,
    name: node.name,
    type: node.type,
    ...(node.characters ? { text: node.characters.trim() } : {}),
    ...(children.length > 0 && depth < maxDepth ? { children: children.map(c => getHierarchyTree(c, depth + 1, maxDepth)) } : {}),
  };
  return item;
}

function inspectNodeStructure(node, depth = 0, maxDepth = 3) {
  if (!node) return null;
  const children = getNodeChildren(node);
  const summary = collectSubtreeSummary(node);
  
  const fills = Array.isArray(node.fills) ? node.fills : [];
  const hasImageFill = fills.some(f => f.type === "IMAGE");
  const isRectangle = node.type === "RECTANGLE";
  const hasNoChildren = children.length === 0;
  const hasNoTexts = summary.texts.length === 0;

  const isFlattened = (hasImageFill && hasNoChildren) || (isRectangle && hasNoChildren && hasNoTexts) || (hasNoChildren && hasNoTexts && node.type !== "TEXT");

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    status: isFlattened ? "FLATTENED_IMAGE_DETECTED" : "RICH_VECTOR_AST",
    strategy: isFlattened ? "SWITCH_TO_VISION_MODEL" : "PROCEED_WITH_AST_EXTRACTION",
    isFlattenedImage: isFlattened,
    hasVectorChildren: children.length > 0,
    hasTextNodes: summary.texts.length > 0,
    totalDescendantNodes: summary.count,
    sampleTexts: summary.texts.slice(0, 5).map(t => t.text),
    message: isFlattened
      ? "Figma AST node is a flattened raster graphic or contains no child text/vectors. Triggering multi-modal AI Vision switchover using companion inputs/vision/<slug>.png mockup."
      : "Figma AST node contains valid vector hierarchy and text layers.",
    hierarchy: getHierarchyTree(node, depth, maxDepth)
  };
}

// Deep Search Engine
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do",
  "does", "doing", "down", "during", "each", "few", "for", "from", "further",
  "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
  "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its",
  "itself", "let's", "me", "more", "most", "my", "myself", "no", "nor", "not",
  "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "she", "should", "so", "some",
  "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then",
  "there", "these", "they", "this", "those", "through", "to", "too", "under",
  "until", "up", "very", "was", "wasn't", "we", "were", "weren't", "what", "when",
  "where", "which", "while", "who", "whom", "why", "with", "won't", "would",
  "you", "your", "yours", "yourself", "yourselves"
]);

function tokenizeQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") return [];
  const words = rawQuery
    .toLowerCase()
    .replace(/[^\w\s\$\#\-\%]/g, " ")
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
  return Array.from(new Set(words));
}

function collectSubtreeSummary(node, summary = { texts: [], names: [], count: 0 }) {
  if (!node) return summary;
  summary.count++;
  if (node.name && typeof node.name === "string") {
    summary.names.push(node.name);
  }
  if (node.characters && typeof node.characters === "string" && node.characters.trim().length > 0) {
    summary.texts.push({
      id: node.id,
      name: node.name,
      text: node.characters.trim(),
      fontSize: node.fontSize,
      fontName: node.fontName,
    });
  }
  const children = getNodeChildren(node);
  for (const child of children) {
    collectSubtreeSummary(child, summary);
  }
  return summary;
}

function deepSearchNodes(root, rawQuery, manifest = {}, maxResults = 5) {
  const queryTokens = tokenizeQuery(rawQuery);
  const cleanRaw = rawQuery.toLowerCase().trim();
  const candidates = [];

  const CONTAINER_TYPES = new Set([
    "FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE", "SECTION", "GROUP"
  ]);

  function traverse(node, depth = 0) {
    if (!node) return;

    const isContainer = CONTAINER_TYPES.has(node.type) || (getNodeChildren(node).length > 0 && depth > 0);

    if (isContainer && node.id) {
      const summary = collectSubtreeSummary(node, { texts: [], names: [], count: 0 });
      let score = 0;
      const matchedTokens = new Set();
      const nodeNameLower = (node.name || "").toLowerCase();

      // 1. Exact phrase matches
      if (cleanRaw.length > 3) {
        if (nodeNameLower.includes(cleanRaw)) score += 35;
        for (const t of summary.texts) {
          if (t.text.toLowerCase().includes(cleanRaw)) {
            score += 30;
            break;
          }
        }
      }

      // 2. Token matches in container name
      queryTokens.forEach(token => {
        if (nodeNameLower.includes(token)) {
          matchedTokens.add(token);
          score += 10;
        }
      });

      // 3. Token matches in descendant text characters
      summary.texts.forEach(t => {
        const tLower = t.text.toLowerCase();
        queryTokens.forEach(token => {
          if (tLower.includes(token)) {
            matchedTokens.add(token);
            score += 6;
          }
        });
      });

      // 4. Token matches in descendant layer names
      summary.names.forEach(name => {
        const nLower = name.toLowerCase();
        queryTokens.forEach(token => {
          if (nLower.includes(token)) {
            matchedTokens.add(token);
            score += 2;
          }
        });
      });

      // 5. Keyword Coverage Bonus
      if (queryTokens.length > 0) {
        const coverageRatio = matchedTokens.size / queryTokens.length;
        score += Math.round(coverageRatio * 35);
      }

      // 6. Section / Component Scale Tuning
      // Sweet spot for UI blocks is between 2 and 150 nodes
      if (summary.count >= 3 && summary.count <= 150) {
        score += 12;
      } else if (summary.count > 400) {
        score -= 20; // Penalize gigantic whole-screen / whole-canvas frames
      }

      if (score > 10) {
        candidates.push({
          node,
          score,
          summary,
          matchedTokens: Array.from(matchedTokens),
          coverage: queryTokens.length ? Math.round((matchedTokens.size / queryTokens.length) * 100) : 0
        });
      }
    }

    const children = getNodeChildren(node);
    for (const child of children) {
      traverse(child, depth + 1);
    }
  }

  traverse(root, 0);

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  // Format top results
  const topCandidates = candidates.slice(0, maxResults);

  return topCandidates.map(c => {
    const n = c.node;
    const colorMap = extractColors(n);
    const topColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([color, count]) => ({ color, count }));

    const typoMap = extractTypography(n);
    const topTypo = Array.from(typoMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([typography, count]) => ({ typography, count }));

    const assets = findAssetsForNode(n, manifest);

    const bbox = n.absoluteBoundingBox || n.size || null;

    return {
      id: n.id,
      name: n.name,
      type: n.type,
      relevanceScore: c.score,
      matchedKeywords: c.matchedTokens,
      keywordCoveragePercent: c.coverage,
      totalDescendantNodes: c.summary.count,
      dimensions: bbox ? { width: Math.round(bbox.width), height: Math.round(bbox.height) } : null,
      sampleTexts: c.summary.texts.slice(0, 6).map(t => t.text),
      designTokens: {
        dominantColors: topColors,
        dominantTypography: topTypo,
        referencedAssets: assets.map(a => a.asset)
      }
    };
  });
}

function extractBlockSpec(node, manifest) {
  if (!node) return null;

  const toHex = (c) => {
    if (!c) return null;
    const h = (v) => Math.round((v || 0) * 255).toString(16).padStart(2, "0");
    return ("#" + h(c.r) + h(c.g) + h(c.b)).toUpperCase();
  };

  // 1. Layout geometry
  const bbox = node.absoluteBoundingBox || { width: node.width || 0, height: node.height || 0 };
  const layout = {
    width: Math.round(bbox.width || node.width || 0),
    height: Math.round(bbox.height || node.height || 0),
    layoutMode: node.layoutMode || "NONE",
    primaryAxisAlignItems: node.primaryAxisAlignItems || "MIN",
    counterAxisAlignItems: node.counterAxisAlignItems || "MIN",
    padding: {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0,
    },
    itemSpacing: node.itemSpacing || 0,
  };

  // 2. Fills & Backgrounds
  const fills = (node.fills || node.backgrounds || []).map((f) => {
    const fillObj = { type: f.type, opacity: f.opacity != null ? f.opacity : 1 };
    if (f.color) fillObj.color = toHex(f.color);
    if (f.imageHash) fillObj.imageHash = f.imageHash;
    if (f.scaleMode) fillObj.scaleMode = f.scaleMode;
    return fillObj;
  });

  // 3. Effects (e.g. BACKGROUND_BLUR, DROP_SHADOW)
  const effects = (node.effects || []).map((e) => ({
    type: e.type,
    radius: e.radius,
    visible: e.visible !== false,
  }));

  // 4. Extract all text elements with their exact typography & color
  const allTexts = [];
  function collectTexts(n) {
    if (!n) return;
    if (n.characters && typeof n.characters === "string" && n.characters.trim().length > 0) {
      const textColor = (n.fills || []).find((f) => f.type === "SOLID" && f.color);
      allTexts.push({
        id: n.id,
        name: n.name,
        text: n.characters.trim(),
        fontFamily: n.fontName?.family || n.style?.fontFamily || "Inter",
        fontWeight: n.fontName?.style || n.style?.fontWeight || "Regular",
        fontSize: n.fontSize || n.style?.fontSize || 16,
        letterSpacing: n.letterSpacing?.value || n.style?.letterSpacing || 0,
        lineHeight: n.lineHeight?.value || n.style?.lineHeightPercent || 100,
        color: textColor ? toHex(textColor.color) : null,
      });
    }
    for (const child of getNodeChildren(n)) collectTexts(child);
  }
  collectTexts(node);

  // 5. Extract interactive components (Buttons, CTAs, Badges)
  const components = [];
  function collectComponents(n) {
    if (!n) return;
    const lower = (n.name || "").toLowerCase();
    if (n.type === "INSTANCE" || lower.includes("button") || lower.includes("badge") || lower.includes("cta")) {
      const btnFills = (n.fills || n.backgrounds || []).map((f) => ({
        type: f.type,
        color: f.color ? toHex(f.color) : null,
        opacity: f.opacity != null ? f.opacity : 1,
      }));
      const btnEffects = (n.effects || []).map((e) => ({
        type: e.type,
        radius: e.radius,
      }));
      const labelNode = getNodeChildren(n).find((c) => c.characters) || n;
      components.push({
        id: n.id,
        name: n.name,
        type: n.type,
        width: Math.round(n.width || 0),
        height: Math.round(n.height || 0),
        cornerRadius: n.cornerRadius || 0,
        padding: {
          top: n.paddingTop || 0,
          right: n.paddingRight || 0,
          bottom: n.paddingBottom || 0,
          left: n.paddingLeft || 0,
        },
        fills: btnFills,
        effects: btnEffects,
        label: labelNode.characters ? labelNode.characters.trim() : null,
      });
    }
    for (const child of getNodeChildren(n)) {
      if (n.type !== "INSTANCE") collectComponents(child);
    }
  }
  collectComponents(node);

  // 6. Matched assets
  const matchedAssets = findAssetsForNode(node, manifest);

  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    layout,
    fills,
    effects,
    typography: allTexts,
    components,
    assets: matchedAssets,
  };
}

// CLI Command Router
const args = process.argv.slice(2);
const command = args[0];

const fileArg = args.find(a => a.startsWith("--file="));
const customFilePath = fileArg ? fileArg.split("=")[1] : null;
const isDark = args.includes("--dark");

try {
  const { filePath: loadedFilePath, data: dump } = loadDump(customFilePath, isDark);
  const manifest = loadAssetManifest();

  switch (command) {
    case "list-pages": {
      const rootChildren = getNodeChildren(dump);
      const pages = rootChildren.map(p => ({
        id: p.id,
        name: p.name,
        childFrames: getNodeChildren(p).map(c => ({ id: c.id, name: (c.name || "").trim(), type: c.type }))
      }));
      console.log(JSON.stringify({ loadedFrom: loadedFilePath, pages }, null, 2));
      break;
    }

    case "list-frames": {
      const pageName = args[1] || "design";
      const rootChildren = getNodeChildren(dump);
      const page = rootChildren.find(p => (p.name || "").toLowerCase() === pageName.toLowerCase()) || rootChildren[0];
      if (!page) {
        console.error(`Page "${pageName}" not found.`);
        process.exit(1);
      }
      const frames = getNodeChildren(page).map(c => ({
        id: c.id,
        name: (c.name || "").trim(),
        type: c.type,
        childCount: getNodeChildren(c).length
      }));
      console.log(JSON.stringify({ loadedFrom: loadedFilePath, page: page.name, frames }, null, 2));
      break;
    }

    case "list-components": {
      const rootChildren = getNodeChildren(dump);
      const compPage = rootChildren.find(p => (p.name || "").toLowerCase().includes("component"));
      const target = compPage || dump;
      const components = findNodesByName(target, "").filter(n => n.type === "COMPONENT" || n.type === "COMPONENT_SET");
      console.log(JSON.stringify({ loadedFrom: loadedFilePath, total: components.length, components }, null, 2));
      break;
    }

    case "inspect-node": {
      const nodeId = args[1];
      if (!nodeId) {
        console.error("Usage: node scripts/figma-dump.mjs inspect-node <node_id> [--depth=<number>]");
        process.exit(1);
      }
      const node = findNodeById(dump, nodeId);
      if (!node) {
        console.error(`Node with ID "${nodeId}" not found in dump (${loadedFilePath}).`);
        process.exit(1);
      }
      const depthArg = args.find(a => a.startsWith("--depth="));
      const maxDepth = depthArg ? parseInt(depthArg.split("=")[1], 10) : 3;
      console.log(JSON.stringify(inspectNodeStructure(node, 0, maxDepth), null, 2));
      break;
    }

    case "get-node": {
      const nodeId = args[1];
      if (!nodeId) {
        console.error("Usage: node scripts/figma-dump.mjs get-node <node_id> [--depth=<number>]");
        process.exit(1);
      }
      const node = findNodeById(dump, nodeId);
      if (!node) {
        console.error(`Node with ID "${nodeId}" not found in dump (${loadedFilePath}).`);
        process.exit(1);
      }
      const depthArg = args.find(a => a.startsWith("--depth="));
      const maxDepth = depthArg ? parseInt(depthArg.split("=")[1], 10) : 3;
      console.log(JSON.stringify(getHierarchyTree(node, 0, maxDepth), null, 2));
      break;
    }

    case "extract-text": {
      const nodeId = args[1];
      if (!nodeId) {
        console.error("Usage: node scripts/figma-dump.mjs extract-text <node_id>");
        process.exit(1);
      }
      const node = findNodeById(dump, nodeId);
      if (!node) {
        console.error(`Node with ID "${nodeId}" not found in dump (${loadedFilePath}).`);
        process.exit(1);
      }
      const texts = extractTexts(node);
      console.log(JSON.stringify(texts, null, 2));
      break;
    }

    case "extract-colors": {
      const nodeId = args[1];
      const targetNode = nodeId ? findNodeById(dump, nodeId) : dump;
      if (!targetNode) {
        console.error(`Node "${nodeId}" not found.`);
        process.exit(1);
      }
      const colorMap = extractColors(targetNode);
      const sorted = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]);
      console.log(JSON.stringify(sorted.map(([color, count]) => ({ color, occurrences: count })), null, 2));
      break;
    }

    case "extract-typography": {
      const nodeId = args[1];
      const targetNode = nodeId ? findNodeById(dump, nodeId) : dump;
      if (!targetNode) {
        console.error(`Node "${nodeId}" not found.`);
        process.exit(1);
      }
      const typoMap = extractTypography(targetNode);
      const sorted = Array.from(typoMap.entries()).sort((a, b) => b[1] - a[1]);
      console.log(JSON.stringify(sorted.map(([typography, count]) => ({ typography, occurrences: count })), null, 2));
      break;
    }

    case "find-assets": {
      const nodeId = args[1];
      if (!nodeId) {
        console.error("Usage: node scripts/figma-dump.mjs find-assets <node_id>");
        process.exit(1);
      }
      const targetNode = findNodeById(dump, nodeId);
      if (!targetNode) {
        console.error(`Node "${nodeId}" not found.`);
        process.exit(1);
      }
      const assets = findAssetsForNode(targetNode, manifest);
      console.log(JSON.stringify(assets, null, 2));
      break;
    }

    case "search": {
      const query = args[1];
      if (!query) {
        console.error("Usage: node scripts/figma-dump.mjs search <query_text_or_name>");
        process.exit(1);
      }
      const matches = findNodesByName(dump, query);
      console.log(JSON.stringify(matches, null, 2));
      break;
    }

    case "deep-search": {
      const query = args[1];
      if (!query) {
        console.error('Usage: node scripts/figma-dump.mjs deep-search "<natural_language_description_or_keywords>" [--top=N]');
        process.exit(1);
      }
      const topArg = args.find(a => a.startsWith("--top="));
      const maxResults = topArg ? parseInt(topArg.split("=")[1], 10) : 5;

      const results = deepSearchNodes(dump, query, manifest, maxResults);
      console.log(JSON.stringify({
        loadedFrom: loadedFilePath,
        query,
        totalMatches: results.length,
        candidates: results
      }, null, 2));
      break;
    }

    case "extract-spec": {
      const nodeId = args[1];
      if (!nodeId) {
        console.error("Usage: node scripts/figma-dump.mjs extract-spec <node_id>");
        process.exit(1);
      }
      const targetNode = findNodeById(dump, nodeId);
      if (!targetNode) {
        console.error(`Node with ID "${nodeId}" not found in dump.`);
        process.exit(1);
      }
      const spec = extractBlockSpec(targetNode, manifest);
      console.log(JSON.stringify(spec, null, 2));
      break;
    }

    case "dump-raw": {
      const nodeId = args[1];
      if (!nodeId) {
        console.error("Usage: node scripts/figma-dump.mjs dump-raw <node_id>");
        process.exit(1);
      }
      const node = findNodeById(dump, nodeId);
      if (!node) {
        console.error(`Node with ID "${nodeId}" not found in dump.`);
        process.exit(1);
      }
      console.log(JSON.stringify(node, null, 2));
      break;
    }

    default: {
      console.log(`
Figma Dump Navigator Utility:
----------------------------
Deep Semantic Search (AI Vision Model Description -> AST Match):
  node scripts/figma-dump.mjs deep-search "<vision_description_or_keywords>" [--top=5]

Screen & Layer Inspection:
  node scripts/figma-dump.mjs list-pages
  node scripts/figma-dump.mjs list-frames [page_name]          (defaults to first page)
  node scripts/figma-dump.mjs list-components                  (lists library components)
  node scripts/figma-dump.mjs get-node <node_id> [--depth=N]   (inspect layer tree)
  node scripts/figma-dump.mjs extract-text <node_id>           (extract text strings)
  node scripts/figma-dump.mjs search <keyword>                 (search layer names)
  node scripts/figma-dump.mjs dump-raw <node_id>               (output raw json node)

Design System & Assets:
  node scripts/figma-dump.mjs extract-colors [node_id]         (extract color palette frequencies)
  node scripts/figma-dump.mjs extract-typography [node_id]     (extract font scale frequencies)
  node scripts/figma-dump.mjs find-assets <node_id>            (match SVG/PNG asset filepaths)

Flags:
  --file=<path>   Point directly to an AST JSON export file
  --dark          Read dark mode export dump instead of light mode
  --top=<number>  Limit candidates returned by deep-search (default: 5)
      `);
      break;
    }
  }
} catch (err) {
  console.error("Error navigating Figma dump:", err.message);
  process.exit(1);
}
