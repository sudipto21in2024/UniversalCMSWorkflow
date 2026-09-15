/**
 * scripts/build-manifest.mjs
 *
 * Block Manifest Builder
 * ──────────────────────
 * Reads inputs/vision/[slug].json and writes inputs/vision/[slug].manifest.json
 * with a deterministic ID→artifact mapping for every block.
 *
 * This replaces the fuzzy string-matching in assemble-preview.mjs with a
 * clean, authoritative index. The manifest is the single source of truth
 * for tracing any block_id back to its design coordinates, generated HTML,
 * PHP template, and ACF JSON.
 *
 * Usage:
 *   node scripts/build-manifest.mjs --slug=Homepage
 *   node scripts/build-manifest.mjs --all
 *
 * Part of: Block Vision Verification Pipeline
 * See: Docs/BLOCK_VISION_VERIFICATION_PLAN.md
 */

import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const visionDir = path.join(rootDir, "inputs", "vision");

// ─── Naming Convention ────────────────────────────────────────────────────────
// targetSchema → canonical basename
// Rule: strip layout_/global_ prefix, replace _ with -, strip trailing noise.
// This must match what architect skills use when naming their output files.

const TRAILING_NOISE = ["_grid", "_feed", "_options", "_repeater", "_table", "_form", "_shelf"];

const EXPLICIT_OVERRIDES = {
  // Global Shared Options / Blocks
  global_header_options: "header-nav",
  global_footer_options: "footer-global",
  layout_instagram_feed: "instagram-gallery",
  layout_newsletter_capture: "newsletter-banner",
  announcement_bar: "announcement-bar",
  global_announcement_bar: "announcement-bar",

  // Homepage Blocks
  layout_hero_editorial: "hero-editorial",
  layout_product_query_grid: "best-sellers-shelf",
  layout_category_tiles: "category-spotlight",
  layout_featured_products: "featured-products-shelf",
  layout_split_narrative: "sheet-mask-feature",
  layout_journal_articles_grid: "journal-teaser",
  layout_dual_promo_banners: "dual-promo-cards",
  layout_full_image_overlay: "oceanic-banner",
  layout_testimonials_repeater: "testimonials-slider",

  // PDP Blocks
  single_product_buy_box: "pdp-buy-box",
  layout_split_ritual: "daily-ritual-split",
  layout_ingredients_repeater: "active-ingredients-cards",
  layout_product_cross_sell: "cross-sell-shelf",
  layout_product_specs: "pdp-accordion-specs",

  // PLP Blocks
  plp_archive_header: "plp-faceted-catalog",
  plp_filter_sidebar: "plp-filter-sidebar",
  plp_product_query_loop: "plp-product-grid",

  // About Us
  about_hero_narrative: "about-manifesto",
  about_values_grid: "split-narrative",
  about_founder_split: "split-narrative",

  // Journal & Article
  journal_header_tabs: "journal-grid",
  journal_featured_hero: "journal-grid",
  journal_posts_grid: "journal-grid",
  single_article_header: "article-prose",
  single_article_body: "article-prose",
  article_product_callout: "cross-sell-shelf",
  related_articles_query: "journal-grid",

  // Cart & Checkout
  cart_free_shipping_bar: "cart-table",
  cart_line_items: "cart-table",
  cart_checkout_summary: "cart-table",
  checkout_express_pay: "checkout-flow",
  checkout_form_fields: "checkout-flow",
  checkout_sidebar_summary: "checkout-flow",
};

function deriveBasename(targetSchema) {
  if (!targetSchema) return null;

  // Check explicit override map first
  if (EXPLICIT_OVERRIDES[targetSchema]) return EXPLICIT_OVERRIDES[targetSchema];

  let name = targetSchema.toLowerCase();

  // Strip known prefixes
  name = name.replace(/^(layout_|global_)/, "");

  // Strip trailing noise suffixes
  for (const noise of TRAILING_NOISE) {
    if (name.endsWith(noise)) {
      name = name.slice(0, -noise.length);
      break;
    }
  }

  // Replace underscores with hyphens
  name = name.replace(/_/g, "-");

  // Remove trailing hyphens
  name = name.replace(/-+$/, "");

  return name || null;
}

