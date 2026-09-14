#!/usr/bin/env node

/**
 * Maison Aura — Automated Shopify Provisioning & Seeding CLI
 *
 * Capabilities:
 * 1. Checks & validates Shopify Admin API connection.
 * 2. Auto-creates Metaobject Definitions (`hero_editorial`, `craft_story`, `artisan_profile`).
 * 3. Auto-creates Product Metafield Definitions (`custom.radar_coordinates`).
 * 4. Seeds Collections, Haute Couture Products, Variants, Hotspot Metafields, and Metaobjects.
 *
 * Usage:
 *   node scripts/shopify-provision.mjs
 *   node scripts/shopify-provision.mjs --with-definitions
 */

import fs from 'node:fs';
import path from 'node:path';

// Load .env or .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/(^["']|["']$)/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || '2025-01';
const WITH_DEFINITIONS = process.argv.includes('--with-definitions') || process.argv.includes('-d');
const blueprintIdx = process.argv.indexOf('--blueprint');
const BLUEPRINT_PATH = blueprintIdx !== -1 && process.argv[blueprintIdx + 1] ? process.argv[blueprintIdx + 1] : null;

console.log('\n======================================================');
console.log('   MAISON AURA — SHOPIFY AUTOMATED PROVISIONING CLI   ');
console.log('======================================================\n');

if (!DOMAIN || !ADMIN_TOKEN) {
  console.error('\x1b[31m[Error] Missing Shopify credentials!\x1b[0m');
  console.error('Please configure your credentials in \x1b[33m.env.local\x1b[0m:\n');
  console.error('  SHOPIFY_STORE_DOMAIN=your-store.myshopify.com');
  console.error('  SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxx');
  console.error('  SHOPIFY_ADMIN_API_VERSION=2025-01\n');
  console.error('Tip: To create an Admin Access Token:');
  console.error('Shopify Admin -> Settings -> Apps and sales channels -> Develop apps -> Create app.');
  console.error('Grant scopes: write_products, read_products, write_content, read_content, write_metaobjects, read_metaobjects.\n');
  process.exit(1);
}

