# 🔬 Block Vision Verification Pipeline
**Status**: 🟡 IN PROGRESS  
**Created**: 2026-09-14  
**Owner**: Sudipto  
**Vision Model**: Gemini (Antigravity-native — no external API key required)

---

## Problem Statement

The existing `validate-html-vision.mjs` performs a **DOM health check** (heading count, image load, button count) — not a real visual comparison. When blocks are generated from the vision JSON + Figma AST, there is currently no automated way to verify that the HTML output faithfully matches the source design region.

Telling the vision AI to "check region y:36% of the full 10,000px PNG" fails because:
1. Vision models cannot reliably isolate a percentage region on a tall full-page image
2. Full-page HTML renders vs full-page design PNGs are structurally incomparable
3. No deterministic link exists between a block HTML filename and its JSON block entry (currently fuzzy string matching in `assemble-preview.mjs` lines 67–88)

---

## Solution Architecture

### Core Principle
> **The full PNG is never modified or split permanently.** Crops are generated at runtime only, used for the vision comparison, then deleted. The only permanent additions are small `manifest.json` files (~4KB each) per page.

### The Three-Layer Model

```
LAYER 1 — PERMANENT SOURCE OF TRUTH (files unchanged)
──────────────────────────────────────────────────────
inputs/vision/[slug].png              Full design mockup (never touched)
inputs/vision/[slug].json             Block definitions + coordinates (never touched)
inputs/vision/[slug].manifest.json    ID→artifact mapping index [NEW ~4KB per page]

LAYER 2 — RUNTIME ONLY (auto-deleted after each verify run)
────────────────────────────────────────────────────────────
dist-preview/.tmp/crops/[slug]/[blockId]_design.png    Cropped design region
dist-preview/.tmp/renders/[slug]/[blockId]_render.png  Playwright HTML render

LAYER 3 — PERMANENT RESULTS
────────────────────────────
inputs/vision/[slug].manifest.json                     Status updated in-place
dist-preview/reports/[slug]-block-verification.json    Per-block AI verdict report
```

---

## New File Inventory

### Files to Create

| File | Purpose |
| :--- | :--- |
| `scripts/build-manifest.mjs` | Reads `[slug].json` → writes `[slug].manifest.json` with deterministic ID→filename mapping |
| `scripts/verify-blocks.mjs` | Runtime crop + Playwright render + Antigravity Gemini vision comparison |
| `inputs/vision/*.manifest.json` | Per-page mapping index (machine-generated, committed to git) |
| `dist-preview/.tmp/` | Temp crops + renders (gitignored, auto-deleted after run) |
| `dist-preview/reports/` | Permanent block verification reports |

### Files to Modify

| File | Change |
| :--- | :--- |
| `scripts/assemble-preview.mjs` | Replace fuzzy `getBlockMetadata()` (lines 63–103) with deterministic manifest lookup |
| `package.json` | Add `manifest:build`, `verify:blocks`, `pipeline:full` npm scripts |
| `.gitignore` | Add `dist-preview/.tmp/` |
| `AGENTS.md` | Add filename naming convention contract |
| `.agents/skills/*/SKILL.md` | Add naming convention to output rules section |

---

## `[slug].manifest.json` Schema

Location: `inputs/vision/[slug].manifest.json`

```json
{
  "slug": "Homepage",
  "version": 1,
  "sourceImage": "inputs/vision/Homepage.png",
  "sourceSpec": "inputs/vision/Homepage.json",
  "generatedAt": "2026-09-14T10:43:00.000Z",
  "blocks": {
    "block_1": {
      "title": "Header & Primary Navigation Bar",
      "category": "Header Navigation",
      "classification": "shared",
      "coordinates": { "x": 0, "y": 0, "width": 100, "height": 1.25 },
      "figmaNodeId": "27309:398",
      "artifacts": {
        "htmlBlock": "dist-preview/blocks/shared/header-nav.html",
        "phpTemplate": "dist-client/template-parts/blocks/shared/header-nav.php",
        "acfJson": "dist-client/acf-json/group_header_nav.json"
      },
      "status": {
        "htmlGenerated": false,
        "phpGenerated": false,
        "acfGenerated": false,
        "visualVerified": false,
        "verificationScore": null,
        "verificationVerdict": null,
        "lastUpdated": null
      }
    }
  }
}
```

---

## Filename Naming Convention Contract

**CRITICAL — ALL AI architect skills and human contributors must follow this.**

The `targetSchema` field in each block's JSON entry **deterministically drives** the output filename for HTML, PHP, and ACF JSON artifacts:

