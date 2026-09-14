# Universal CMS & Headless Agency Workflow — AI Operating Guide

Welcome to **UniversalCMSWorkflow**. You are working in a hybrid Next.js 15, Multi-CMS architecture and visual component generation workspace.

## 1. High-Level System Architecture

This workspace connects three core pillars:
1. **Figma AST Ingestion & Code Generation**:
   - Offline dumps in `Docs/DirectDataDump/` & `Docs/figma-data/`.
   - AST node resolver & semantic search: `scripts/figma-dump.mjs` (retrieves nodes by ID, name, or natural language deep-search).
   - Asset sync & token governance: `scripts/figma-asset-sync.mjs` & `scripts/audit-tokens.mjs`.
   - Core styling rules & design tokens: `src/styles/tokens.css` and `.agents/rules/figma-to-code.md`.

2. **Visual Block Annotator Studio**:
   - Standalone zero-dependency annotation studio in `tools/visual-annotator/`.
   - Run via `npm run annotator` or `start-annotator.bat` on `http://localhost:4040`.
   - Dynamic taxonomy presets in `tools/visual-annotator/presets/`:
     - **Next.js + Tailwind**: Organism, Molecule, Atom, Modal, Dynamic Slot, Other / Custom Section (Deep-Search).
     - **Shopify**: Metaobject, Product Metafield, Curated Collection, Standard UI, Other / Custom Section (Deep-Search).
     - **Contentful**: Content Type, Scoped Field, Media Link, Reference Link, Other / Custom Section (Deep-Search).
     - **WordPress ACF Pro**: Flexible Content Layout, CPT, Repeater, Scoped Meta, Other / Custom Section (Deep-Search).
     - **Sitecore**: Rendering Component Item, Template Field, Placeholder, Content Item, Other / Custom Section (Deep-Search).
   - Slices & notes stored in: `inputs/vision/[slug].png` + `[slug].json` / `[slug].txt`.

3. **Universal Multi-CMS Content Modeling & Code Generation**:
   - Single target platform locked per client in `.workflow-state.json`.
   - Universal prop adapters in `src/adapters/index.ts`.
   - Native template generators for Shopify Liquid, WordPress PHP / OpenFields, and Headless Next.js.
   - Zero-CMS visual approval gate in `scripts/render-html-preview.mjs` (`npm run preview:html`).

---

## 2. Active Specialized Subagent Skills

When tasks require specialized workflows, consult and leverage these skills in `.agents/skills/`:

| Skill | Activation Trigger / Purpose |
| :--- | :--- |
| **`shopify-vision-architect`** | Inspects visual mockups, categorizes blocks, and writes descriptive notes for UI components and entities. |
| **`nextjs-tailwind-architect`** | Synthesizes accessible React 19 / Next.js 15 App Router components with Tailwind CSS & Radix UI from visual bounding boxes and Figma AST nodes. |
| **`shopify-liquid-architect`** | Synthesizes production-ready native Shopify Liquid sections (`.liquid`) with customizer `{% schema %}` JSON configurations and block presets. |
| **`wordpress-php-architect`** | Synthesizes production-ready WordPress classic theme templates (`.php`) with ACF Pro / OpenFields fallback and field group exports. |
| **`universal-cms-architect`** | Maps UI component props to Contentful content models, Sitecore templates, Shopify schemas, or WordPress ACF field groups. |
| **`shopify-entity-architect`** | Provisions Shopify Metaobjects and compiles GraphQL storefront queries. |

---

## 3. Category "Other" & Semantic Deep-Search Protocol

When the AI vision model or developer encounters a bespoke, non-standard, or unmapped section:

### Step 1: AI Vision Annotation
- **Select Category**: `"Other / Custom Section (Deep-Search)"` (or any `"Other"` category).
- **Describe in Detail**: In the `notes` (Requirements & Notes) field, write a comprehensive description of:
  - Component purpose (e.g. "Doctor consultation schedule breakdown card with star ratings").
  - Exact visible text strings (headlines, prices, discounts, button labels, e.g. "Book Consultation", "$150", "4.9").
  - Visual structure (number of columns, card styling, background tone, accent colors).
- **Key Fields**: Enumerate candidate fields in `keyFields` (e.g. `doctor_name, rating, fee, slots, cta_booking`).
- **Figma Node Map**: Leave `figmaNodeMap` empty/null by default unless manually pinning a specific node.

### Step 2: Code Generation Deep-Search
When the code generation agent (`nextjs-tailwind-architect`, `shopify-liquid-architect`, etc.) runs:
1. It detects `category === "Other / Custom Section (Deep-Search)"` or empty `figmaNodeMap.nodeId`.
2. It executes deep semantic search against the offline Figma AST dump:
   ```bash
   node scripts/figma-dump.mjs deep-search "<block.title> <block.notes> <block.keyFields>" --top=3
   ```