const ENDPOINT = `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

async function shopifyAdminFetch(query, variables = {}) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

// -------------------------------------------------------------
// 1. Metaobject and Metafield Definitions
// -------------------------------------------------------------

async function provisionDefinitions() {
  console.log('\x1b[36m[Step 1/4] Provisioning Metaobject & Metafield Definitions...\x1b[0m');

  // 1.1 Hero Editorial Metaobject Definition
  try {
    const heroRes = await shopifyAdminFetch(`
      mutation CreateHeroDefinition {
        metaobjectDefinitionCreate(definition: {
          name: "Hero Editorial"
          type: "hero_editorial"
          access: { storefront: PUBLIC_READ }
          fieldDefinitions: [
            { name: "Eyebrow", key: "eyebrow", type: "single_line_text_field" },
            { name: "Headline", key: "headline", type: "single_line_text_field" },
            { name: "Subheadline", key: "subheadline", type: "multi_line_text_field" },
            { name: "Primary CTA Label", key: "primary_cta_label", type: "single_line_text_field" },
            { name: "Primary CTA URL", key: "primary_cta_url", type: "single_line_text_field" },
            { name: "Secondary CTA Label", key: "secondary_cta_label", type: "single_line_text_field" },
            { name: "Secondary CTA URL", key: "secondary_cta_url", type: "single_line_text_field" },
            { name: "Media Banner URL", key: "media_banner", type: "single_line_text_field" }
          ]
        }) {
          metaobjectDefinition { id type }
          userErrors { field message }
        }
      }
    `);
    if (heroRes?.metaobjectDefinitionCreate?.userErrors?.length) {
      console.log(`  ℹ hero_editorial definition: ${heroRes.metaobjectDefinitionCreate.userErrors[0].message}`);
    } else {
      console.log('  \x1b[32m✔\x1b[0m Created Metaobject Definition: hero_editorial');
    }
  } catch (err) {
    console.warn('  ℹ hero_editorial definition note:', err.message);
  }

  // 1.2 Craft Story Metaobject Definition
  try {
    const craftRes = await shopifyAdminFetch(`
      mutation CreateCraftStoryDefinition {
        metaobjectDefinitionCreate(definition: {
          name: "Craft Story"
          type: "craft_story"
          access: { storefront: PUBLIC_READ }
          fieldDefinitions: [
            { name: "Eyebrow", key: "eyebrow", type: "single_line_text_field" },
            { name: "Headline", key: "headline", type: "single_line_text_field" },
            { name: "Story Narrative", key: "story_narrative", type: "multi_line_text_field" },
            { name: "Quote", key: "quote", type: "single_line_text_field" },
            { name: "Quote Author", key: "quote_author", type: "single_line_text_field" },
            { name: "Savoir Faire Hours", key: "savoir_faire_hours", type: "number_integer" },
            { name: "Stitch Count", key: "stitch_count", type: "number_integer" },
            { name: "Media Asset URL", key: "media_asset", type: "single_line_text_field" }
          ]
        }) {
          metaobjectDefinition { id type }
          userErrors { field message }
        }
      }
    `);
    if (craftRes?.metaobjectDefinitionCreate?.userErrors?.length) {
      console.log(`  ℹ craft_story definition: ${craftRes.metaobjectDefinitionCreate.userErrors[0].message}`);
    } else {
      console.log('  \x1b[32m✔\x1b[0m Created Metaobject Definition: craft_story');
    }
  } catch (err) {
    console.warn('  ℹ craft_story definition note:', err.message);
  }

  // 1.3 Artisan Profile Metaobject Definition
  try {
    const artisanRes = await shopifyAdminFetch(`
      mutation CreateArtisanDefinition {
        metaobjectDefinitionCreate(definition: {
          name: "Artisan Profile"
          type: "artisan_profile"
          access: { storefront: PUBLIC_READ }
          fieldDefinitions: [
            { name: "Name", key: "name", type: "single_line_text_field" },
            { name: "Role", key: "role", type: "single_line_text_field" },
            { name: "Specialty", key: "specialty", type: "single_line_text_field" },
            { name: "Years of Craft", key: "years_of_craft", type: "number_integer" },
            { name: "Bio", key: "bio", type: "multi_line_text_field" },
            { name: "Quote", key: "quote", type: "single_line_text_field" },
            { name: "Portrait URL", key: "portrait_url", type: "single_line_text_field" }
          ]
        }) {
          metaobjectDefinition { id type }
          userErrors { field message }
        }
      }
    `);
    if (artisanRes?.metaobjectDefinitionCreate?.userErrors?.length) {
      console.log(`  ℹ artisan_profile definition: ${artisanRes.metaobjectDefinitionCreate.userErrors[0].message}`);
    } else {
      console.log('  \x1b[32m✔\x1b[0m Created Metaobject Definition: artisan_profile');
    }
  } catch (err) {
    console.warn('  ℹ artisan_profile definition note:', err.message);
  }

  // 1.4 Product Metafield Definition for radar_coordinates
  try {
    const metaRes = await shopifyAdminFetch(`
      mutation CreateRadarMetafieldDefinition {
        metafieldDefinitionCreate(definition: {
          name: "Garment Radar Coordinates"
          namespace: "custom"
          key: "radar_coordinates"
          type: "json"
          ownerType: PRODUCT
          access: { storefront: PUBLIC_READ }
        }) {
          createdDefinition { id namespace key }
          userErrors { field message }
        }
      }
    `);
    if (metaRes?.metafieldDefinitionCreate?.userErrors?.length) {
      console.log(`  ℹ custom.radar_coordinates definition: ${metaRes.metafieldDefinitionCreate.userErrors[0].message}`);
    } else {
      console.log('  \x1b[32m✔\x1b[0m Created Product Metafield Definition: custom.radar_coordinates');
    }
  } catch (err) {
    console.warn('  ℹ custom.radar_coordinates note:', err.message);
  }
}

// -------------------------------------------------------------
// 2. Seed Collections
// -------------------------------------------------------------

const SEED_COLLECTIONS = [
  {
    title: 'Automne-Hiver 2026 Haute Couture',
    handle: 'automne-hiver-2026',
    descriptionHtml: '<p>A nocturnal dialogue between architecture, gold filament broderie, and sculptured silhouettes.</p>',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Printemps-Été 2026 Haute Couture',
    handle: 'printemps-ete-2026',
    descriptionHtml: '<p>Gossamer organza, sculptural draping, and luminous alabaster tones born in the Paris atelier.</p>',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
  },
];

async function seedCollections() {
  console.log('\n\x1b[36m[Step 2/4] Seeding Collections...\x1b[0m');
  for (const col of SEED_COLLECTIONS) {
    try {
      const res = await shopifyAdminFetch(`
        mutation CreateCollection($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection { id handle title }
            userErrors { field message }
          }
        }
      `, {
        input: {
          title: col.title,
          handle: col.handle,
          descriptionHtml: col.descriptionHtml,
          image: { src: col.image, altText: col.title },
        },
      });

      if (res?.collectionCreate?.userErrors?.length) {
        console.log(`  ℹ Collection '${col.handle}': ${res.collectionCreate.userErrors[0].message}`);
      } else {
        console.log(`  \x1b[32m✔\x1b[0m Seeded Collection: ${col.title}`);
      }
    } catch (err) {
      console.warn(`  ⚠ Failed to seed collection '${col.handle}':`, err.message);
    }
  }
}

// -------------------------------------------------------------
// 3. Seed Haute Couture Products & Radar Metafields
// -------------------------------------------------------------

const SEED_PRODUCTS = [
  {
    handle: 'look-01-nocturne-column-gown',
    title: "Look 01 — L'Ombre Nocturne Column Gown",
    descriptionHtml: '<p>Sculptural column gown tailored from Lyon silk faille and embroidered with 18-karat gold dipped filaments. Features an internal corset structure hand-boned in our Paris atelier.</p>',
    productType: 'Haute Couture',
    vendor: 'Maison Aura',
    price: '18500.00',
    variants: [
      { title: 'FR 36 / Made to Measure', price: '18500.00' },
      { title: 'FR 38 / Made to Measure', price: '18500.00' },
      { title: 'FR 40 / Made to Measure', price: '18500.00' },
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', altText: "L'Ombre Nocturne Column Gown runway shot" },
      { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', altText: 'Gold filament detail macro' },
    ],
    radarCoordinates: {
      silhouette: 'Architectural Column',
      fabric_origin: 'Lyon Silk Faille & Hand-Spun Gold Filament',
      savoir_faire_hours: 320,
      stitch_count: 54000,
      artisans_involved: ['Hélène de Saint-Germain (Première d’Atelier)', 'Maison Lesage (Gold Broderie)'],
      hotspots: [
        {
          id: 'corset',
          label: 'Internal Silk Faille Corset',
          description: 'Sculpted bone armature lined in mulberry silk, calibrated precisely to anatomical millimeter contours.',
          x: 49.0,
          y: 33.5,
        },
        {
          id: 'gold_embroidery',
          label: '18k Gold Filament Broderie',
          description: '54,000 microscopic stitches of spun metallic filament capturing light dynamically as the wearer moves.',
          x: 64.2,
          y: 54.0,
        },
        {
          id: 'hem_architecture',
          label: 'Micro-Weighted Architectural Hem',
          description: 'Hidden lead bead tape engineered into the horsehair lining ensures perfect perpendicular drape.',
          x: 38.5,
          y: 89.2,
        },
      ],
    },
  },
  {
    handle: 'look-02-aurelia-feather-cape',
    title: 'Look 02 — Aurélia Draped Ostrich Capelet',
    descriptionHtml: '<p>Gossamer silk chiffon capelet embroidered with hand-trimmed plumes in midnight gradient hues, fastened with a cast bronze cabochon clasp.</p>',
    productType: 'Haute Couture',
    vendor: 'Maison Aura',
    price: '14200.00',
    variants: [
      { title: 'One Size / Bespoke Fitting', price: '14200.00' },
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85', altText: 'Aurélia Capelet runway visual' },
    ],
    radarCoordinates: {
      silhouette: 'Flou Draping',
      fabric_origin: 'Como Silk Chiffon & Ethically Sourced Plumes',
      savoir_faire_hours: 240,
      stitch_count: 22000,
      artisans_involved: ['Atelier Lemarié (Plumassier)', 'Marc Dufour (Maître Tailleur)'],
      hotspots: [
        {
          id: 'collar_clasp',
          label: 'Cast Bronze Sculptural Clasp',
          description: 'Hand-chiseled lost-wax bronze clasp inlaid with raw obsidian gemstone.',
          x: 50.0,
          y: 26.0,
        },
        {
          id: 'feather_gradient',
          label: 'Plumassier Ombré Shading',
          description: 'Over 1,200 individual plumes hand-dyed in seven progressive bath gradients.',
          x: 35.0,
          y: 52.0,
        },
      ],
    },
  },
  {
    handle: 'look-03-palais-jacquard-tailleur',
    title: 'Look 03 — Palais Double-Breasted Tailleur',
    descriptionHtml: '<p>Impeccably tailored smoking jacket with architectural pagoda shoulders in custom-woven midnight damask, paired with cigarette trousers.</p>',
    productType: 'Haute Couture',
    vendor: 'Maison Aura',
    price: '12800.00',
    variants: [
      { title: 'FR 36 / Tailored Bespoke', price: '12800.00' },
      { title: 'FR 38 / Tailored Bespoke', price: '12800.00' },
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85', altText: 'Palais Tailleur look' },
    ],
    radarCoordinates: {
      silhouette: 'Structured Tailoring',
      fabric_origin: 'Venetian Silk Damask & British Wool Canvas',
      savoir_faire_hours: 195,
      stitch_count: 18500,
      artisans_involved: ['Marc Dufour (Maître Tailleur)'],
      hotspots: [
        {
          id: 'pagoda_shoulder',
          label: 'Pagoda Shoulder Construction',
          description: 'Multi-ply horsehair canvas pad sculpted to produce an aggressive concave architectural lift.',
          x: 28.0,
          y: 28.5,
        },
        {
          id: 'hand_bound_buttonholes',
          label: 'Milanese Gimp Buttonholes',
          description: 'Each buttonhole requires 45 minutes of hand-braided silk gimp knotting.',
          x: 48.0,
          y: 58.0,
        },
      ],
    },
  },
  {
    handle: 'look-04-celeste-pleated-gown',
    title: 'Look 04 — Céleste Sunburst Pleated Halter Gown',
    descriptionHtml: '<p>Hand-pleated metallic organza gown unfolding into a dramatic sunburst cascade, caught at the nape with an unpolished gold ring.</p>',
    productType: 'Haute Couture',
    vendor: 'Maison Aura',
    price: '21000.00',
    variants: [
      { title: 'FR 36 / Made to Measure', price: '21000.00' },
      { title: 'FR 38 / Made to Measure', price: '21000.00' },
    ],
    images: [
      { src: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85', altText: 'Céleste Pleated Gown' },
    ],
    radarCoordinates: {
      silhouette: 'Sunburst Pleating',
      fabric_origin: 'Lurex Metallic Silk Organza (Atelier Lognon)',
      savoir_faire_hours: 410,
      stitch_count: 62000,
      artisans_involved: ['Hélène de Saint-Germain', 'Atelier Lognon (Maître Plisseur)'],
      hotspots: [
        {
          id: 'sunburst_accordion',
          label: 'Cardboard Mold Sunburst Pleat',
          description: 'Custom kraft-paper molds steamed for six hours to permanently temper the organza geometry.',
          x: 52.0,
          y: 62.0,
        },
        {
          id: 'neck_cuff',
          label: '24k Raw Cast Torc Collar',
          description: 'Solid gold-cast choker acting as the singular structural anchor for 28 yards of pleated organza.',
          x: 50.0,
          y: 18.0,
        },
      ],
    },
  },
];

async function seedProducts() {
  console.log('\n\x1b[36m[Step 3/4] Seeding Haute Couture Products & Garment Radars...\x1b[0m');

  for (const prod of SEED_PRODUCTS) {
    try {
      const res = await shopifyAdminFetch(`
        mutation CreateProductWithRadar($input: ProductInput!, $media: [CreateMediaInput!]) {
          productCreate(input: $input, media: $media) {
            product {
              id
              handle
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        input: {
          title: prod.title,
          handle: prod.handle,
          descriptionHtml: prod.descriptionHtml,
          productType: prod.productType,
          vendor: prod.vendor,
          metafields: [
            {
              namespace: 'custom',
              key: 'radar_coordinates',
              type: 'json',
              value: JSON.stringify(prod.radarCoordinates),
            },
          ],
        },
        media: prod.images.map((img) => ({
          originalSource: img.src,
          alt: img.altText,
          mediaContentType: 'IMAGE',
        })),
      });

      if (res?.productCreate?.userErrors?.length) {
        console.log(`  ℹ Product '${prod.handle}': ${res.productCreate.userErrors[0].message}`);
      } else {
        console.log(`  \x1b[32m✔\x1b[0m Seeded Product: ${prod.title} with Hotspot Metafield`);
      }
    } catch (err) {
      console.warn(`  ⚠ Failed to seed product '${prod.handle}':`, err.message);
    }
  }
}

