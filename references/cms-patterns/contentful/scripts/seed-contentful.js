// scripts/seed-contentful.js
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        process.env[match[1]] = (match[2] || '').trim();
      }
    });
  }
} catch (e) {}

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID || '';
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN || '';

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.contentful.com',
      path: `/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}${path}`,
      method: method,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createAndPublishEntry(contentTypeId, entryId, fields) {
  console.log(`Creating ${contentTypeId} [${entryId}]...`);
  try {
    const entry = await request(
      'PUT',
      `/entries/${entryId}`,
      { fields },
      { 'X-Contentful-Content-Type': contentTypeId }
    );
    const version = entry.sys.version;
    console.log(`Publishing ${contentTypeId} [${entryId}] (v${version})...`);
    await request('PUT', `/entries/${entryId}/published`, null, {
      'X-Contentful-Version': version,
    });
    console.log(`✓ Published ${contentTypeId} [${entryId}]`);
    return entry;
  } catch (err) {
    console.error(`Failed ${contentTypeId} [${entryId}]:`, JSON.stringify(err, null, 2));
    throw err;
  }
}

async function main() {
  console.log('🚀 Seeding Maison Aura Contentful Space...\n');

  // 1. Create SEO Metadata
  await createAndPublishEntry('seoMetadata', 'seo-home', {
    metaTitle: { 'en-US': 'Maison Aura — Haute Couture & High Artisanship' },
    metaDescription: {
      'en-US':
        'Discover Maison Aura: a sanctuary of timeless silhouettes, hand-loomed jacquards, and bespoke couture mastery.',
    },
    noIndex: { 'en-US': false },
  });

  // 2. Create Hero Editorial Section
  await createAndPublishEntry('heroEditorial', 'hero-editorial-home', {
    eyebrow: { 'en-US': 'Automne / Hiver 2026 Collection' },
    headline: { 'en-US': 'Sculpted in Light, Woven in Shadow' },
    subtitle: {
      'en-US':
        'An exploration of structural fluidity, precious raw silks, and hand-embroidered metallic threadwork.',
    },
    primaryCtaText: { 'en-US': 'Explore the Runway' },
    primaryCtaLink: { 'en-US': '#lookbook' },
    secondaryCtaText: { 'en-US': 'Atelier Appointment' },
    secondaryCtaLink: { 'en-US': '#inquiry' },
  });

  // 3. Create Craft Story Section
  await createAndPublishEntry('craftStory', 'craft-story-home', {
    eyebrow: { 'en-US': 'The Atelier Chronicles' },
    headline: { 'en-US': 'Precision in Every Filament' },
    quote: {
      'en-US':
        'Couture is not simply garment fabrication; it is an architectural dialogue between fiber and human movement.',
    },
    savoirFaireHours: { 'en-US': 340 },
    stitchCount: { 'en-US': 42000 },
    storyParagraphs: {
      'en-US': {
        nodeType: 'document',
        data: {},
        content: [
          {
            nodeType: 'paragraph',
            data: {},
            content: [
              {
                nodeType: 'text',
                value:
                  'Every garment emerging from our Parisian atelier is the culmination of hundreds of hours of dedicated craft. Master artisans meticulously assemble each piece using traditional hand-needle techniques passed down across generations.',
                marks: [],
                data: {},
              },
            ],
          },
        ],
      },
    },
  });

  // 4. Create Runway Looks
  await createAndPublishEntry('look', 'look-01', {
    lookNumber: { 'en-US': 'LOOK 01' },
    title: { 'en-US': 'The Obsidian Sculpted Column' },
    silhouette: { 'en-US': 'Architectural Floor-Length Gown' },
    material: { 'en-US': 'Triple-Dyed Mulberry Silk Velvet & Gold Filigree' },
    radarCoordinates: {
      'en-US': [
        { x: 38, y: 22, title: 'Gold Filigree Bodice', detail: '18k gold threadwork hand-stitched over 80 hours' },
        { x: 52, y: 68, title: 'Pleated Velvet Hem', detail: 'Weighted structural hem for liquid runway motion' },
      ],
    },
  });

  await createAndPublishEntry('look', 'look-02', {
    lookNumber: { 'en-US': 'LOOK 02' },
    title: { 'en-US': 'The Alabaster Organza Cloak' },
    silhouette: { 'en-US': 'Cocoon Silhouette with Fluted Lapels' },
    material: { 'en-US': 'Semi-Sheer Japanese Silk Organza' },
    radarCoordinates: {
      'en-US': [
        { x: 45, y: 30, title: 'Fluted Collar', detail: 'Thermally molded micro-pleats creating soft sculptural contours' },
      ],
    },
  });

  await createAndPublishEntry('look', 'look-03', {
    lookNumber: { 'en-US': 'LOOK 03' },
    title: { 'en-US': 'The Midnight Jacquard Tailleur' },
    silhouette: { 'en-US': 'Sharp Hourglass Peplum Jacket & Trousers' },
    material: { 'en-US': 'Custom Loomed Metallic Brocade' },
    radarCoordinates: {
      'en-US': [
        { x: 50, y: 40, title: 'Peplum Waist', detail: 'Constructed horsehair canvas interior for permanent sculpted waistline' },
      ],
    },
  });

  // 5. Create Lookbook Grid Section
  await createAndPublishEntry('lookbookGrid', 'lookbook-grid-home', {
    sectionTitle: { 'en-US': 'The Autumn / Winter Runway' },
    seasonLabel: { 'en-US': 'Collection N° 14 — Paris' },
    looks: {
      'en-US': [
        { sys: { type: 'Link', linkType: 'Entry', id: 'look-01' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'look-02' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'look-03' } },
      ],
    },
  });

  // 6. Create Curated Reel Section
  await createAndPublishEntry('curatedReel', 'curated-reel-home', {
    headline: { 'en-US': 'Atelier Highlights & Runway Moments' },
    curatedItems: {
      'en-US': [
        { sys: { type: 'Link', linkType: 'Entry', id: 'look-01' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'look-02' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'look-03' } },
      ],
    },
  });

  // 7. Create Bespoke Inquiry Section
  await createAndPublishEntry('bespokeInquiry', 'bespoke-inquiry-home', {
    headline: { 'en-US': 'Private Atelier Consultations' },
    subheadline: {
      'en-US': 'Reserve a private fitting with our Master Tailors in Paris, London, or New York.',
    },
    disclaimer: {
      'en-US':
        'Appointments are confirmed upon review of client preferences. Strict confidentiality guaranteed.',
    },
    submissionEndpoint: { 'en-US': '/api/inquiry' },
  });

  // 8. Create & Link Main Page (Root Container)
  await createAndPublishEntry('page', 'page-home', {
    title: { 'en-US': 'Maison Aura — Home' },
    slug: { 'en-US': 'home' },
    seoMetadata: {
      'en-US': { sys: { type: 'Link', linkType: 'Entry', id: 'seo-home' } },
    },
    sections: {
      'en-US': [
        { sys: { type: 'Link', linkType: 'Entry', id: 'hero-editorial-home' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'craft-story-home' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'lookbook-grid-home' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'curated-reel-home' } },
        { sys: { type: 'Link', linkType: 'Entry', id: 'bespoke-inquiry-home' } },
      ],
    },
  });

  console.log('\n✨ All data successfully seeded and published to Contentful!');
}

main().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
