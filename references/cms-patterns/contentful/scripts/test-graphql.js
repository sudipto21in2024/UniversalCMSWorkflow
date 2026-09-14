// scripts/test-graphql.js
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
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const CDA_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || '';

const query = JSON.stringify({
  query: `
    query GetHomePage {
      pageCollection(where: { slug: "home" }, limit: 1) {
        items {
          title
          slug
          seoMetadata {
            metaTitle
            metaDescription
          }
          sectionsCollection(limit: 10) {
            items {
              __typename
              ... on Entry {
                sys {
                  id
                }
              }
              ... on HeroEditorial {
                eyebrow
                headline
                subtitle
                primaryCtaText
                primaryCtaLink
              }
              ... on CraftStory {
                eyebrow
                headline
                quote
                savoirFaireHours
                stitchCount
              }
              ... on LookbookGrid {
                sectionTitle
                seasonLabel
                looksCollection(limit: 5) {
                  items {
                    lookNumber
                    title
                    silhouette
                    material
                    radarCoordinates
                  }
                }
              }
              ... on CuratedReel {
                headline
              }
              ... on BespokeInquiry {
                headline
                subheadline
                disclaimer
              }
            }
          }
        }
      }
    }
  `,
});

const req = https.request(
  {
    hostname: 'graphql.contentful.com',
    path: `/content/v1/spaces/${SPACE_ID}/environments/master`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CDA_TOKEN}`,
      'Content-Type': 'application/json',
    },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      console.log('✅ Contentful GraphQL Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  }
);

req.write(query);
req.end();
