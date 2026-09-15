import fs from "fs";
import path from "path";

/**
 * Universal Dynamic Block Assembler with Component Vision Inspector
 * 
 * Compiles static HTML previews from decoupled modular component blocks
 * and equips every block with an interactive Inspector Badge in the top right.
 * Clicking the badge copies a structured vision agent prompt with coordinates,
 * component name, file path, and reference image directly to the clipboard.
 */

const rootDir = process.cwd();
const visionDir = path.join(rootDir, "inputs/vision");
const previewDir = path.join(rootDir, "dist-preview");
const previewBlocksDir = path.join(rootDir, "dist-preview/blocks");
const clientBlocksDir = path.join(rootDir, "dist-client/template-parts/blocks");

if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir, { recursive: true });
}

// Load Design Tokens and Block-Level Custom CSS
const tokensCssPath = path.join(rootDir, "src/styles/tokens.css");
const blocksCssPath = path.join(rootDir, "src/styles/blocks.css");
const tokensCssContent = fs.existsSync(tokensCssPath) ? fs.readFileSync(tokensCssPath, "utf-8") : "";
const blocksCssContent = fs.existsSync(blocksCssPath) ? fs.readFileSync(blocksCssPath, "utf-8") : "";

if (tokensCssContent) fs.writeFileSync(path.join(previewDir, "tokens.css"), tokensCssContent);
if (blocksCssContent) fs.writeFileSync(path.join(previewDir, "blocks.css"), blocksCssContent);