| `targetSchema` in JSON | Canonical basename |
| :--- | :--- |
| `global_header_options` | `header-nav` |
| `layout_hero_editorial` | `hero-editorial` |
| `layout_product_query_grid` | `product-query-grid` |
| `layout_category_tiles` | `category-tiles` |
| `layout_split_narrative` | `split-narrative` |
| `layout_dual_promo_banners` | `dual-promo-banners` |
| `layout_full_image_overlay` | `full-image-overlay` |
| `layout_testimonials_repeater` | `testimonials` |
| `layout_instagram_feed` | `instagram-feed` |
| `layout_newsletter_capture` | `newsletter-capture` |
| `layout_journal_articles_grid` | `journal-articles` |
| `global_footer_options` | `footer-global` |

**Derivation rule** (encoded in `build-manifest.mjs`):
1. Strip prefix: `layout_` or `global_`
2. Replace `_` with `-`
3. Strip trailing noise suffixes: `_grid`, `_feed`, `_options`, `_repeater`
4. Result = canonical basename → used as `[basename].html`, `[basename].php`, `group_[basename].json`

---

## Script Specifications

### `scripts/build-manifest.mjs`

**Runs once after each vision JSON is finalized.**

```bash
node scripts/build-manifest.mjs --slug=Homepage
node scripts/build-manifest.mjs --all      # all .json files in inputs/vision/
```

**Logic**:
1. Read `inputs/vision/[slug].json`
2. For each block entry: derive canonical basename from `targetSchema` using naming rule above
3. Detect `shared` vs `unique` classification:
   - Load all other page JSON files
   - If block `category` appears in ≥ 2 pages → `"shared"`, else → `"unique"`
4. Populate `artifacts` paths using canonical basename
5. Write `inputs/vision/[slug].manifest.json`
6. Console report: total blocks, shared count, unique count

---

### `scripts/verify-blocks.mjs`

**Per-block runtime vision verification using Antigravity's native Gemini.**

```bash
node scripts/verify-blocks.mjs --slug=Homepage
node scripts/verify-blocks.mjs --slug=Homepage --block=block_2
node scripts/verify-blocks.mjs --all
```

#### Execution Flow Per Block

**Step A — Read Manifest**  
Load `inputs/vision/[slug].manifest.json` → get coordinates, htmlBlock path, title, keyFields, expected copy from source JSON.

**Step B — Crop Design Region (Runtime, Temporary)**  
```
Source:     inputs/vision/[slug].png
Coords:     { x: 0%, y: 1.25%, width: 100%, height: 11.2% }
Pixel calc: left   = Math.round(x/100 * imageWidth)
            top    = Math.round(y/100 * imageHeight)
            width  = Math.round(width/100 * imageWidth)
            height = Math.round(height/100 * imageHeight)
Output:     dist-preview/.tmp/crops/[slug]/[blockId]_design.png   ← TEMP
Library:    pngjs (already in devDependencies — zero new deps)
```

**Step C — Render HTML Block (Runtime, Temporary)**  
```
Input:      dist-preview/blocks/[unique|shared]/[basename].html
Playwright: opens block file, viewport 1440px, fullPage:false screenshot
Output:     dist-preview/.tmp/renders/[slug]/[blockId]_render.png  ← TEMP
```

**Step D — Vision Comparison via Antigravity Gemini**  
The script writes a structured comparison job to:
```
dist-preview/.tmp/verify-queue/[slug]-[blockId].json
```

This file contains both image paths, expected copy, key fields, and the exact prompt. The Antigravity agent reads this queue file, loads both images natively using `view_file`, performs the Gemini vision comparison, and writes the result JSON.

**Step E — Write Results**  
```
Update: manifest.blocks[blockId].status.visualVerified / verificationScore / verificationVerdict
Write:  dist-preview/reports/[slug]-block-verification.json  (consolidated)
```

**Step F — Cleanup**  
```
Delete: dist-preview/.tmp/  entirely
```

---

## Vision AI Prompt Template

```
You are a UI quality reviewer comparing a design mockup against an HTML implementation.

IMAGE 1 (Design Reference): [blockId]_design.png
  → Cropped region from the original Figma design mockup for block: "[title]"

IMAGE 2 (HTML Render): [blockId]_render.png
  → Browser screenshot of the implemented HTML block at 1440px viewport.

EXPECTED CONTENT:
  Copy to verify: [list of exact text strings from block notes in JSON]
  Key UI fields:  [keyFields from JSON]

EVALUATE across 5 dimensions:
1. Layout structure (columns, alignment, spacing, proportions)
2. Typography hierarchy (heading size, weight, scale)
3. Copy accuracy (exact text strings present and correct)
4. Color palette match (backgrounds, text, accents)
5. UI element completeness (CTAs, badges, images, icons present)

Return JSON only:
{
  "blockId": "[blockId]",
  "matchScore": 0-100,
  "layoutMatch": "exact|close|off",
  "copyAccurate": true|false,
  "colorMatch": true|false,
  "missingElements": [],
  "issues": [
    { "type": "layout|copy|color|missing", "description": "...", "suggestion": "..." }
  ],
  "verdict": "PASS|WARN|FAIL"
}
```

