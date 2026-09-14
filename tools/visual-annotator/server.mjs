#!/usr/bin/env node

/**
 * Visual Block Annotator — Standalone Micro Server
 * Zero dependencies, ultra-fast, robust local disk bridge.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Parse Command Line Arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return defaultValue;
}

let inputDir = path.resolve(process.cwd(), getArg('--input', './inputs'));
let outputDir = path.resolve(process.cwd(), getArg('--output', inputDir));
const port = parseInt(getArg('--port', '4040'), 10);
let activePreset = getArg('--preset', null);
const presetsDir = path.resolve(__dirname, 'presets');
let baseConfigFile = path.resolve(__dirname, 'annotator.config.json');

function getEffectiveConfig() {
  let baseConfig = {};
  if (fs.existsSync(baseConfigFile)) {
    baseConfig = JSON.parse(fs.readFileSync(baseConfigFile, 'utf-8'));
  }
  if (activePreset) {
    const presetFile = path.resolve(presetsDir, `preset.${activePreset}.json`);
    if (fs.existsSync(presetFile)) {
      try {
        const presetData = JSON.parse(fs.readFileSync(presetFile, 'utf-8'));
        if (presetData.taxonomy) {
          baseConfig.taxonomy = presetData.taxonomy;
        }
        baseConfig.currentPresetName = presetData.name || activePreset;
      } catch (e) {
        console.error('Error loading preset:', e);
      }
    }
  }
  return baseConfig;
}

// Ensure directories exist
if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 2. MIME Types Helper
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

// 3. Helper: Read JSON Request Body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// 4. Helper: Parse companion .txt note back into blocks
function parseAnnotationText(rawText) {
  const result = {
    frontmatter: {},
    pageOverview: '',
    blocks: []
  };

  if (!rawText || !rawText.trim()) return result;

  let content = rawText;

  // Extract YAML frontmatter
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (fmMatch) {
    const yamlLines = fmMatch[1].split(/\r?\n/);
    for (const line of yamlLines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join(':').trim();
        result.frontmatter[key] = val.replace(/^["']|["']$/g, '');
      }
    }
    content = content.slice(fmMatch[0].length);
  }

  // Extract Page Overview before the first block
  const firstBlockIdx = content.search(/##\s+\[?Block/i);
  if (firstBlockIdx !== -1) {
    const overviewChunk = content.substring(0, firstBlockIdx).trim();
    result.pageOverview = overviewChunk.replace(/^#\s+[^\r\n]+\r?\n/, '').replace(/^---/gm, '').trim();
    content = content.substring(firstBlockIdx);
  } else {
    result.pageOverview = content.replace(/^#\s+[^\r\n]+\r?\n/, '').trim();
    return result;
  }

  // Split and parse individual blocks
  const blockChunks = content.split(/---?\s*(?=##\s+\[?Block)/i);
  for (const chunk of blockChunks) {
    if (!chunk.trim()) continue;
    const titleMatch = chunk.match(/##\s+\[?Block\s*\d*\]?:?\s*([^\r\n]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Unnamed Block';

    // Parse coordinates
    const coordsMatch = chunk.match(/Coordinates\*\*?:\s*X:\s*([\d.]+)%?,\s*Y:\s*([\d.]+)%?,\s*Width:\s*([\d.]+)%?,\s*Height:\s*([\d.]+)%?/i);
    const x = coordsMatch ? parseFloat(coordsMatch[1]) : 10;
    const y = coordsMatch ? parseFloat(coordsMatch[2]) : 10;
    const width = coordsMatch ? parseFloat(coordsMatch[3]) : 30;
    const height = coordsMatch ? parseFloat(coordsMatch[4]) : 20;

    // Parse category
    const catMatch = chunk.match(/Category\*\*?:\s*([^\r\n]+)/i);
    const category = catMatch ? catMatch[1].trim() : 'General Block';

    // Parse entity type
    const entityMatch = chunk.match(/Target Entity|Entity Type\*\*?:\s*([^\r\n]+)/i);
    let entityType = 'ui_component';
    if (entityMatch) {
      const rawEntity = entityMatch[1].toLowerCase();
      if (rawEntity.includes('metaobject')) entityType = 'metaobject';
      else if (rawEntity.includes('metafield')) entityType = 'product_metafield';
      else if (rawEntity.includes('collection')) entityType = 'collection';
    }

    // Parse key fields
    const fieldsMatch = chunk.match(/Key Fields\*\*?:\s*([^\r\n]+)/i);
    const keyFields = fieldsMatch ? fieldsMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [];

    // Parse Figma Node Map
    let figmaNodeMap = null;
    const figmaMatch = chunk.match(/Figma Node Map\*\*?:\s*(?:NodeID:\s*`?([^`|\r\n]+)`?)?(?:\s*\|\s*Note:\s*([^\r\n]+))?/i);
    if (figmaMatch && (figmaMatch[1] || figmaMatch[2])) {
      figmaNodeMap = {
        nodeId: figmaMatch[1] ? figmaMatch[1].trim() : '',
        inspectNotes: figmaMatch[2] ? figmaMatch[2].trim() : ''
      };
    }

    // Parse notes / requirements
    let notes = '';
    const notesMatch = chunk.match(/Requirements\s*&\s*Notes\*\*?:?\s*([\s\S]*)$/i);
    if (notesMatch) {
      notes = notesMatch[1].trim();
    }

    result.blocks.push({
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      category,
      entityType,
      keyFields,
      figmaNodeMap,
      notes,
      x,
      y,
      width,
      height
    });
  }

  return result;
}

// 5. Helper: Serialize Blocks to Hybrid YAML + Markdown
function serializeAnnotationText({ slug, title, pageOverview, blocks = [], frontmatter = {} }) {
  const dateStr = new Date().toISOString();
  
  let out = `---\n`;
  out += `page_slug: "${slug}"\n`;
  out += `page_title: "${title || slug}"\n`;
  for (const [k, v] of Object.entries(frontmatter)) {
    if (!['page_slug', 'page_title', 'total_blocks', 'annotated_at', 'generator'].includes(k)) {
      out += `${k}: "${v}"\n`;
    }
  }
  out += `total_blocks: ${blocks.length}\n`;
  out += `annotated_at: "${dateStr}"\n`;
  out += `generator: "VisualBlockAnnotator-v1.0.0"\n`;
  out += `---\n\n`;

  out += `# ${title || slug}\n\n`;
  if (pageOverview && pageOverview.trim()) {
    out += `${pageOverview.trim()}\n\n`;
  }

  blocks.forEach((b, index) => {
    out += `---\n\n`;
    out += `## [Block ${index + 1}] ${b.title || 'Untitled Block'}\n`;
    out += `- **Coordinates**: X: ${Number(b.x).toFixed(2)}%, Y: ${Number(b.y).toFixed(2)}%, Width: ${Number(b.width).toFixed(2)}%, Height: ${Number(b.height).toFixed(2)}%\n`;
    out += `- **Category**: ${b.category || 'General Section'}\n`;
    
    let entityLabel = 'Standard UI Component';
    if (b.entityType === 'metaobject') entityLabel = `Metaobject (${b.targetSchema || 'custom_model'})`;
    else if (b.entityType === 'product_metafield') entityLabel = `Product Metafield (${b.targetSchema || 'custom.attribute'})`;
    else if (b.entityType === 'collection') entityLabel = `Collection`;
    
    out += `- **Target Entity**: ${entityLabel}\n`;
    if (b.figmaNodeMap && (b.figmaNodeMap.nodeId || b.figmaNodeMap.inspectNotes)) {
      out += `- **Figma Node Map**: NodeID: \`${b.figmaNodeMap.nodeId || 'N/A'}\`${b.figmaNodeMap.inspectNotes ? ` | Note: ${b.figmaNodeMap.inspectNotes}` : ''}\n`;
    }
    if (b.keyFields && b.keyFields.length > 0) {
      out += `- **Key Fields**: ${b.keyFields.join(', ')}\n`;
    }
    out += `- **Requirements & Notes**:\n`;
    const notesBody = b.notes ? b.notes.split('\n').map(l => `  ${l}`).join('\n') : '  No specific notes provided.';
    out += `${notesBody}\n\n`;
  });

  return out;
}

// 6. Server Request Router
const server = http.createServer(async (req, res) => {
  // Enable CORS for flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${port}`);
  const pathname = parsedUrl.pathname;

  try {
    // API: Get Current Configuration
    if (pathname === '/api/config') {
      const config = getEffectiveConfig();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ...config,
        currentPreset: activePreset || 'default',
        currentPaths: {
          inputDir,
          outputDir
        }
      }));
      return;
    }

    // API: List Available Presets
    if (pathname === '/api/presets') {
      const presets = [
        { id: 'default', name: 'Default (Original)' }
      ];
      if (fs.existsSync(presetsDir)) {
        const files = fs.readdirSync(presetsDir);
        for (const file of files) {
          if (file.startsWith('preset.') && file.endsWith('.json')) {
            const id = file.replace(/^preset\./, '').replace(/\.json$/, '');
            try {
              const pData = JSON.parse(fs.readFileSync(path.join(presetsDir, file), 'utf-8'));
              presets.push({ id, name: pData.name || id });
            } catch (err) {
              presets.push({ id, name: id });
            }
          }
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ presets, activePreset: activePreset || 'default' }));
      return;
    }

    // API: Set Active Preset dynamically
    if (pathname === '/api/set-preset' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      if (data.preset !== undefined) {
        activePreset = (data.preset === 'default' || !data.preset) ? null : data.preset;
      }
      const updatedConfig = getEffectiveConfig();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        activePreset: activePreset || 'default',
        taxonomy: updatedConfig.taxonomy
      }));
      return;
    }

    // API: Update Working Folders dynamically
    if (pathname === '/api/set-directories' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      if (data.inputDir) {
        inputDir = path.resolve(process.cwd(), data.inputDir);
        if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
      }
      if (data.outputDir) {
        outputDir = path.resolve(process.cwd(), data.outputDir);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, inputDir, outputDir }));
      return;
    }

    // API: List Images & Companion Notes (.json first, fallback to .txt)
    if (pathname === '/api/files') {
      const targetIn = parsedUrl.searchParams.get('inputDir') 
        ? path.resolve(process.cwd(), parsedUrl.searchParams.get('inputDir')) 
        : inputDir;

      const targetOut = parsedUrl.searchParams.get('outputDir') 
        ? path.resolve(process.cwd(), parsedUrl.searchParams.get('outputDir')) 
        : outputDir;

      if (!fs.existsSync(targetIn)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ files: [], inputDir: targetIn, outputDir: targetOut }));
        return;
      }

      const dirEntries = fs.readdirSync(targetIn, { withFileTypes: true });
      const files = [];

      for (const entry of dirEntries) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTS.has(ext)) {
          const slug = path.basename(entry.name, ext);
          const jsonPath = path.join(targetOut, `${slug}.json`);
          const txtPath = path.join(targetOut, `${slug}.txt`);
          
          let hasAnnotation = false;
          let annotationData = null;

          // Prefer reading strictly-typed .json first for 100% fidelity modifications
          if (fs.existsSync(jsonPath)) {
            try {
              const rawJson = fs.readFileSync(jsonPath, 'utf-8');
              const parsed = JSON.parse(rawJson);
              hasAnnotation = true;
              annotationData = {
                frontmatter: parsed.frontmatter || {},
                pageOverview: parsed.pageOverview || '',
                blocks: parsed.blocks || []
              };
            } catch (err) {
              console.error(`Error reading ${jsonPath}:`, err.message);
            }
          } 
          // Fallback to reading legacy .txt if .json doesn't exist yet
          else if (fs.existsSync(txtPath)) {
            try {
              const rawTxt = fs.readFileSync(txtPath, 'utf-8');
              hasAnnotation = true;
              annotationData = parseAnnotationText(rawTxt);
            } catch (err) {
              console.error(`Error reading ${txtPath}:`, err.message);
            }
          }

          files.push({
            name: entry.name,
            slug,
            ext,
            imageUrl: `/media/${encodeURIComponent(entry.name)}`,
            hasAnnotation,
            annotation: annotationData
          });
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files, inputDir: targetIn, outputDir: targetOut }));
      return;
    }

    // API: Save Annotation Files (Both .json for lossless state + .txt for human/AI reading)
    if (pathname === '/api/save' && req.method === 'POST') {
      const payload = await parseJsonBody(req);
      const { slug, title, pageOverview, blocks, frontmatter, customOutputDir } = payload;

      if (!slug) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing slug in request payload' }));
        return;
      }

      const saveDir = customOutputDir ? path.resolve(process.cwd(), customOutputDir) : outputDir;
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      const jsonFile = path.join(saveDir, `${slug}.json`);
      const txtFile = path.join(saveDir, `${slug}.txt`);

      // 1. Structured JSON representation for 100% lossless editing & modification
      const jsonStructure = {
        slug,
        title: title || slug,
        pageOverview: pageOverview || '',
        frontmatter: frontmatter || {},
        totalBlocks: blocks?.length || 0,
        updatedAt: new Date().toISOString(),
        blocks: (blocks || []).map((b, idx) => ({
          id: b.id || `block_${idx + 1}`,
          title: b.title || `Block ${idx + 1}`,
          category: b.category || 'General Section',
          entityType: b.entityType || 'ui_component',
          targetSchema: b.targetSchema || '',
          keyFields: b.keyFields || [],
          notes: b.notes || '',
          coordinates: {
            x: Number(b.x || 0),
            y: Number(b.y || 0),
            width: Number(b.width || 0),
            height: Number(b.height || 0)
          }
        }))
      };

      // Write .json file
      fs.writeFileSync(jsonFile, JSON.stringify(jsonStructure, null, 2), 'utf-8');

      // 2. Also write human/AI readable .txt file
      const formattedContent = serializeAnnotationText({
        slug,
        title: title || slug,
        pageOverview,
        blocks,
        frontmatter
      });
      fs.writeFileSync(txtFile, formattedContent, 'utf-8');

      console.log(`\x1b[32m✔ [Saved Annotation]\x1b[0m ${jsonFile} & ${txtFile} (${blocks?.length || 0} blocks)`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        jsonPath: jsonFile,
        txtPath: txtFile,
        bytesWritten: Buffer.byteLength(formattedContent, 'utf-8'),
        blockCount: blocks?.length || 0
      }));
      return;
    }

    // Serve Image Files dynamically from the active inputDir
    if (pathname.startsWith('/media/')) {
      const fileName = decodeURIComponent(pathname.replace('/media/', ''));
      const filePath = path.join(inputDir, fileName);

      // Path traversal security check
      if (!filePath.startsWith(inputDir) || !fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Image Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Serve Public UI Static Assets
    let staticPath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(staticPath)) {
      staticPath = path.join(__dirname, 'public', 'index.html');
    }

    const ext = path.extname(staticPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'text/html; charset=utf-8';

    if (fs.existsSync(staticPath)) {
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(staticPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(port, () => {
  console.log('\n======================================================');
  console.log('   VISUAL BLOCK ANNOTATOR — STANDALONE STUDIO SERVER  ');
  console.log('======================================================\n');
  console.log(`  🚀 Web Studio:       \x1b[36mhttp://localhost:${port}\x1b[0m`);
  console.log(`  📂 Input Directory:  \x1b[33m${inputDir}\x1b[0m`);
  console.log(`  💾 Output Directory: \x1b[32m${outputDir}\x1b[0m\n`);
  console.log('Ready for annotations! Press Ctrl+C to stop.\n');
});
