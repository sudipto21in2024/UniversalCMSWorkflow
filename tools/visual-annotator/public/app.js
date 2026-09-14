/**
 * Visual Block Annotator Studio — Interactive Client Logic
 */

(function () {
  // State
  let config = {
    taxonomy: {
      entityTypes: [
        { id: 'metaobject', label: 'Shopify Metaobject', color: '#D6B992' },
        { id: 'product_metafield', label: 'Product Metafield', color: '#34D399' },
        { id: 'collection', label: 'Curated Collection', color: '#C084FC' },
        { id: 'ui_component', label: 'Standard UI Section', color: '#60A5FA' },
        { id: 'custom', label: 'Custom Tag', color: '#F472B6' }
      ],
      categories: [
        'Hero Editorial',
        'Interactive Radar Canvas',
        'Product Grid / Showcase',
        'Craftsmanship Narrative',
        'Artisan Counter / Metrics',
        'Lead Capture / Modal Form',
        'Header & Navigation',
        'Footer & Disclaimers'
      ]
    },
    currentPaths: {
      inputDir: './inputs',
      outputDir: './inputs'
    }
  };

  let filesList = [];
  let currentFile = null;
  let blocks = [];
  let selectedBlockId = null;
  let pageTitle = '';
  let pageOverview = '';
  let frontmatter = {};

  let currentMode = 'draw'; // 'draw' | 'select'
  let zoomLevel = 1.0;

  // Drawing State
  let isDrawing = false;
  let startX = 0;
  let startY = 0;

  // DOM Elements
  const imageSelect = document.getElementById('imageSelect');
  const activeImage = document.getElementById('activeImage');
  const canvasContainer = document.getElementById('canvasContainer');
  const canvasViewport = document.getElementById('canvasViewport');
  const canvasEmptyState = document.getElementById('canvasEmptyState');
  const annotationLayer = document.getElementById('annotationLayer');
  const drawingGhost = document.getElementById('drawingGhost');

  const btnDrawMode = document.getElementById('btnDrawMode');
  const btnSelectMode = document.getElementById('btnSelectMode');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomFit = document.getElementById('btnZoomFit');
  const zoomLabel = document.getElementById('zoomLabel');

  const btnDirSettings = document.getElementById('btnDirSettings');
  const presetSelect = document.getElementById('presetSelect');
  const btnPreviewTxt = document.getElementById('btnPreviewTxt');
  const btnSaveTxt = document.getElementById('btnSaveTxt');
  const btnRefreshFiles = document.getElementById('btnRefreshFiles');

  // Inspector Elements
  const noSelectionNotice = document.getElementById('noSelectionNotice');
  const blockForm = document.getElementById('blockForm');
  const blockIndexBadge = document.getElementById('blockIndexBadge');
  const btnDeleteBlock = document.getElementById('btnDeleteBlock');
  const blockTitleInput = document.getElementById('blockTitle');
  const blockCategorySelect = document.getElementById('blockCategory');
  const blockEntitySelect = document.getElementById('blockEntity');
  const blockSchemaNameInput = document.getElementById('blockSchemaName');
  const blockKeyFieldsInput = document.getElementById('blockKeyFields');
  const blockFigmaNodeIdInput = document.getElementById('blockFigmaNodeId');
  const blockFigmaInspectNotesInput = document.getElementById('blockFigmaInspectNotes');
  const blockNotesInput = document.getElementById('blockNotes');
  const deepSearchNotice = document.getElementById('deepSearchNotice');

  const valX = document.getElementById('valX');
  const valY = document.getElementById('valY');
  const valW = document.getElementById('valW');
  const valH = document.getElementById('valH');

  const layerCount = document.getElementById('layerCount');
  const layersList = document.getElementById('layersList');
  const btnClearAllBlocks = document.getElementById('btnClearAllBlocks');

  const pageTitleInput = document.getElementById('pageTitle');
  const pageSlugInput = document.getElementById('pageSlug');
  const pageOverviewInput = document.getElementById('pageOverview');

  // Modals
  const dirModal = document.getElementById('dirModal');
  const btnCloseDirModal = document.getElementById('btnCloseDirModal');
  const btnCancelDir = document.getElementById('btnCancelDir');
  const btnApplyDir = document.getElementById('btnApplyDir');
  const inputDirPath = document.getElementById('inputDirPath');
  const outputDirPath = document.getElementById('outputDirPath');

  const previewModal = document.getElementById('previewModal');
  const btnClosePreviewModal = document.getElementById('btnClosePreviewModal');
  const previewSlug = document.getElementById('previewSlug');
  const previewCode = document.getElementById('previewCode');
  const btnCopyPreview = document.getElementById('btnCopyPreview');
  const btnDownloadPreview = document.getElementById('btnDownloadPreview');
  const btnSaveFromPreview = document.getElementById('btnSaveFromPreview');

  const toast = document.getElementById('toast');

  // 1. Initialize
  async function init() {
    setupTabs();
    setupEventListeners();
    await loadConfig();
    populateTaxonomyDropdowns();
    await loadFiles();
  }

  // 2. Load Config & Presets from Server
  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        config = { ...config, ...data };
      }
      
      if (presetSelect) {
        const pRes = await fetch('/api/presets');
        if (pRes.ok) {
          const pData = await pRes.json();
          presetSelect.innerHTML = '';
          (pData.presets || []).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name || p.id;
            if (p.id === (config.currentPreset || 'default')) {
              opt.selected = true;
            }
            presetSelect.appendChild(opt);
          });
        }
      }
    } catch (e) {
      console.warn('Could not load config from server, using defaults:', e);
    }
  }

  function populateTaxonomyDropdowns() {
    blockCategorySelect.innerHTML = '';
    config.taxonomy.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      blockCategorySelect.appendChild(opt);
    });

    blockEntitySelect.innerHTML = '';
    config.taxonomy.entityTypes.forEach(ent => {
      const opt = document.createElement('option');
      opt.value = ent.id;
      opt.textContent = ent.label;
      blockEntitySelect.appendChild(opt);
    });
  }

  // 3. Load Files List
  async function loadFiles() {
    try {
      imageSelect.innerHTML = '<option value="">Scanning files...</option>';
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      filesList = data.files || [];

      imageSelect.innerHTML = '';
      if (filesList.length === 0) {
        imageSelect.innerHTML = '<option value="">No mockups found in folder</option>';
        showEmptyState(true);
        return;
      }

      filesList.forEach((f, idx) => {
        const opt = document.createElement('option');
        opt.value = f.slug;
        const statusIcon = f.hasAnnotation ? '✔' : '○';
        opt.textContent = `${statusIcon} ${f.name} (${f.hasAnnotation ? 'Annotated' : 'New'})`;
        imageSelect.appendChild(opt);
      });

      // Select first image by default
      selectFile(filesList[0].slug);
    } catch (err) {
      console.error(err);
      showToast('Error loading file list: ' + err.message);
    }
  }

  // 4. Select and Render Active Mockup
  function selectFile(slug) {
    const file = filesList.find(f => f.slug === slug);
    if (!file) return;

    currentFile = file;
    imageSelect.value = slug;
    pageSlugInput.value = slug;
    showEmptyState(false);

    activeImage.src = file.imageUrl;
    activeImage.onload = () => {
      // Restore annotations if they exist (supports both JSON and TXT restored state)
      if (file.annotation) {
        pageTitle = file.annotation.frontmatter.page_title || file.annotation.title || formatTitleFromSlug(slug);
        pageOverview = file.annotation.pageOverview || '';
        frontmatter = file.annotation.frontmatter || {};

        // Normalize blocks (handling nested .coordinates object from JSON or flat x/y/w/h)
        blocks = (file.annotation.blocks || []).map((b, idx) => ({
          id: b.id || `block_${idx + 1}`,
          title: b.title || `Block ${idx + 1}`,
          category: b.category || config.taxonomy.categories[0] || 'General Section',
          entityType: b.entityType || 'ui_component',
          targetSchema: b.targetSchema || '',
          keyFields: b.keyFields || [],
          notes: b.notes || '',
          x: Number(b.coordinates?.x ?? b.x ?? 0),
          y: Number(b.coordinates?.y ?? b.y ?? 0),
          width: Number(b.coordinates?.width ?? b.width ?? 0),
          height: Number(b.coordinates?.height ?? b.height ?? 0)
        }));
      } else {
        pageTitle = formatTitleFromSlug(slug);
        pageOverview = '';
        frontmatter = {};
        blocks = [];
      }

      pageTitleInput.value = pageTitle;
      pageOverviewInput.value = pageOverview;

      selectedBlockId = blocks.length > 0 ? blocks[0].id : null;

      // Auto-fit image to screen on load
      fitImageToScreen();

      renderAllBlocks();
      updateInspector();
      updateLayersList();
    };
  }

  function formatTitleFromSlug(slug) {
    return slug
      .split(/[-_]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  function showEmptyState(show) {
    canvasEmptyState.style.display = show ? 'block' : 'none';
    canvasContainer.style.display = show ? 'none' : 'inline-block';
  }

  // 5. Canvas Drawing & Coordinates Normalization
  function getCanvasRelativeCoords(e) {
    const rect = activeImage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to 0 - 100%
    const normX = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const normY = Math.max(0, Math.min(100, (clickY / rect.height) * 100));

    return { normX, normY, pxX: clickX, pxY: clickY, rectW: rect.width, rectH: rect.height };
  }

  annotationLayer.addEventListener('mousedown', (e) => {
    if (currentMode !== 'draw' || !currentFile) return;
    if (e.target.closest('.bbox')) return; // ignore clicking existing box in draw mode

    isDrawing = true;
    const coords = getCanvasRelativeCoords(e);
    startX = coords.normX;
    startY = coords.normY;

    drawingGhost.style.display = 'block';
    drawingGhost.style.left = `${startX}%`;
    drawingGhost.style.top = `${startY}%`;
    drawingGhost.style.width = '0%';
    drawingGhost.style.height = '0%';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const coords = getCanvasRelativeCoords(e);
    const currX = coords.normX;
    const currY = coords.normY;

    const left = Math.min(startX, currX);
    const top = Math.min(startY, currY);
    const width = Math.abs(currX - startX);
    const height = Math.abs(currY - startY);

    drawingGhost.style.left = `${left}%`;
    drawingGhost.style.top = `${top}%`;
    drawingGhost.style.width = `${width}%`;
    drawingGhost.style.height = `${height}%`;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    drawingGhost.style.display = 'none';

    const coords = getCanvasRelativeCoords(e);
    const left = Math.min(startX, coords.normX);
    const top = Math.min(startY, coords.normY);
    const width = Math.abs(coords.normX - startX);
    const height = Math.abs(coords.normY - startY);

    // Minimum size check (1.5%)
    if (width < 1.5 || height < 1.5) return;

    // Create new block
    const newBlockIndex = blocks.length + 1;
    const newBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `Block ${newBlockIndex}`,
      category: config.taxonomy.categories[0] || 'Hero Editorial',
      entityType: 'metaobject',
      targetSchema: '',
      keyFields: [],
      notes: '',
      x: Number(left.toFixed(2)),
      y: Number(top.toFixed(2)),
      width: Number(width.toFixed(2)),
      height: Number(height.toFixed(2))
    };

    blocks.push(newBlock);
    selectedBlockId = newBlock.id;
    renderAllBlocks();
    updateInspector();
    updateLayersList();

    // Switch tab to Inspector
    switchTab('tab-block');
    blockTitleInput.focus();
    blockTitleInput.select();
  });

  // 6. Interactive Drag-Move and Resize Handling
  let isManipulating = false;
  let manipulationType = null; // 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
  let manipBlockId = null;
  let origBlock = null;
  let startMouseCoords = null;

  function renderAllBlocks() {
    annotationLayer.innerHTML = '';
    layerCount.textContent = blocks.length;

    blocks.forEach((b, index) => {
      const isSelected = b.id === selectedBlockId;
      const box = document.createElement('div');
      box.className = `bbox ${isSelected ? 'selected' : ''}`;
      box.setAttribute('data-id', b.id);
      box.setAttribute('data-entity', b.entityType);

      box.style.left = `${b.x}%`;
      box.style.top = `${b.y}%`;
      box.style.width = `${b.width}%`;
      box.style.height = `${b.height}%`;

      // Badge
      const badge = document.createElement('div');
      badge.className = 'bbox-badge';
      badge.textContent = `#${index + 1} ${b.title || 'Block'}`;
      box.appendChild(badge);

      // 8-Point Resize Handles (rendered when selected)
      if (isSelected) {
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        handles.forEach(h => {
          const handleEl = document.createElement('div');
          handleEl.className = `resize-handle handle-${h}`;
          handleEl.setAttribute('data-handle', h);
          handleEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isManipulating = true;
            manipulationType = h;
            manipBlockId = b.id;
            origBlock = { ...b };
            startMouseCoords = getCanvasRelativeCoords(e);
          });
          box.appendChild(handleEl);
        });
      }

      // Mouse Down on Box: Select and Start Moving
      box.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        e.stopPropagation();

        selectedBlockId = b.id;
        renderAllBlocks();
        updateInspector();
        updateLayersList();
        switchTab('tab-block');

        // Initiate Box Drag Move
        isManipulating = true;
        manipulationType = 'move';
        manipBlockId = b.id;
        origBlock = { ...b };
        startMouseCoords = getCanvasRelativeCoords(e);
      });

      annotationLayer.appendChild(box);
    });
  }

  // Global mousemove for moving & resizing boxes
  window.addEventListener('mousemove', (e) => {
    if (!isManipulating || !origBlock || !manipBlockId) return;

    const currCoords = getCanvasRelativeCoords(e);
    const dx = currCoords.normX - startMouseCoords.normX;
    const dy = currCoords.normY - startMouseCoords.normY;

    const block = blocks.find(b => b.id === manipBlockId);
    if (!block) return;

    if (manipulationType === 'move') {
      // Move Box with boundary clamping
      let newX = Math.max(0, Math.min(100 - origBlock.width, origBlock.x + dx));
      let newY = Math.max(0, Math.min(100 - origBlock.height, origBlock.y + dy));
      block.x = Number(newX.toFixed(2));
      block.y = Number(newY.toFixed(2));
    } else {
      // 8-Point Resizing Logic
      let newX = origBlock.x;
      let newY = origBlock.y;
      let newW = origBlock.width;
      let newH = origBlock.height;

      if (manipulationType.includes('e')) {
        newW = Math.max(1.5, Math.min(100 - origBlock.x, origBlock.width + dx));
      }
      if (manipulationType.includes('s')) {
        newH = Math.max(1.5, Math.min(100 - origBlock.y, origBlock.height + dy));
      }
      if (manipulationType.includes('w')) {
        const potentialW = origBlock.width - dx;
        if (potentialW >= 1.5 && origBlock.x + dx >= 0) {
          newX = origBlock.x + dx;
          newW = potentialW;
        }
      }
      if (manipulationType.includes('n')) {
        const potentialH = origBlock.height - dy;
        if (potentialH >= 1.5 && origBlock.y + dy >= 0) {
          newY = origBlock.y + dy;
          newH = potentialH;
        }
      }

      block.x = Number(newX.toFixed(2));
      block.y = Number(newY.toFixed(2));
      block.width = Number(newW.toFixed(2));
      block.height = Number(newH.toFixed(2));
    }

    // Direct DOM update for 60fps smooth manipulation
    const boxEl = annotationLayer.querySelector(`.bbox[data-id="${block.id}"]`);
    if (boxEl) {
      boxEl.style.left = `${block.x}%`;
      boxEl.style.top = `${block.y}%`;
      boxEl.style.width = `${block.width}%`;
      boxEl.style.height = `${block.height}%`;
    }

    // Update inspector coordinates live
    valX.textContent = `${block.x.toFixed(1)}%`;
    valY.textContent = `${block.y.toFixed(1)}%`;
    valW.textContent = `${block.width.toFixed(1)}%`;
    valH.textContent = `${block.height.toFixed(1)}%`;
  });

  window.addEventListener('mouseup', () => {
    if (isManipulating) {
      isManipulating = false;
      manipulationType = null;
      origBlock = null;
      manipBlockId = null;
      renderAllBlocks();
      updateInspector();
    }
  });

  // 7. Update Inspector Form
  function updateInspector() {
    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block) {
      noSelectionNotice.style.display = 'block';
      blockForm.style.display = 'none';
      return;
    }

    noSelectionNotice.style.display = 'none';
    blockForm.style.display = 'flex';

    const index = blocks.findIndex(b => b.id === selectedBlockId) + 1;
    blockIndexBadge.textContent = `Block #${index}`;

    blockTitleInput.value = block.title || '';
    blockCategorySelect.value = block.category || config.taxonomy.categories[0];
    blockEntitySelect.value = block.entityType || 'metaobject';
    blockSchemaNameInput.value = block.targetSchema || '';
    blockKeyFieldsInput.value = (block.keyFields || []).join(', ');
    blockFigmaNodeIdInput.value = block.figmaNodeMap?.nodeId || block.figmaNodeId || '';
    blockFigmaInspectNotesInput.value = block.figmaNodeMap?.inspectNotes || block.figmaInspectNotes || '';
    blockNotesInput.value = block.notes || '';

    const isOtherCategory = (block.category || '').toLowerCase().includes('other');
    if (deepSearchNotice) {
      deepSearchNotice.style.display = isOtherCategory ? 'block' : 'none';
    }
    if (isOtherCategory) {
      blockNotesInput.placeholder = "Describe visible layout, headings, prices, and button copy in detail. The AI code generator will deep-search the Figma AST using this description...";
    } else {
      blockNotesInput.placeholder = "Specify business rules, dynamic behaviors, typography, or craft hours...";
    }

    valX.textContent = `${block.x.toFixed(1)}%`;
    valY.textContent = `${block.y.toFixed(1)}%`;
    valW.textContent = `${block.width.toFixed(1)}%`;
    valH.textContent = `${block.height.toFixed(1)}%`;
  }

  // 8. Update Layers List
  function updateLayersList() {
    layersList.innerHTML = '';
    if (blocks.length === 0) {
      layersList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1rem;">No blocks created yet.</div>';
      return;
    }

    blocks.forEach((b, index) => {
      const item = document.createElement('div');
      item.className = `layer-item ${b.id === selectedBlockId ? 'active' : ''}`;
      item.innerHTML = `
        <span class="layer-title">#${index + 1} ${b.title || 'Untitled'}</span>
        <span class="layer-tag" style="color: var(--entity-${b.entityType === 'metaobject' ? 'metaobject' : b.entityType === 'product_metafield' ? 'metafield' : 'ui'})">${b.category || 'Block'}</span>
      `;
      item.addEventListener('click', () => {
        selectedBlockId = b.id;
        renderAllBlocks();
        updateInspector();
        updateLayersList();
        switchTab('tab-block');
      });
      layersList.appendChild(item);
    });
  }

  // 9. Sync Form Edits to Active Block
  function syncInspectorToBlock() {
    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block) return;

    block.title = blockTitleInput.value;
    block.category = blockCategorySelect.value;
    block.entityType = blockEntitySelect.value;
    block.targetSchema = blockSchemaNameInput.value;
    block.keyFields = blockKeyFieldsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    
    // Figma Node Map Grounding (Admin/Human-in-the-loop)
    const nodeIdVal = blockFigmaNodeIdInput.value.trim();
    const inspectNotesVal = blockFigmaInspectNotesInput.value.trim();
    if (nodeIdVal || inspectNotesVal) {
      block.figmaNodeMap = {
        nodeId: nodeIdVal,
        inspectNotes: inspectNotesVal
      };
      block.figmaNodeId = nodeIdVal;
    } else {
      delete block.figmaNodeMap;
      delete block.figmaNodeId;
    }

    block.notes = blockNotesInput.value;

    const isOtherCategory = (block.category || '').toLowerCase().includes('other');
    if (deepSearchNotice) {
      deepSearchNotice.style.display = isOtherCategory ? 'block' : 'none';
    }
    if (isOtherCategory) {
      blockNotesInput.placeholder = "Describe visible layout, headings, prices, and button copy in detail. The AI code generator will deep-search the Figma AST using this description...";
    } else {
      blockNotesInput.placeholder = "Specify business rules, dynamic behaviors, typography, or craft hours...";
    }

    renderAllBlocks();
    updateLayersList();
  }

  [blockTitleInput, blockCategorySelect, blockEntitySelect, blockSchemaNameInput, blockKeyFieldsInput, blockFigmaNodeIdInput, blockFigmaInspectNotesInput, blockNotesInput].forEach(el => {
    el.addEventListener('input', syncInspectorToBlock);
    el.addEventListener('change', syncInspectorToBlock);
  });

  pageTitleInput.addEventListener('input', () => { pageTitle = pageTitleInput.value; });
  pageOverviewInput.addEventListener('input', () => { pageOverview = pageOverviewInput.value; });

  // 10. Delete Block
  btnDeleteBlock.addEventListener('click', () => {
    if (!selectedBlockId) return;
    blocks = blocks.filter(b => b.id !== selectedBlockId);
    selectedBlockId = blocks.length > 0 ? blocks[0].id : null;
    renderAllBlocks();
    updateInspector();
    updateLayersList();
  });

  btnClearAllBlocks.addEventListener('click', () => {
    if (confirm('Clear all blocks on this mockup?')) {
      blocks = [];
      selectedBlockId = null;
      renderAllBlocks();
      updateInspector();
      updateLayersList();
    }
  });

  // 11. Generate JSON and Text Formats
  function generateJsonObject() {
    if (!currentFile) return {};
    return {
      slug: currentFile.slug,
      title: pageTitle || currentFile.slug,
      pageOverview: pageOverview || '',
      frontmatter: frontmatter || {},
      totalBlocks: blocks.length,
      updatedAt: new Date().toISOString(),
      blocks: blocks.map((b, idx) => ({
        id: b.id || `block_${idx + 1}`,
        title: b.title || `Block ${idx + 1}`,
        category: b.category || 'General Section',
        entityType: b.entityType || 'ui_component',
        targetSchema: b.targetSchema || '',
        figmaNodeMap: b.figmaNodeMap || null,
        keyFields: b.keyFields || [],
        notes: b.notes || '',
        coordinates: {
          x: Number(b.x),
          y: Number(b.y),
          width: Number(b.width),
          height: Number(b.height)
        }
      }))
    };
  }

  function generateJsonString() {
    return JSON.stringify(generateJsonObject(), null, 2);
  }

  function generateTextFileString() {
    if (!currentFile) return '';
    const dateStr = new Date().toISOString();

    let out = `---\n`;
    out += `page_slug: "${currentFile.slug}"\n`;
    out += `page_title: "${pageTitle || currentFile.slug}"\n`;
    for (const [k, v] of Object.entries(frontmatter)) {
      if (!['page_slug', 'page_title', 'total_blocks', 'annotated_at', 'generator'].includes(k)) {
        out += `${k}: "${v}"\n`;
      }
    }
    out += `total_blocks: ${blocks.length}\n`;
    out += `annotated_at: "${dateStr}"\n`;
    out += `generator: "VisualBlockAnnotator-Studio-v1.0"\n`;
    out += `---\n\n`;

    out += `# ${pageTitle || currentFile.slug}\n\n`;
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

  // Preview Format State
  let previewFormat = 'json'; // 'json' | 'txt'
  const btnFormatJson = document.getElementById('btnFormatJson');
  const btnFormatTxt = document.getElementById('btnFormatTxt');
  const btnDownloadJson = document.getElementById('btnDownloadJson');

  function updatePreviewModalContent() {
    if (previewFormat === 'json') {
      previewCode.textContent = generateJsonString();
      btnFormatJson?.classList.add('active');
      btnFormatTxt?.classList.remove('active');
    } else {
      previewCode.textContent = generateTextFileString();
      btnFormatTxt?.classList.add('active');
      btnFormatJson?.classList.remove('active');
    }
  }

  btnFormatJson?.addEventListener('click', () => {
    previewFormat = 'json';
    updatePreviewModalContent();
  });

  btnFormatTxt?.addEventListener('click', () => {
    previewFormat = 'txt';
    updatePreviewModalContent();
  });

  // 12. Save to Server Disk API
  async function saveToServer() {
    if (!currentFile) return;

    try {
      btnSaveTxt.textContent = 'Saving...';
      const payload = {
        slug: currentFile.slug,
        title: pageTitle,
        pageOverview,
        blocks,
        frontmatter
      };

      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Save request failed');
      const data = await res.json();

      showToast(`✔ Saved ${currentFile.slug}.txt (${data.blockCount} blocks)`);
      currentFile.hasAnnotation = true;

      // Update dropdown option label
      const activeOpt = imageSelect.querySelector(`option[value="${currentFile.slug}"]`);
      if (activeOpt) {
        activeOpt.textContent = `✔ ${currentFile.name} (Annotated)`;
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving file: ' + err.message);
    } finally {
      btnSaveTxt.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save .txt
      `;
    }
  }

  // 13. UI Setup & Modals
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
      });
    });
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tabId));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === tabId));
  }

  function setupEventListeners() {
    imageSelect.addEventListener('change', (e) => {
      if (e.target.value) selectFile(e.target.value);
    });

    btnRefreshFiles.addEventListener('click', loadFiles);

    // Modes
    btnDrawMode.addEventListener('click', () => {
      currentMode = 'draw';
      btnDrawMode.classList.add('active');
      btnSelectMode.classList.remove('active');
      canvasViewport.style.cursor = 'crosshair';
    });

    btnSelectMode.addEventListener('click', () => {
      currentMode = 'select';
      btnSelectMode.classList.add('active');
      btnDrawMode.classList.remove('active');
      canvasViewport.style.cursor = 'default';
    });

    // Zoom Controls
    const btnZoomReset = document.getElementById('btnZoomReset');
    const btnResetAll = document.getElementById('btnResetAll');

    btnZoomIn.addEventListener('click', () => setZoom(zoomLevel + 0.15));
    btnZoomOut.addEventListener('click', () => setZoom(zoomLevel - 0.15));
    btnZoomReset?.addEventListener('click', () => setZoom(1.0));
    btnResetAll?.addEventListener('click', () => {
      setZoom(1.0);
      canvasViewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      showToast('Reset to 100% original scale');
    });

    btnZoomFit.addEventListener('click', () => {
      fitImageToScreen();
    });

    // Visibility Filter Modes
    let visibilityMode = 'all'; // 'all' | 'selected' | 'dim'
    const btnVisAll = document.getElementById('btnVisAll');
    const btnVisSelected = document.getElementById('btnVisSelected');
    const btnVisDim = document.getElementById('btnVisDim');

    function setVisibilityMode(mode) {
      visibilityMode = mode;
      btnVisAll?.classList.toggle('active', mode === 'all');
      btnVisSelected?.classList.toggle('active', mode === 'selected');
      btnVisDim?.classList.toggle('active', mode === 'dim');

      annotationLayer.classList.remove('vis-mode-selected', 'vis-mode-dim');
      if (mode === 'selected') {
        annotationLayer.classList.add('vis-mode-selected');
        showToast('Focus Mode: Showing only selected block');
      } else if (mode === 'dim') {
        annotationLayer.classList.add('vis-mode-dim');
        showToast('Dim Mode: Highlighting selected block');
      } else {
        showToast('Showing all annotation blocks');
      }
    }

    btnVisAll?.addEventListener('click', () => setVisibilityMode('all'));
    btnVisSelected?.addEventListener('click', () => setVisibilityMode('selected'));
    btnVisDim?.addEventListener('click', () => setVisibilityMode('dim'));

    // Mouse Wheel Zoom on Canvas (Ctrl + Wheel or Wheel in Select mode)
    canvasViewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || currentMode === 'select') {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoomLevel + delta);
      }
    }, { passive: false });

    // Save
    btnSaveTxt.addEventListener('click', saveToServer);

    // Preview Modal
    btnPreviewTxt.addEventListener('click', () => {
      if (!currentFile) return;
      previewSlug.textContent = currentFile.slug;
      updatePreviewModalContent();
      previewModal.style.display = 'flex';
    });

    btnClosePreviewModal.addEventListener('click', () => { previewModal.style.display = 'none'; });
    btnCopyPreview.addEventListener('click', () => {
      navigator.clipboard.writeText(previewCode.textContent);
      showToast('Copied to clipboard!');
    });

    btnDownloadJson?.addEventListener('click', () => {
      const blob = new Blob([generateJsonString()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFile.slug}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    btnDownloadPreview.addEventListener('click', () => {
      const blob = new Blob([generateTextFileString()], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFile.slug}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });

    btnSaveFromPreview.addEventListener('click', async () => {
      await saveToServer();
      previewModal.style.display = 'none';
    });

    // Directory Settings Modal
    if (presetSelect) {
    presetSelect.addEventListener('change', async (e) => {
      const selectedPreset = e.target.value;
      try {
        const res = await fetch('/api/set-preset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preset: selectedPreset })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.taxonomy) {
            config.taxonomy = data.taxonomy;
            populateTaxonomyDropdowns();
            showNotification('Switched taxonomy preset to: ' + selectedPreset, 'success');
          }
        }
      } catch (err) {
        showNotification('Failed to switch preset: ' + err.message, 'error');
      }
    });
  }

  btnDirSettings.addEventListener('click', () => {
      inputDirPath.value = config.currentPaths?.inputDir || '';
      outputDirPath.value = config.currentPaths?.outputDir || '';
      dirModal.style.display = 'flex';
    });

    btnCloseDirModal.addEventListener('click', () => { dirModal.style.display = 'none'; });
    btnCancelDir.addEventListener('click', () => { dirModal.style.display = 'none'; });

    btnApplyDir.addEventListener('click', async () => {
      const newIn = inputDirPath.value.trim();
      const newOut = outputDirPath.value.trim();
      try {
        const res = await fetch('/api/set-directories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputDir: newIn, outputDir: newOut })
        });
        if (res.ok) {
          const data = await res.json();
          config.currentPaths = { inputDir: data.inputDir, outputDir: data.outputDir };
          dirModal.style.display = 'none';
          showToast('Updated working directories!');
          await loadFiles();
        }
      } catch (err) {
        showToast('Failed to update directories');
      }
    });
  }

  function fitImageToScreen() {
    if (!activeImage.naturalWidth || !activeImage.naturalHeight) {
      setZoom(1.0);
      return;
    }
    const vpW = canvasViewport.clientWidth - 80;
    const vpH = canvasViewport.clientHeight - 80;
    const imgW = activeImage.naturalWidth;
    const imgH = activeImage.naturalHeight;

    const scaleW = vpW / imgW;
    const scaleH = vpH / imgH;
    const fitScale = Math.min(scaleW, scaleH, 1.0);

    setZoom(fitScale);
    showToast(`Fitted to screen (${Math.round(fitScale * 100)}%)`);
  }

  function setZoom(lvl) {
    zoomLevel = Math.max(0.15, Math.min(3.0, lvl));

    // Update zoom label & reset button text
    const zoomResetEl = document.getElementById('btnZoomReset');
    if (zoomResetEl) {
      zoomResetEl.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
    }

    if (activeImage.naturalWidth && activeImage.naturalHeight) {
      const targetW = activeImage.naturalWidth * zoomLevel;
      const targetH = activeImage.naturalHeight * zoomLevel;
      canvasContainer.style.width = `${targetW}px`;
      canvasContainer.style.height = `${targetH}px`;
      canvasContainer.style.transform = 'none';
    }
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Run init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
