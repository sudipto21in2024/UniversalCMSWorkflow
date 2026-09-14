// migrations/01-create-maison-aura-schema.js

module.exports = function (migration) {
  // ==========================================
  // 1. SEO METADATA CONTENT TYPE
  // ==========================================
  const seoMetadata = migration
    .createContentType('seoMetadata')
    .name('SEO Metadata')
    .description('Search engine and social sharing metadata')
    .displayField('metaTitle');

  seoMetadata
    .createField('metaTitle')
    .name('Meta Title')
    .type('Symbol')
    .required(true)
    .validations([{ size: { max: 60 } }]);

  seoMetadata
    .createField('metaDescription')
    .name('Meta Description')
    .type('Text')
    .validations([{ size: { max: 160 } }]);

  seoMetadata
    .createField('ogImage')
    .name('OpenGraph Image')
    .type('Link')
    .linkType('Asset');

  seoMetadata
    .createField('noIndex')
    .name('No Index')
    .type('Boolean')
    .defaultValue({ 'en-US': false });

  // ==========================================
  // 2. HERO EDITORIAL CONTENT TYPE
  // ==========================================
  const heroEditorial = migration
    .createContentType('heroEditorial')
    .name('Hero Editorial')
    .description('Full-bleed luxury runway hero section')
    .displayField('headline');

  heroEditorial.createField('eyebrow').name('Eyebrow').type('Symbol');
  heroEditorial.createField('headline').name('Headline').type('Symbol').required(true);
  heroEditorial.createField('subtitle').name('Subtitle').type('Text');
  heroEditorial.createField('primaryCtaText').name('Primary CTA Text').type('Symbol');
  heroEditorial.createField('primaryCtaLink').name('Primary CTA Link').type('Symbol');
  heroEditorial.createField('secondaryCtaText').name('Secondary CTA Text').type('Symbol');
  heroEditorial.createField('secondaryCtaLink').name('Secondary CTA Link').type('Symbol');
  heroEditorial.createField('mediaAsset').name('Hero Media Asset').type('Link').linkType('Asset');

  // ==========================================
  // 3. CRAFT STORY CONTENT TYPE
  // ==========================================
  const craftStory = migration
    .createContentType('craftStory')
    .name('Craft Story')
    .description('Atelier craftsmanship narrative block')
    .displayField('headline');

  craftStory.createField('eyebrow').name('Eyebrow').type('Symbol');
  craftStory.createField('headline').name('Headline').type('Symbol').required(true);
  craftStory.createField('quote').name('Pull Quote').type('Symbol');
  craftStory.createField('savoirFaireHours').name('Savoir-Faire Hours').type('Integer');
  craftStory.createField('stitchCount').name('Stitch Count').type('Integer');
  craftStory.createField('artisanMedia').name('Artisan Media').type('Link').linkType('Asset');
  craftStory.createField('storyParagraphs').name('Story Paragraphs').type('RichText');

  // ==========================================
  // 4. LOOK (ENTITY)
  // ==========================================
  const look = migration
    .createContentType('look')
    .name('Look')
    .description('Haute couture look item with hotspot coordinates')
    .displayField('title');

  look.createField('lookNumber').name('Look Number').type('Symbol').required(true);
  look.createField('title').name('Look Title').type('Symbol').required(true);
  look.createField('silhouette').name('Silhouette').type('Symbol');
  look.createField('material').name('Material').type('Symbol');
  look.createField('image').name('Look Image').type('Link').linkType('Asset');
  look.createField('radarCoordinates').name('Radar Coordinates (JSON)').type('Object');

  // ==========================================
  // 5. LOOKBOOK GRID
  // ==========================================
  const lookbookGrid = migration
    .createContentType('lookbookGrid')
    .name('Lookbook Grid')
    .description('Collection runway lookbook grid')
    .displayField('sectionTitle');

  lookbookGrid.createField('sectionTitle').name('Section Title').type('Symbol').required(true);
  lookbookGrid.createField('seasonLabel').name('Season Label').type('Symbol');
  lookbookGrid
    .createField('looks')
    .name('Looks')
    .type('Array')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [{ linkContentType: ['look'] }],
    });

  // ==========================================
  // 6. CURATED REEL
  // ==========================================
  const curatedReel = migration
    .createContentType('curatedReel')
    .name('Curated Reel')
    .description('Marquee reel of curated runway looks')
    .displayField('headline');

  curatedReel.createField('headline').name('Headline').type('Symbol').required(true);
  curatedReel
    .createField('curatedItems')
    .name('Curated Items')
    .type('Array')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [{ linkContentType: ['look'] }],
    });

  // ==========================================
  // 7. BESPOKE INQUIRY
  // ==========================================
  const bespokeInquiry = migration
    .createContentType('bespokeInquiry')
    .name('Bespoke Inquiry')
    .description('VIP couture appointment booking section')
    .displayField('headline');

  bespokeInquiry.createField('headline').name('Headline').type('Symbol').required(true);
  bespokeInquiry.createField('subheadline').name('Subheadline').type('Symbol');
  bespokeInquiry.createField('disclaimer').name('Disclaimer').type('Text');
  bespokeInquiry.createField('submissionEndpoint').name('Submission Endpoint').type('Symbol');

  // ==========================================
  // 8. PAGE (ROOT CONTAINER)
  // ==========================================
  const page = migration
    .createContentType('page')
    .name('Page')
    .description('Root page container holding dynamic sections')
    .displayField('title');

  page.createField('title').name('Title').type('Symbol').required(true);
  page.createField('slug').name('Slug').type('Symbol').required(true).validations([{ unique: true }]);
  page
    .createField('seoMetadata')
    .name('SEO Metadata')
    .type('Link')
    .linkType('Entry')
    .validations([{ linkContentType: ['seoMetadata'] }]);
  page
    .createField('sections')
    .name('Dynamic Sections')
    .type('Array')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [
        {
          linkContentType: [
            'heroEditorial',
            'craftStory',
            'lookbookGrid',
            'curatedReel',
            'bespokeInquiry',
          ],
        },
      ],
    });
};