// ─── Shared/Unique Classification ─────────────────────────────────────────────
// Known shared blocks across multi-page themes
const KNOWN_SHARED_BASENAMES = new Set([
  "header-nav",
  "footer-global",
  "announcement-bar",
  "newsletter-banner",
  "instagram-gallery",
  "product-card",
]);

function classifyBlock(basename, allSlugs) {
  if (!basename) return "unique";

  // 1. Check known canonical shared components
  if (KNOWN_SHARED_BASENAMES.has(basename)) {
    return "shared";
  }

  // 2. Check if file already exists in dist-preview or dist-client shared vs unique
  const sharedHtml = path.join(rootDir, "dist-preview", "blocks", "shared", `${basename}.html`);
  const sharedPhp = path.join(rootDir, "dist-client", "template-parts", "blocks", "shared", `${basename}.php`);
  if (fs.existsSync(sharedHtml) || fs.existsSync(sharedPhp)) {
    return "shared";
  }

  const uniqueHtml = path.join(rootDir, "dist-preview", "blocks", "unique", `${basename}.html`);
  const uniquePhp = path.join(rootDir, "dist-client", "template-parts", "blocks", "unique", `${basename}.php`);
  if (fs.existsSync(uniqueHtml) || fs.existsSync(uniquePhp)) {
    return "unique";
  }

  // 3. Fallback: check if referenced in multiple page JSON specs
  let count = 0;
  for (const s of allSlugs) {
    const jsonPath = path.join(visionDir, `${s}.json`);
    if (!fs.existsSync(jsonPath)) continue;
    try {
      const spec = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      for (const b of spec.blocks || []) {
        if (deriveBasename(b.targetSchema) === basename) {
          count++;
          break;
        }
      }
    } catch {}
  }

  return count >= 2 ? "shared" : "unique";
}

// ─── Resolve ACF JSON file path ───────────────────────────────────────────────
function resolveAcfJsonPath(basename) {
  const directName = `dist-client/acf-json/group_${basename.replace(/-/g, "_")}.json`;
  if (fs.existsSync(path.join(rootDir, directName))) return directName;

  const overrides = {
    "header-nav": "dist-client/acf-json/group_global_options.json",
    "footer-global": "dist-client/acf-json/group_global_options.json",
    "active-ingredients-cards": "dist-client/acf-json/group_active_ingredients.json",
    "category-spotlight": "dist-client/acf-json/group_category_spotlight.json",
    "daily-ritual-split": "dist-client/acf-json/group_daily_ritual.json",
    "dual-promo-cards": "dist-client/acf-json/group_dual_promo.json",
    "hero-editorial": "dist-client/acf-json/group_hero_editorial.json",
    "instagram-gallery": "dist-client/acf-json/group_instagram_gallery.json",
    "newsletter-banner": "dist-client/acf-json/group_newsletter.json",
    "oceanic-banner": "dist-client/acf-json/group_oceanic_banner.json",
    "pdp-accordion-specs": "dist-client/acf-json/group_pdp_accordions.json",
    "pdp-buy-box": "dist-client/acf-json/group_pdp_buy_box.json",
    "plp-faceted-catalog": "dist-client/acf-json/group_plp_filters.json",
    "plp-filter-sidebar": "dist-client/acf-json/group_plp_filters.json",
    "testimonials-slider": "dist-client/acf-json/group_testimonials.json",
    "about-manifesto": "dist-client/acf-json/group_about_manifesto.json",
  };

  if (overrides[basename] && fs.existsSync(path.join(rootDir, overrides[basename]))) {
    return overrides[basename];
  }
  return directName;
}

