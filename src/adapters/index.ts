/**
 * Universal Headless CMS Prop Adapter Layer
 * 
 * Standardizes raw API responses from different headless CMS backends
 * (Shopify Storefront GraphQL, Contentful REST/GraphQL, Sitecore Layout Service, WPGraphQL)
 * into pure, strongly-typed component prop contracts.
 */

// ============================================================================
// 1. Standard Component Prop Interfaces
// ============================================================================

export interface HeroEditorialProps {
  eyebrow?: string;
  headline: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  imageUrl: string;
  imageAlt?: string;
}

export interface CraftStoryProps {
  eyebrow?: string;
  headline: string;
  storyNarrative: string;
  quote?: string;
  quoteAuthor?: string;
  savoirFaireHours?: number;
  stitchCount?: number;
  imageUrl: string;
}

export interface ProductCardProps {
  id: string;
  title: string;
  handle: string;
  price: string;
  compareAtPrice?: string;
  imageUrl: string;
  badge?: {
    text: string;
    type: "discount" | "new";
  };
}

// ============================================================================
// 2. Shopify GraphQL Adapters (Metaobjects & Products)
// ============================================================================

export const ShopifyAdapter = {
  heroEditorial(rawMetaobject: any): HeroEditorialProps {
    if (!rawMetaobject) return { headline: "", imageUrl: "" };
    const fields = Array.isArray(rawMetaobject.fields) ? rawMetaobject.fields : [];
    const getVal = (key: string) => fields.find((f: any) => f.key === key)?.value || "";

    return {
      eyebrow: getVal("eyebrow"),
      headline: getVal("headline") || "Untitled Editorial",
      subtitle: getVal("subheadline"),
      ctaText: getVal("primary_cta_label") || "Explore",
      ctaUrl: getVal("primary_cta_url") || "#",
      secondaryCtaText: getVal("secondary_cta_label"),
      secondaryCtaUrl: getVal("secondary_cta_url"),
      imageUrl: getVal("media_banner") || rawMetaobject.image?.url || "",
      imageAlt: getVal("headline"),
    };
  },

  craftStory(rawMetaobject: any): CraftStoryProps {
    if (!rawMetaobject) return { headline: "", storyNarrative: "", imageUrl: "" };
    const fields = Array.isArray(rawMetaobject.fields) ? rawMetaobject.fields : [];
    const getVal = (key: string) => fields.find((f: any) => f.key === key)?.value || "";

    return {
      eyebrow: getVal("eyebrow"),
      headline: getVal("headline") || "Savoir-Faire",
      storyNarrative: getVal("story_narrative"),
      quote: getVal("quote"),
      quoteAuthor: getVal("quote_author"),
      savoirFaireHours: parseInt(getVal("savoir_faire_hours"), 10) || undefined,
      stitchCount: parseInt(getVal("stitch_count"), 10) || undefined,
      imageUrl: getVal("media_asset") || "",
    };
  },

  productCard(rawProduct: any): ProductCardProps {
    if (!rawProduct) return { id: "", title: "", handle: "", price: "", imageUrl: "" };
    const firstVariant = rawProduct.variants?.edges?.[0]?.node || rawProduct.variants?.[0];
    const firstImage = rawProduct.images?.edges?.[0]?.node || rawProduct.images?.[0];

    return {
      id: rawProduct.id || "",
      title: rawProduct.title || "Untitled Product",
      handle: rawProduct.handle || "",
      price: firstVariant?.price?.amount || firstVariant?.price || "0.00",
      compareAtPrice: firstVariant?.compareAtPrice?.amount || firstVariant?.compareAtPrice,
      imageUrl: firstImage?.url || firstImage?.src || "",
    };
  },
};

// ============================================================================
// 3. Contentful Adapters (Content Models & References)
// ============================================================================

export const ContentfulAdapter = {
  heroEditorial(entry: any, locale = "en-US"): HeroEditorialProps {
    if (!entry || !entry.fields) return { headline: "", imageUrl: "" };
    const f = entry.fields;
    const getLocaleVal = (field: any) => (typeof field === "object" && field !== null && locale in field ? field[locale] : field);

    const mediaAsset = getLocaleVal(f.mediaAsset);
    const imageUrl = mediaAsset?.fields?.file?.[locale]?.url || mediaAsset?.fields?.file?.url || "";

    return {
      eyebrow: getLocaleVal(f.eyebrow),
      headline: getLocaleVal(f.headline) || "",
      subtitle: getLocaleVal(f.subtitle),
      ctaText: getLocaleVal(f.primaryCtaText),
      ctaUrl: getLocaleVal(f.primaryCtaLink),
      secondaryCtaText: getLocaleVal(f.secondaryCtaText),
      secondaryCtaUrl: getLocaleVal(f.secondaryCtaLink),
      imageUrl: imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl,
    };
  },
};

// ============================================================================
// 4. WordPress / OpenFields Adapters (WPGraphQL / REST)
// ============================================================================

export const WordPressAdapter = {
  heroEditorial(postOrAcf: any): HeroEditorialProps {
    if (!postOrAcf) return { headline: "", imageUrl: "" };
    const acf = postOrAcf.acf || postOrAcf;

    return {
      eyebrow: acf.hero_eyebrow || "",
      headline: acf.hero_headline || postOrAcf.title?.rendered || "",
      ctaText: acf.hero_cta_text || "",
      ctaUrl: acf.hero_cta_url || "",
      imageUrl: acf.hero_bg_image?.url || (typeof acf.hero_bg_image === "string" ? acf.hero_bg_image : ""),
      imageAlt: acf.hero_bg_image?.alt || "",
    };
  },
};

// ============================================================================
// 5. Sitecore XM Cloud / JSS Layout Service Adapter
// ============================================================================

export const SitecoreAdapter = {
  heroEditorial(rendering: any): HeroEditorialProps {
    if (!rendering || !rendering.fields) return { headline: "", imageUrl: "" };
    const f = rendering.fields;

    return {
      eyebrow: f.Eyebrow?.value || "",
      headline: f.Headline?.value || "",
      subtitle: f.Subtitle?.value || "",
      ctaText: f.PrimaryCtaText?.value || "",
      ctaUrl: f.PrimaryCtaLink?.value?.href || f.PrimaryCtaLink?.value || "",
      imageUrl: f.MediaAsset?.value?.src || "",
      imageAlt: f.MediaAsset?.value?.alt || "",
    };
  },
};