3. The AST resolver scores containers by matching query terms against layer names, text characters (`characters`), and component definitions.
4. The resolver returns:
   - Matching container node ID and name.
   - Text strings found within the node subtree.
   - Exact dimensions (width and height).
   - Extracted design tokens (dominant hex colors, font typography scales).
   - Associated media assets from `Docs/figma-data/asset-manifest.json`.
5. The code generator uses these exact tokens and AST hierarchy to generate pixel-faithful, responsive code.

---

## 4. Intelligent Figma-to-Vision Switchover Protocol (Raster / Flattened Nodes)

When Figma nodes contain flattened raster graphics or lack deep vector/text trees:

### Step 1: AST Inspection & Health Check
- Run `node scripts/figma-dump.mjs inspect-node <node_id>`.
- If the node status is `"FLATTENED_IMAGE_DETECTED"` (e.g. `RECTANGLE` with `IMAGE` fill, 0 text nodes, or 0 vector children):
  - **Do NOT crash, throw, or halt execution.**
  - Immediately trigger the **Vision Model Switchover Protocol**.

### Step 2: Vision Model Handover
1. Load companion visual screenshot from `inputs/vision/[slug].png`.
2. Inspect bounding box coordinates and field requirements in `inputs/vision/[slug].json`.
3. Extract layout geometry (columns, alignment, spacing), visible copy, typography hierarchy, and UI elements directly from the visual mockup using multi-modal AI vision.
4. Ground color and font decisions in `src/styles/tokens.css`.

---

## 5. Decoupled Modular Block Architecture & Pipeline

Rather than monolithic, hardcoded preview scripts, the pipeline uses an **AI-Native Decoupled Block Architecture**:

### 1. Two-Data Stream Synthesis
- **Data 1 (Design Tokens)**: Figma design tokens / `tokens.css` / asset manifest.
- **Data 2 (Vision Data)**: `inputs/vision/[slug].json` bounding boxes, field requirements, notes, and copy.

### 2. AI Block Classification: Shared (Reusable) vs Unique (Page-Specific)
The AI analyzes blocks across all screens and organizes them into:
- **Shared / Reusable Blocks** (`dist-client/template-parts/blocks/shared/`):
  - Components shared across multiple pages: e.g. `header-nav.php`, `announcement-bar.php`, `footer-global.php`, `product-card.php`, `instagram-gallery.php`, `newsletter-banner.php`.
- **Unique / Page-Specific Blocks** (`dist-client/template-parts/blocks/unique/`):
  - Components bespoke to specific screens: e.g. `hero-editorial.php`, `category-spotlight.php`, `pdp-buy-box.php`, `plp-filter-sidebar.php`, `checkout-flow.php`, `about-manifesto.php`, `journal-grid.php`.

### 3. Universal Dynamic Assembler (`npm run preview:html`)
- Zero hardcoded page HTML in scripts.
- The dynamic assembler (`scripts/assemble-preview.mjs`) reads `inputs/vision/*.json`, loads the required blocks dynamically, wraps them in standard layout tokens, and compiles `dist-preview/[slug].html`.
- Any new block or page added to `inputs/vision/` automatically compiles without modifying any script code.

### 4. ACF Pro / OpenFields Integration
- Companion JSON field groups are exported to `dist-client/acf-json/group_[slug].json`.
- All WordPress template parts implement `app_get_field()` and `app_get_repeater_rows()` for safe fallback across ACF Pro, Free ACF / Secure Custom Fields (SCF) / OpenFields, and native `get_post_meta()` so templates never fail even without ACF Pro active.

---

## 6. Dynamic Modular Architecture & Zero-Inline-Code Standards

When outputting target platform code (e.g. WordPress PHP, Shopify Liquid, Next.js):
1. **Zero Inline Code / Spaghetti**:
   - Separate data resolution (PHP controller block) completely from presentation markup (clean HTML).
   - Functions and theme logic must live in modular files under `dist-client/inc/` (`inc/field-helpers.php`, `inc/theme-setup.php`, `inc/template-tags.php`), never a giant monolithic `functions.php`.
   - Never embed inline `<script>` tags, inline `<style>` blocks, or deep database queries inside HTML tags.
2. **Comprehensive Commenting**:
   - Every file must feature a standard PHPDoc header documenting component purpose, vision references, and ACF schema bindings.
   - Every function and loop must have clear explanatory documentation.
3. **Multi-Tier Licensing Fallback (Zero Assumption of ACF Pro)**:
   - Code must be generic and handle environments with or without an ACF Pro license.
   - Use `app_get_repeater_rows()` for all repeaters: if ACF Pro is active, it uses `have_rows()`. If Free ACF / Secure Custom Fields (SCF) / OpenFields is active, it checks post meta and gracefully falls back to the modular visual `$default_*` array.
   - The theme must render 100% complete and visually flawless on a fresh WordPress install out-of-the-box.