**Verdict thresholds**: PASS ≥ 85 · WARN 70–84 · FAIL < 70

---

## Updated `assemble-preview.mjs` — `getBlockMetadata()` Replacement

**Current** (lines 63–103): Fuzzy string matching — `schema.includes(baseName)`, hardcoded special cases for `"oceanic"`, `"testimonials"`, etc.

**Replacement**:
```js
function getBlockMetadata(blockFileName, pageSlug) {
  const manifestPath = path.join(visionDir, `${pageSlug}.manifest.json`);

  // If manifest not yet built, fall through to legacy fuzzy method
  if (!fs.existsSync(manifestPath)) return getLegacyBlockMetadata(blockFileName, pageSlug);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const baseName = blockFileName.replace(/\.(php|html)$/, '');

  // Deterministic lookup: find block whose any artifact path uses this basename
  const entry = Object.entries(manifest.blocks).find(([, block]) =>
    Object.values(block.artifacts).some(p =>
      p && path.basename(p, path.extname(p)) === baseName
    )
  );

  if (!entry) return getLegacyBlockMetadata(blockFileName, pageSlug);

  const [blockId, block] = entry;
  return {
    blockId,
    componentName:  block.title,
    filePath:       block.artifacts.htmlBlock || block.artifacts.phpTemplate,
    referenceImage: manifest.sourceImage,     // FULL PNG — never cropped
    coords: `x:${block.coordinates.x}%, y:${block.coordinates.y}%, w:${block.coordinates.width}%, h:${block.coordinates.height}%`,
    figmaNode:      block.figmaNodeId || 'N/A',
    classification: block.classification,
    notes:          '',   // sourced from spec JSON when needed
    keyFields:      ''    // sourced from spec JSON when needed
  };
}
```

The original fuzzy logic is renamed `getLegacyBlockMetadata()` and kept as fallback.

---

## `.gitignore` Additions

```gitignore
# Block verification temp files — auto-deleted, this is a safety net
dist-preview/.tmp/
```

---

## New `package.json` Scripts

```json
"manifest:build":      "node scripts/build-manifest.mjs",
"manifest:build:all":  "node scripts/build-manifest.mjs --all",
"verify:blocks":       "node scripts/verify-blocks.mjs",
"verify:blocks:all":   "node scripts/verify-blocks.mjs --all",
"pipeline:full":       "npm run manifest:build:all && npm run preview:html && npm run verify:blocks:all && npm run lint:tokens"
```

---

## Progress Tracker

| # | Task | Status | Notes |
| :- | :--- | :--- | :--- |
| 1 | Plan documented | ✅ DONE | This file |
| 2 | `scripts/build-manifest.mjs` — Create | ⬜ TODO | |
| 3 | `scripts/verify-blocks.mjs` — Create | ⬜ TODO | Uses Antigravity Gemini natively |
| 4 | `scripts/assemble-preview.mjs` — Modify `getBlockMetadata()` | ⬜ TODO | Keep legacy as fallback |
| 5 | `package.json` — Add 5 new scripts | ⬜ TODO | |
| 6 | `.gitignore` — Add `dist-preview/.tmp/` | ⬜ TODO | |
| 7 | Generate `Homepage.manifest.json` | ⬜ TODO | Run `manifest:build --slug=Homepage` |
| 8 | Generate all page manifests | ⬜ TODO | Run `manifest:build:all` |
| 9 | Run `verify:blocks` on Homepage | ⬜ TODO | First full pipeline test |
| 10 | Run `verify:blocks:all` | ⬜ TODO | All 8 annotated pages |
| 11 | Update `AGENTS.md` naming convention contract | ⬜ TODO | |
| 12 | Update architect `SKILL.md` files (naming convention) | ⬜ TODO | All 6 skills |

---

## Related Documents

- [`HISTORICAL_DECISIONS_AND_CONCLUSIONS.md`](./HISTORICAL_DECISIONS_AND_CONCLUSIONS.md)
- [`annotation-driven-workflow-spec.md`](./annotation-driven-workflow-spec.md)
- [`FUTURE_IMPROVEMENTS_ROADMAP.md`](./FUTURE_IMPROVEMENTS_ROADMAP.md)
- [`figma-annotation-guidelines.md`](./figma-annotation-guidelines.md)