// Helper to escape HTML attributes
function escapeAttr(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Retrieve metadata for a block from vision JSON
function getLegacyBlockMetadata(blockFileName, pageSlug) {
  const baseName = blockFileName.replace(/\.(php|html)$/, "");
  
  // 1. Determine local file path
  let relativeFilePath = "";
  if (fs.existsSync(path.join(previewBlocksDir, "unique", `${baseName}.html`))) {
    relativeFilePath = `dist-preview/blocks/unique/${baseName}.html`;
  } else if (fs.existsSync(path.join(previewBlocksDir, "shared", `${baseName}.html`))) {
    relativeFilePath = `dist-preview/blocks/shared/${baseName}.html`;
  } else if (fs.existsSync(path.join(clientBlocksDir, "unique", `${baseName}.php`))) {
    relativeFilePath = `dist-client/template-parts/blocks/unique/${baseName}.php`;
  } else if (fs.existsSync(path.join(clientBlocksDir, "shared", `${baseName}.php`))) {
    relativeFilePath = `dist-client/template-parts/blocks/shared/${baseName}.php`;
  } else {
    relativeFilePath = `dist-preview/blocks/unique/${baseName}.html`;
  }

  // 2. Reference Image
  const referenceImage = `inputs/vision/${pageSlug}.png`;

  // 3. Query vision JSON spec for exact coordinates & notes
  let componentName = baseName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  let coords = "Dynamic / Responsive";
  let figmaNode = "N/A";
  let notes = "Component section block.";
  let keyFields = "";

  const jsonPath = path.join(visionDir, `${pageSlug}.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      const spec = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      if (Array.isArray(spec.blocks)) {
        const found = spec.blocks.find(b => {
          const schema = (b.targetSchema || "").toLowerCase();
          const title = (b.title || "").toLowerCase();
          const cleanBase = baseName.toLowerCase().replace(/-(shelf|grid|feed|cards|split|banner|options|nav|receipt|table|flow|feature)$/, "");

          return schema.includes(baseName) ||
                 baseName.includes(schema) ||
                 schema.includes(cleanBase) ||
                 title.includes(cleanBase) ||
                 (cleanBase.includes("category") && schema.includes("category")) ||
                 (cleanBase.includes("ingredient") && schema.includes("ingredient")) ||
                 (cleanBase.includes("header") && b.category?.toLowerCase().includes("header")) ||
                 (cleanBase.includes("footer") && b.category?.toLowerCase().includes("footer")) ||
                 (cleanBase.includes("instagram") && schema.includes("instagram")) ||
                 (cleanBase.includes("newsletter") && schema.includes("newsletter")) ||
                 (cleanBase.includes("best-sellers") && title.includes("best sellers")) ||
                 (cleanBase.includes("featured") && title.includes("featured")) ||
                 (cleanBase.includes("mask") && title.includes("mask")) ||
                 (cleanBase.includes("ritual") && schema.includes("ritual")) ||
                 (cleanBase.includes("cross-sell") && schema.includes("cross_sell")) ||
                 (cleanBase.includes("testimonials") && schema.includes("testimonials")) ||
                 (cleanBase.includes("oceanic") && schema.includes("overlay"));
        });

        if (found) {
          componentName = found.title || componentName;
          if (found.coordinates) {
            coords = `x: ${found.coordinates.x}%, y: ${found.coordinates.y}%, w: ${found.coordinates.width}%, h: ${found.coordinates.height}%`;
          }
          if (found.figmaNodeMap) {
            figmaNode = `${found.figmaNodeMap.nodeId} (${found.figmaNodeMap.nodeName || 'Layer'})`;
          }
          if (found.notes) notes = found.notes;
          if (Array.isArray(found.keyFields)) keyFields = found.keyFields.join(", ");
        }
      }
    } catch (e) {}
  }

  return {
    componentName,
    filePath: relativeFilePath,
    referenceImage,
    coords,
    figmaNode,
    notes,
    keyFields
  };
}

// Manifest-driven block metadata resolution
function getBlockMetadata(blockFileName, pageSlug) {
  const manifestPath = path.join(visionDir, `${pageSlug}.manifest.json`);

  // If manifest not yet built, fall through to legacy fuzzy method
  if (!fs.existsSync(manifestPath)) return getLegacyBlockMetadata(blockFileName, pageSlug);

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const baseName = blockFileName.replace(/\.(php|html)$/, "");

    // Deterministic lookup: find block whose artifact path or canonicalBasename matches baseName
    const entry = Object.entries(manifest.blocks || {}).find(([, block]) => {
      if (block.canonicalBasename === baseName) return true;
      return Object.values(block.artifacts || {}).some(p =>
        p && path.basename(p, path.extname(p)) === baseName
      );
    });

    if (!entry) return getLegacyBlockMetadata(blockFileName, pageSlug);

    const [blockId, block] = entry;
    const coordsStr = block.coordinates
      ? `x: ${block.coordinates.x}%, y: ${block.coordinates.y}%, w: ${block.coordinates.width}%, h: ${block.coordinates.height}%`
      : "Dynamic / Responsive";

    return {
      blockId,
      componentName: block.title,
      filePath: block.artifacts?.htmlBlock || block.artifacts?.phpTemplate || `dist-preview/blocks/${block.classification}/${baseName}.html`,
      referenceImage: manifest.sourceImage,
      coords: coordsStr,
      figmaNode: block.figmaNodeId ? `${block.figmaNodeId} (${block.figmaNodeName || 'Layer'})` : "N/A",
      notes: block.notes || "",
      keyFields: Array.isArray(block.keyFields) ? block.keyFields.join(", ") : ""
    };
  } catch (e) {
    return getLegacyBlockMetadata(blockFileName, pageSlug);
  }
}

// Convert block (HTML fragment or PHP template part) to clean client preview HTML with Inspector wrapper
function renderBlock(blockFileName, pageSlug) {
  const baseName = blockFileName.replace(/\.(php|html)$/, "");
  let rawContent = "";
  
  // 1. Check for dedicated HTML preview block first (Step 2: Visual Gate)
  const candidateHtmlPaths = [
    path.join(previewBlocksDir, "shared", `${baseName}.html`),
    path.join(previewBlocksDir, "unique", `${baseName}.html`),
  ];
  for (const p of candidateHtmlPaths) {
    if (fs.existsSync(p)) {
      rawContent = fs.readFileSync(p, "utf-8").trim();
      break;
    }
  }

  // 2. Fallback to Target CMS Template Parts (Step 3: Native Target Code)
  if (!rawContent) {
    const candidateClientPaths = [
      path.join(clientBlocksDir, "shared", `${baseName}.php`),
      path.join(clientBlocksDir, "unique", `${baseName}.php`),
      path.join(clientBlocksDir, "shared", blockFileName),
      path.join(clientBlocksDir, "unique", blockFileName),
    ];
    for (const p of candidateClientPaths) {
      if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, "utf-8");
        content = content.replace(/<\?php\s+echo\s+esc_html\([^)]*['"]([^'"]+)['"]\);\s*\?>/g, "$1");
        content = content.replace(/<\?php\s+echo\s+esc_url\([^)]*['"]([^'"]+)['"]\);\s*\?>/g, "$1");
        content = content.replace(/<\?php\s+echo\s+esc_attr\([^)]*['"]([^'"]+)['"]\);\s*\?>/g, "$1");
        content = content.replace(/<\?php[\s\S]*?\?>/g, "");
        rawContent = content.trim();
        break;
      }
    }
  }

  if (!rawContent) {
    rawContent = `<!-- Missing block: ${blockFileName} -->`;
  }

  const meta = getBlockMetadata(blockFileName, pageSlug);

  // Wrap in visual inspector container with interactive top-right badge
  return `
<!-- ======================================================= -->
<!-- Component Block: ${meta.componentName} -->
<!-- Source File: ${meta.filePath} -->
<!-- ======================================================= -->
<div class="cms-block-item relative group/inspector" 
     data-component-name="${escapeAttr(meta.componentName)}" 
     data-file-path="${escapeAttr(meta.filePath)}" 
     data-image="${escapeAttr(meta.referenceImage)}" 
     data-coords="${escapeAttr(meta.coords)}" 
     data-node="${escapeAttr(meta.figmaNode)}" 
     data-notes="${escapeAttr(meta.notes)}" 
     data-fields="${escapeAttr(meta.keyFields)}">

  <!-- Floating Component Info & Prompt Copy Badge (Top Right) -->
  <div class="cms-inspector-badge absolute top-3 right-3 z-40 transition-all duration-200 pointer-events-auto">
    <div class="relative group/tooltip inline-block">
      <button type="button" 
              onclick="copyComponentPrompt(this, event)" 
              title="Click to copy Vision Agent prompt to clipboard"
              class="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/90 hover:bg-black text-white text-[11px] font-mono rounded-lg backdrop-blur-md shadow-xl border border-white/20 hover:border-emerald-400 hover:scale-[1.02] transition-all cursor-pointer">
        <svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        <span class="font-semibold text-white tracking-tight">${meta.componentName}</span>
        <span class="text-neutral-400 text-[10px] hidden sm:inline">| ${meta.filePath.split('/').pop()}</span>
        <span class="ml-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-sans font-medium">
          📋 Copy Prompt
        </span>
      </button>

      <!-- Rich Hover Info Tooltip -->
      <div class="absolute right-0 top-full mt-2 w-80 p-3.5 bg-neutral-950/95 text-white text-xs rounded-xl shadow-2xl border border-white/15 backdrop-blur-xl opacity-0 translate-y-1 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-200 z-50 text-left">
        <div class="font-bold text-sm text-emerald-400 mb-1 flex items-center justify-between">
          <span>${meta.componentName}</span>
          <span class="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-neutral-300 font-mono">Figma: ${meta.figmaNode.split(' ')[0]}</span>
        </div>
        <div class="space-y-1.5 text-[11px] text-neutral-300 border-t border-neutral-800 pt-2 font-mono">
          <div><span class="text-neutral-500 font-sans">File:</span> <span class="text-white">${meta.filePath}</span></div>
          <div><span class="text-neutral-500 font-sans">Image:</span> <span class="text-white">${meta.referenceImage}</span></div>
          <div><span class="text-neutral-500 font-sans">Coords:</span> <span class="text-emerald-300">${meta.coords}</span></div>
          ${meta.keyFields ? `<div><span class="text-neutral-500 font-sans">Fields:</span> <span class="text-neutral-400 text-[10px]">${meta.keyFields}</span></div>` : ''}
          <div class="text-[11px] font-sans text-neutral-300 italic pt-1 border-t border-neutral-800/80 leading-snug line-clamp-3">
            "${meta.notes}"
          </div>
        </div>
        <div class="mt-2.5 pt-2 border-t border-neutral-800 text-[10px] text-emerald-400 font-semibold flex items-center justify-between">
          <span>👉 Click badge to copy prompt</span>
          <span class="text-neutral-500 font-normal">Ready for Vision Agent</span>
        </div>
      </div>
    </div>
  </div>

  ${rawContent}
</div>`;
}

function wrapDocument(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Skin—Clinic</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300..800&family=Inter:wght@300..900&display=swap" rel="stylesheet">
  <style>
    /* Global Design Tokens */
    ${tokensCssContent}

    /* Scoped Block-Level Custom Styles */
    ${blocksCssContent}

    body { font-family: 'Inter', -apple-system, sans-serif; letter-spacing: -0.04em; color: #000000; background-color: #FFFFFF; }
    h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Inter Tight', -apple-system, sans-serif; letter-spacing: -0.06em; }

    /* Interactive Component Inspector Styles */
    .cms-block-item {
      transition: outline 0.15s ease-in-out;
    }
    body.inspector-active .cms-block-item:hover {
      outline: 2px dashed rgba(16, 185, 129, 0.6);
      outline-offset: -2px;
    }
    body:not(.inspector-active) .cms-inspector-badge {
      display: none !important;
    }
  </style>
</head>
<body class="inspector-active bg-white text-black antialiased min-h-screen flex flex-col selection:bg-black selection:text-white">

  ${renderBlock("announcement-bar.php", title)}
  ${renderBlock("header-nav.php", title)}

  <main class="flex-1">
    ${bodyContent}
  </main>

  ${renderBlock("footer-global.php", title)}

  <!-- Floating Toast Notification -->
  <div id="inspector-toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-neutral-900/95 text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 text-xs font-mono flex items-center gap-3 pointer-events-none transition-all duration-300 opacity-0 translate-y-4">
    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
    <span id="toast-message">Copied Vision Agent Prompt!</span>
  </div>

  <!-- Global Inspector Floating Control (Bottom Right) -->
  <div class="fixed bottom-6 right-6 z-[9999] flex items-center gap-2">
    <button id="toggle-inspector-btn" onclick="toggleInspectorMode()" class="flex items-center gap-2.5 px-4 py-2.5 bg-black/90 hover:bg-black text-white text-xs font-medium rounded-full shadow-2xl border border-white/20 backdrop-blur-md transition-transform hover:scale-105 cursor-pointer">
      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
      <span class="font-semibold">Component Inspector</span>
      <span id="inspector-status-badge" class="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">ON</span>
    </button>
  </div>

  <!-- Inspector Interactive Script -->
  <script>
    let inspectorActive = true;

    function toggleInspectorMode() {
      inspectorActive = !inspectorActive;
      document.body.classList.toggle('inspector-active', inspectorActive);
      const statusBadge = document.getElementById('inspector-status-badge');
      if (statusBadge) {
        statusBadge.textContent = inspectorActive ? 'ON' : 'OFF';
        statusBadge.className = inspectorActive 
          ? 'px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold' 
          : 'px-2 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded font-mono font-bold';
      }
      showToast(inspectorActive ? 'Component Inspector: Enabled' : 'Component Inspector: Hidden');
    }

    function copyComponentPrompt(btn, event) {
      if (event) event.stopPropagation();
      const wrapper = btn.closest('.cms-block-item');
      if (!wrapper) return;

      const name = wrapper.getAttribute('data-component-name') || '';
      const file = wrapper.getAttribute('data-file-path') || '';
      const img = wrapper.getAttribute('data-image') || '';
      const coords = wrapper.getAttribute('data-coords') || '';
      const node = wrapper.getAttribute('data-node') || '';
      const notes = wrapper.getAttribute('data-notes') || '';
      const fields = wrapper.getAttribute('data-fields') || '';

      const promptText = \`Please inspect and fix the following component:
- Component Name: \${name}
- File Path: \${file}
- Reference Mockup Image: \${img}
- Bounding Coordinates: \${coords}
- Figma Node ID: \${node}
- Expected Notes & Requirements: \${notes}
- Key Fields: \${fields}

Prompt for Vision Agent:
Compare the rendered output of \${file} against the mockup image \${img} at \${coords}. Check layout structure, typography, spacing, colors, and interactive elements. Update \${file} to achieve 100% pixel-faithful parity with the design.\`;

      navigator.clipboard.writeText(promptText).then(() => {
        showToast(\`Copied prompt for "\${name}" to clipboard! 📋\`);
      }).catch(err => {
        // Fallback for non-https/file environments
        const textArea = document.createElement("textarea");
        textArea.value = promptText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showToast(\`Copied prompt for "\${name}" to clipboard! 📋\`);
        } catch (e) {
          alert("Prompt ready:\\n\\n" + promptText);
        }
        document.body.removeChild(textArea);
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('inspector-toast');
      const msgEl = document.getElementById('toast-message');
      if (!toast || !msgEl) return;

      msgEl.textContent = msg;
      toast.classList.remove('opacity-0', 'translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');

      clearTimeout(window.__toastTimeout);
      window.__toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-4');
      }, 2800);
    }
  </script>
</body>
</html>`;
}

// Page-to-Block Manifest Map (Decoupled & dynamic matching inputs/vision/*.json)
const PAGE_BLOCKS = {
  "Homepage": [
    "hero-editorial.html",
    "best-sellers-shelf.html",
    "category-spotlight.html",
    "featured-products-shelf.html",
    "sheet-mask-feature.html",
    "journal-teaser.html",
    "dual-promo-cards.html",
    "oceanic-banner.html",
    "testimonials-slider.html",
    "instagram-gallery.html",
    "newsletter-banner.html"
  ],
  "product List page": [
    "plp-faceted-catalog.html",
    "instagram-gallery.html",
    "newsletter-banner.html"
  ],
  "product Details page": [
    "pdp-buy-box.html",
    "daily-ritual-split.html",
    "active-ingredients-cards.html",
    "pdp-accordion-specs.html",
    "cross-sell-shelf.html",
    "testimonials-slider.html",
    "instagram-gallery.html",
    "newsletter-banner.html"
  ],
  "About Us": [
    "about-manifesto.html",
    "split-narrative.html",
    "testimonials-slider.html",
    "newsletter-banner.html"
  ],
  "Journal Articles": [
    "journal-grid.html",
    "newsletter-banner.html"
  ],
  "Article": [
    "article-prose.html",
    "newsletter-banner.html"
  ],
  "Bag with Products": [
    "cart-table.html",
    "cross-sell-shelf.html",
    "instagram-gallery.html"
  ],
  "Bag Empty": [
    "cart-empty-state.html",
    "category-spotlight.html",
    "newsletter-banner.html"
  ],
  "Checkout Form": [
    "checkout-flow.html"
  ],
  "Checkout Success": [
    "checkout-success-receipt.html"
  ]
};

console.log("\n=======================================================");
console.log("   DYNAMIC BLOCK ASSEMBLER: COMPILING ALL 10 SCREENS   ");
console.log("=======================================================\n");

Object.entries(PAGE_BLOCKS).forEach(([slug, blocks]) => {
  const body = blocks.map(b => renderBlock(b, slug)).join("\n");
  const html = wrapDocument(slug, body);
  const outPath = path.join(previewDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, "utf-8");
  console.log(`✔ Dynamically Assembled: \x1b[32m${outPath}\x1b[0m (${blocks.length} modular blocks with Inspector Badges)`);
});

console.log("\n🎉 All 10 screens dynamically assembled with Interactive Component Inspector!\n");