// -------------------------------------------------------------
// 4. Seed Metaobjects (Artisans, Hero, Craft Stories)
// -------------------------------------------------------------

const SEED_ARTISANS = [
  {
    handle: 'helene-de-saint-germain',
    name: 'Hélène de Saint-Germain',
    role: 'Première d’Atelier Flou',
    specialty: 'Sculptural Draping & Structural Boning',
    yearsOfCraft: 34,
    bio: 'Having trained under mid-century master couturiers, Madame Saint-Germain directs the flou atelier with architectural exactitude.',
    quote: 'Silk has memory. If you force it, it resists; if you listen, it ascends.',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
  },
  {
    handle: 'marc-dufour',
    name: 'Marc Dufour',
    role: 'Maître Tailleur & Head of Tailoring',
    specialty: 'Pagoda Shoulders & Savile Row Canvassing',
    yearsOfCraft: 28,
    bio: 'A master of geometric precision, Marc balances bespoke Savile Row structural rigor with the sensual fluidity of Parisian haute couture.',
    quote: 'A jacket must feel weightless to the wearer while commanding absolute authority to the eye.',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
  },
];

async function seedMetaobjects() {
  console.log('\n\x1b[36m[Step 4/4] Seeding Editorial Metaobjects...\x1b[0m');

  // 4.1 Hero Editorial
  try {
    const heroRes = await shopifyAdminFetch(`
      mutation SeedHeroMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject { id handle }
          userErrors { field message }
        }
      }
    `, {
      metaobject: {
        type: 'hero_editorial',
        handle: 'homepage-runway-hero',
        fields: [
          { key: 'eyebrow', value: 'Maison Aura — Haute Couture Automne-Hiver 2026' },
          { key: 'headline', value: 'L’Ombre et La Lumière' },
          { key: 'subheadline', value: 'An architectural dialogue between nocturnal velvet, gold filaments, and hand-sculpted silk faille.' },
          { key: 'primary_cta_label', value: 'Explore Lookbook & Radar' },
          { key: 'primary_cta_url', value: '/collections/automne-hiver-2026' },
          { key: 'secondary_cta_label', value: 'Private Atelier Consultation' },
          { key: 'secondary_cta_url', value: '#bespoke-inquiry' },
          { key: 'media_banner', value: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85' },
        ],
      },
    });

    if (heroRes?.metaobjectCreate?.userErrors?.length) {
      console.log(`  ℹ Hero metaobject: ${heroRes.metaobjectCreate.userErrors[0].message}`);
    } else {
      console.log('  \x1b[32m✔\x1b[0m Seeded Metaobject: hero_editorial (homepage-runway-hero)');
    }
  } catch (err) {
    console.warn('  ⚠ Failed to seed hero metaobject:', err.message);
  }

  // 4.2 Craft Story
  try {
    const craftRes = await shopifyAdminFetch(`
      mutation SeedCraftStoryMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject { id handle }
          userErrors { field message }
        }
      }
    `, {
      metaobject: {
        type: 'craft_story',
        handle: 'architecture-of-time',
        fields: [
          { key: 'eyebrow', value: 'Savoir-Faire & Métiers d’Art' },
          { key: 'headline', value: 'The Architecture of Time' },
          { key: 'story_narrative', value: 'In our atelier at 18 Place Vendôme, time is the ultimate luxury. Over 300 hours of patient handcrafting go into each garment.' },
          { key: 'quote', value: 'Haute couture is the discipline of giving permanence to emotion through the tension of silk.' },
          { key: 'quote_author', value: 'Hélène de Saint-Germain, Première d’Atelier' },
          { key: 'savoir_faire_hours', value: '320' },
          { key: 'stitch_count', value: '54000' },
          { key: 'media_asset', value: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85' },
        ],
      },
    });

    if (craftRes?.metaobjectCreate?.userErrors?.length) {
      console.log(`  ℹ Craft Story metaobject: ${craftRes.metaobjectCreate.userErrors[0].message}`);
    } else {
      console.log('  \x1b[32m✔\x1b[0m Seeded Metaobject: craft_story (architecture-of-time)');
    }
  } catch (err) {
    console.warn('  ⚠ Failed to seed craft story metaobject:', err.message);
  }

  // 4.3 Artisan Profiles
  for (const artisan of SEED_ARTISANS) {
    try {
      const artRes = await shopifyAdminFetch(`
        mutation SeedArtisan($metaobject: MetaobjectCreateInput!) {
          metaobjectCreate(metaobject: $metaobject) {
            metaobject { id handle }
            userErrors { field message }
          }
        }
      `, {
        metaobject: {
          type: 'artisan_profile',
          handle: artisan.handle,
          fields: [
            { key: 'name', value: artisan.name },
            { key: 'role', value: artisan.role },
            { key: 'specialty', value: artisan.specialty },
            { key: 'years_of_craft', value: String(artisan.yearsOfCraft) },
            { key: 'bio', value: artisan.bio },
            { key: 'quote', value: artisan.quote },
            { key: 'portrait_url', value: artisan.portraitUrl },
          ],
        },
      });

      if (artRes?.metaobjectCreate?.userErrors?.length) {
        console.log(`  ℹ Artisan '${artisan.handle}': ${artRes.metaobjectCreate.userErrors[0].message}`);
      } else {
        console.log(`  \x1b[32m✔\x1b[0m Seeded Metaobject: artisan_profile (${artisan.name})`);
      }
    } catch (err) {
      console.warn(`  ⚠ Failed to seed artisan '${artisan.handle}':`, err.message);
    }
  }
}

// -------------------------------------------------------------
// Main CLI Runner
// -------------------------------------------------------------

async function ensureStorefrontToken() {
  if (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) return;
  try {
    const res = await shopifyAdminFetch(`
      mutation CreateStorefrontToken {
        storefrontAccessTokenCreate(input: { title: "Maison Aura Headless Storefront" }) {
          storefrontAccessToken {
            accessToken
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `);

    const token = res?.storefrontAccessTokenCreate?.storefrontAccessToken?.accessToken;
    if (token) {
      console.log('  \x1b[32m✔\x1b[0m Generated Storefront Access Token');
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = token;
      if (fs.existsSync(envLocalPath)) {
        let envContent = fs.readFileSync(envLocalPath, 'utf-8');
        if (!envContent.includes('SHOPIFY_STOREFRONT_ACCESS_TOKEN=')) {
          envContent += `\nSHOPIFY_STOREFRONT_ACCESS_TOKEN=${token}\n`;
          fs.writeFileSync(envLocalPath, envContent);
        }
      }
    }
  } catch (err) {
    // Ignore if not permitted
  }
}

async function executeBlueprint(blueprintPath) {
  const fullPath = path.resolve(process.cwd(), blueprintPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Blueprint file not found at: ${fullPath}`);
  }
  const blueprint = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  console.log(`\x1b[35m[Blueprint]\x1b[0m Executing Blueprint: \x1b[1m${blueprint.name || path.basename(blueprintPath)}\x1b[0m`);
  if (blueprint.description) {
    console.log(`\x1b[90m${blueprint.description}\x1b[0m\n`);
  }

  // 1. Metaobject Definitions
  if (blueprint.metaobjectDefinitions?.length) {
    console.log('\x1b[36m[Blueprint Step 1] Creating Metaobject Definitions...\x1b[0m');
    for (const def of blueprint.metaobjectDefinitions) {
      try {
        const res = await shopifyAdminFetch(`
          mutation CreateBlueprintMetaobjectDef($definition: MetaobjectDefinitionCreateInput!) {
            metaobjectDefinitionCreate(definition: $definition) {
              metaobjectDefinition { id type }
              userErrors { field message }
            }
          }
        `, { definition: def });
        if (res?.metaobjectDefinitionCreate?.userErrors?.length) {
          console.log(`  ℹ ${def.type}: ${res.metaobjectDefinitionCreate.userErrors[0].message}`);
        } else {
          console.log(`  \x1b[32m✔\x1b[0m Created Metaobject Definition: ${def.type}`);
        }
      } catch (err) {
        console.warn(`  ℹ ${def.type} note:`, err.message);
      }
    }
  }

  // 2. Product Metafield Definitions
  if (blueprint.productMetafieldDefinitions?.length) {
    console.log('\x1b[36m[Blueprint Step 2] Creating Product Metafield Definitions...\x1b[0m');
    for (const def of blueprint.productMetafieldDefinitions) {
      try {
        const res = await shopifyAdminFetch(`
          mutation CreateBlueprintMetafieldDef($definition: MetafieldDefinitionInput!) {
            metafieldDefinitionCreate(definition: $definition) {
              createdDefinition { id namespace key }
              userErrors { field message }
            }
          }
        `, { definition: def });
        if (res?.metafieldDefinitionCreate?.userErrors?.length) {
          console.log(`  ℹ ${def.namespace}.${def.key}: ${res.metafieldDefinitionCreate.userErrors[0].message}`);
        } else {
          console.log(`  \x1b[32m✔\x1b[0m Created Metafield Definition: ${def.namespace}.${def.key}`);
        }
      } catch (err) {
        console.warn(`  ℹ ${def.namespace}.${def.key} note:`, err.message);
      }
    }
  }

  // 3. Collections
  if (blueprint.collections?.length) {
    console.log('\x1b[36m[Blueprint Step 3] Seeding Collections...\x1b[0m');
    for (const col of blueprint.collections) {
      try {
        const res = await shopifyAdminFetch(`
          mutation CreateBlueprintCollection($input: CollectionInput!) {
            collectionCreate(input: $input) {
              collection { id handle title }
              userErrors { field message }
            }
          }
        `, { input: col });
        if (res?.collectionCreate?.userErrors?.length) {
          console.log(`  ℹ Collection '${col.handle}': ${res.collectionCreate.userErrors[0].message}`);
        } else {
          console.log(`  \x1b[32m✔\x1b[0m Seeded Collection: ${col.title}`);
        }
      } catch (err) {
        console.warn(`  ⚠ Collection '${col.handle}' failed:`, err.message);
      }
    }
  }

  // 4. Products & Variants & Metafields
  if (blueprint.products?.length) {
    console.log('\x1b[36m[Blueprint Step 4] Seeding Products & Hotspots...\x1b[0m');
    for (const prod of blueprint.products) {
      try {
        const input = {
          title: prod.title,
          handle: prod.handle,
          descriptionHtml: prod.descriptionHtml,
          productType: prod.productType,
          vendor: prod.vendor,
          metafields: prod.metafields,
        };
        const media = prod.images?.map(img => ({
          originalSource: img.src,
          alt: img.altText,
          mediaContentType: 'IMAGE',
        }));

        const res = await shopifyAdminFetch(`
          mutation CreateBlueprintProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
            productCreate(input: $input, media: $media) {
              product { id handle title }
              userErrors { field message }
            }
          }
        `, { input, media });

        if (res?.productCreate?.userErrors?.length) {
          console.log(`  ℹ Product '${prod.handle}': ${res.productCreate.userErrors[0].message}`);
        } else {
          console.log(`  \x1b[32m✔\x1b[0m Seeded Product: ${prod.title}`);
        }
      } catch (err) {
        console.warn(`  ⚠ Product '${prod.handle}' failed:`, err.message);
      }
    }
  }

  // 5. Metaobjects
  if (blueprint.metaobjects?.length) {
    console.log('\x1b[36m[Blueprint Step 5] Seeding Metaobjects...\x1b[0m');
    for (const mo of blueprint.metaobjects) {
      try {
        const res = await shopifyAdminFetch(`
          mutation CreateBlueprintMetaobject($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
              metaobject { id handle }
              userErrors { field message }
            }
          }
        `, { metaobject: mo });
        if (res?.metaobjectCreate?.userErrors?.length) {
          console.log(`  ℹ Metaobject '${mo.handle}': ${res.metaobjectCreate.userErrors[0].message}`);
        } else {
          console.log(`  \x1b[32m✔\x1b[0m Seeded Metaobject: ${mo.type} (${mo.handle})`);
        }
      } catch (err) {
        console.warn(`  ⚠ Metaobject '${mo.handle}' failed:`, err.message);
      }
    }
  }
}

async function run() {
  console.log(`Connecting to: \x1b[33mhttps://${DOMAIN}\x1b[0m (API version: ${API_VERSION})`);

  try {
    // Ping shop info to verify credentials
    const shopRes = await shopifyAdminFetch(`{ shop { name email myshopifyDomain } }`);
    console.log(`\x1b[32mConnected successfully to:\x1b[0m ${shopRes.shop.name} (${shopRes.shop.myshopifyDomain})\n`);
  } catch (err) {
    console.error('\x1b[31m[Authentication Failed]\x1b[0m Could not connect to Shopify Store.');
    console.error('Details:', err.message);
    process.exit(1);
  }

  await ensureStorefrontToken();

  if (BLUEPRINT_PATH) {
    await executeBlueprint(BLUEPRINT_PATH);
  } else {
    if (WITH_DEFINITIONS) {
      await provisionDefinitions();
    } else {
      console.log('\x1b[90mSkipping schema definition creation (run with --with-definitions to auto-create schemas).\x1b[0m');
    }

    await seedCollections();
    await seedProducts();
    await seedMetaobjects();
  }

  console.log('\n\x1b[32m✨ Operation completed successfully!\x1b[0m\n');
}

run().catch((err) => {
  console.error('\x1b[31mFatal error during provisioning:\x1b[0m', err);
  process.exit(1);
});