// ─── Artifact Path Builder ─────────────────────────────────────────────────────
function buildArtifacts(basename, classification, targetPlatform) {
  const dir = classification === "shared" ? "shared" : "unique";

  const artifacts = {
    htmlBlock: `dist-preview/blocks/${dir}/${basename}.html`,
    phpTemplate: null,
    liquidSection: null,
    acfJson: null,
  };

  // Determine target platform from workflow-state.json
  if (targetPlatform === "wordpress-php") {
    artifacts.phpTemplate = `dist-client/template-parts/blocks/${dir}/${basename}.php`;
    artifacts.acfJson = resolveAcfJsonPath(basename);
  } else if (targetPlatform === "shopify-liquid") {
    artifacts.liquidSection = `dist-client/sections/${basename}.liquid`;
  } else if (targetPlatform === "nextjs-standalone" || targetPlatform === "shopify-headless") {
    artifacts.tsxComponent = `src/components/modules/${toPascalCase(basename)}.tsx`;
  }

  return artifacts;
}

function toPascalCase(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

// ─── Status Check: Detect Already-Generated Artifacts ─────────────────────────
function buildStatus(artifacts) {
  const status = {
    htmlGenerated: false,
    phpGenerated: false,
    acfGenerated: false,
    visualVerified: false,
    verificationScore: null,
    verificationVerdict: null,
    lastUpdated: null,
  };

  if (artifacts.htmlBlock && fs.existsSync(path.join(rootDir, artifacts.htmlBlock))) {
    status.htmlGenerated = true;
  }
  if (artifacts.phpTemplate && fs.existsSync(path.join(rootDir, artifacts.phpTemplate))) {
    status.phpGenerated = true;
  }
  if (artifacts.acfJson && fs.existsSync(path.join(rootDir, artifacts.acfJson))) {
    status.acfGenerated = true;
  }
  if (status.htmlGenerated || status.phpGenerated) {
    status.lastUpdated = new Date().toISOString();
  }

  return status;
}

// ─── Preserve Existing Verification Status ─────────────────────────────────────
// If manifest already exists, carry over visualVerified / score / verdict
function mergeExistingStatus(blockId, existingManifest, newStatus) {
  if (!existingManifest || !existingManifest.blocks || !existingManifest.blocks[blockId]) {
    return newStatus;
  }
  const prev = existingManifest.blocks[blockId].status || {};
  return {
    ...newStatus,
    visualVerified: prev.visualVerified ?? newStatus.visualVerified,
    verificationScore: prev.verificationScore ?? newStatus.verificationScore,
    verificationVerdict: prev.verificationVerdict ?? newStatus.verificationVerdict,
  };
}

// ─── Core: Build Manifest for One Slug ────────────────────────────────────────
function buildManifest(slug, allSlugs, targetPlatform) {
  const jsonPath = path.join(visionDir, `${slug}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.error(`  ✗ No vision JSON found for slug: ${slug}`);
    return false;
  }

  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch (e) {
    console.error(`  ✗ Failed to parse ${jsonPath}: ${e.message}`);
    return false;
  }

  // Load existing manifest to preserve verification status
  const manifestPath = path.join(visionDir, `${slug}.manifest.json`);
  let existingManifest = null;
  if (fs.existsSync(manifestPath)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {}
  }

  const blocks = {};
  let sharedCount = 0;
  let uniqueCount = 0;
  let unmappedCount = 0;

  for (const block of spec.blocks || []) {
    const { id: blockId, title, category, targetSchema, figmaNodeMap, coordinates, keyFields, notes } = block;

    const basename = deriveBasename(targetSchema);

    if (!basename) {
      console.warn(`  ⚠ Could not derive basename for block "${blockId}" (targetSchema: "${targetSchema}")`);
      unmappedCount++;
    }

    // Classify shared vs unique
    const classification = classifyBlock(basename, allSlugs);
    if (classification === "shared") sharedCount++;
    else uniqueCount++;

    const artifacts = basename ? buildArtifacts(basename, classification, targetPlatform) : {
      htmlBlock: null, phpTemplate: null, liquidSection: null, acfJson: null,
    };

    const rawStatus = buildStatus(artifacts);
    const status = mergeExistingStatus(blockId, existingManifest, rawStatus);

    blocks[blockId] = {
      title: title || blockId,
      category: category || "Uncategorized",
      classification,
      targetSchema: targetSchema || null,
      canonicalBasename: basename || null,
      coordinates: coordinates || { x: 0, y: 0, width: 100, height: 5 },
      figmaNodeId: figmaNodeMap?.nodeId || null,
      figmaNodeName: figmaNodeMap?.nodeName || null,
      keyFields: keyFields || [],
      notes: notes || "",
      artifacts,
      status,
    };
  }

  const manifest = {
    slug,
    version: 2,
    sourceImage: `inputs/vision/${slug}.png`,
    sourceSpec: `inputs/vision/${slug}.json`,
    targetPlatform,
    generatedAt: new Date().toISOString(),
    summary: {
      totalBlocks: Object.keys(blocks).length,
      sharedBlocks: sharedCount,
      uniqueBlocks: uniqueCount,
      unmappedBlocks: unmappedCount,
    },
    blocks,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(
    `  ✓ ${slug}.manifest.json → ` +
    `${manifest.summary.totalBlocks} blocks ` +
    `(${sharedCount} shared, ${uniqueCount} unique` +
    (unmappedCount > 0 ? `, ⚠ ${unmappedCount} unmapped` : "") +
    `)`
  );
  return true;
}

// ─── Load Target Platform from Workflow State ──────────────────────────────────
function getTargetPlatform() {
  const statePath = path.join(rootDir, ".workflow-state.json");
  if (!fs.existsSync(statePath)) return "wordpress-php";
  try {
    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    return state.client?.targetPlatform || "wordpress-php";
  } catch {
    return "wordpress-php";
  }
}

// ─── Discover All Slugs ────────────────────────────────────────────────────────
function discoverSlugs() {
  if (!fs.existsSync(visionDir)) return [];
  return fs
    .readdirSync(visionDir)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".manifest.json"))
    .map((f) => f.replace(/\.json$/, ""))
    .filter((slug) => slug !== "README");
}

// ─── CLI Entry Point ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const slugArg = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const doAll = args.includes("--all");

const targetPlatform = getTargetPlatform();
const allSlugs = discoverSlugs();

if (allSlugs.length === 0) {
  console.error("✗ No vision JSON files found in inputs/vision/");
  process.exit(1);
}

console.log("\n╔═══════════════════════════════════════════════╗");
console.log("║         Block Manifest Builder v2.0          ║");
console.log("╚═══════════════════════════════════════════════╝\n");
console.log(`  Target Platform : ${targetPlatform}`);
console.log(`  Vision Dir      : ${path.relative(rootDir, visionDir)}`);
console.log(`  Discovered      : ${allSlugs.length} page(s)\n`);

let success = 0;
let failed = 0;

if (doAll) {
  console.log("  Building manifests for all pages:\n");
  for (const slug of allSlugs) {
    const ok = buildManifest(slug, allSlugs, targetPlatform);
    if (ok) success++;
    else failed++;
  }
} else if (slugArg) {
  const ok = buildManifest(slugArg, allSlugs, targetPlatform);
  if (ok) success++;
  else failed++;
} else {
  console.error("  Usage: node scripts/build-manifest.mjs --slug=Homepage");
  console.error("         node scripts/build-manifest.mjs --all");
  process.exit(1);
}

console.log(`\n  ─────────────────────────────────────────────`);
console.log(`  ✅ ${success} manifest(s) built successfully`);
if (failed > 0) console.log(`  ❌ ${failed} manifest(s) failed`);
console.log(`\n  Next: npm run verify:blocks -- --slug=<slug>\n`);
