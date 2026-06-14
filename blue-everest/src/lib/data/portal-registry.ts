// src/lib/data/portal-registry.ts
// Static portal definitions for seeding the portals table.
// Analogous to fb-autoposter's GROUP_PROFILES in group-analyzer.js.

export interface PortalDefinition {
  slug: string;
  name: string;
  tier: number;
  portalType: 'property_portal' | 'aggregator' | 'social' | 'ads' | 'video' | 'partnership' | 'community';
  integrationMethod: 'api_feed' | 'playwright' | 'manual' | 'connector';
  fieldMapping: Record<string, string>;
  imageSpecs: { maxImages: number; minWidth: number; format: string };
  descriptionLimits: { minChars: number; maxChars: number };
  requiredFields: string[];
  apiBaseUrl?: string;
  apiKeyEnvVar?: string;
  feedUrl?: string;
  loginUrl?: string;
  markets: string[];
  targetAudiences: string[];
  countries: string[];
  listingFeeUsd: number;
  refreshIntervalDays: number;
  notes?: string;
  dashboardUrl?: string;
  submitUrl?: string;
  signupUrl?: string;
  websiteUrl?: string;
}

// ============================================================
// Tier 1: Philippine Local Portals
// ============================================================

const LAMUDI_PH: PortalDefinition = {
  slug: 'lamudi-ph',
  name: 'Lamudi Philippines',
  tier: 1,
  portalType: 'property_portal',
  integrationMethod: 'api_feed',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'floor_area',
    lot_area_sqm: 'lot_area',
    address: 'address_line',
    city: 'city',
    province: 'region',
    latitude: 'geo_latitude',
    longitude: 'geo_longitude',
    descriptions: 'description',
    image_urls: 'images',
    property_type: 'listing_type',
  },
  imageSpecs: { maxImages: 30, minWidth: 800, format: 'jpg,png,webp' },
  descriptionLimits: { minChars: 100, maxChars: 10000 },
  requiredFields: ['title', 'price', 'description', 'images', 'bedrooms', 'floor_area', 'listing_type', 'city'],
  apiKeyEnvVar: 'LAMUDI_API_KEY',
  feedUrl: undefined, // Set via LAMUDI_FEED_URL env var
  markets: ['PH'],
  targetAudiences: ['filipino_investors', 'local_buyers', 'ofw'],
  countries: ['PH'],
  listingFeeUsd: 0,
  refreshIntervalDays: 30,
  notes: 'Largest PH property portal. Supports RESO-style XML feeds and manual dashboard.',
  websiteUrl: 'https://www.lamudi.com.ph',
  dashboardUrl: 'https://www.lamudi.com.ph/agent/',
  submitUrl: 'https://www.lamudi.com.ph/agent/listing/create',
  signupUrl: 'https://www.lamudi.com.ph/agent/register',
};

const DOT_PROPERTY_PH: PortalDefinition = {
  slug: 'dotproperty-ph',
  name: 'Dot Property Philippines',
  tier: 1,
  portalType: 'property_portal',
  integrationMethod: 'playwright',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'floor_size',
    descriptions: 'description',
    image_urls: 'photos',
    property_type: 'property_type',
    city: 'location',
  },
  imageSpecs: { maxImages: 20, minWidth: 600, format: 'jpg,png' },
  descriptionLimits: { minChars: 50, maxChars: 5000 },
  requiredFields: ['title', 'price', 'description', 'photos', 'property_type', 'location'],
  loginUrl: 'https://www.dotproperty.com.ph/en/login',
  markets: ['PH', 'INTL'],
  targetAudiences: ['filipino_investors', 'expats', 'local_buyers'],
  countries: ['PH'],
  listingFeeUsd: 0,
  refreshIntervalDays: 30,
  notes: 'Southeast Asian portal. No API - Playwright form fill only.',
  websiteUrl: 'https://www.dotproperty.com.ph',
  dashboardUrl: 'https://www.dotproperty.com.ph/en/agent',
  submitUrl: 'https://www.dotproperty.com.ph/en/post-listing',
  signupUrl: 'https://www.dotproperty.com.ph/en/register',
};

const FAZWAZ_PH: PortalDefinition = {
  slug: 'fazwaz-ph',
  name: 'FazWaz Philippines',
  tier: 1,
  portalType: 'property_portal',
  integrationMethod: 'playwright',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'indoor_area',
    lot_area_sqm: 'outdoor_area',
    descriptions: 'description',
    image_urls: 'images',
    property_type: 'type',
    city: 'location',
  },
  imageSpecs: { maxImages: 20, minWidth: 600, format: 'jpg,png' },
  descriptionLimits: { minChars: 50, maxChars: 5000 },
  requiredFields: ['title', 'price', 'description', 'images', 'type', 'location'],
  loginUrl: 'https://www.fazwaz.com.ph/login',
  markets: ['PH', 'INTL'],
  targetAudiences: ['foreign_investors', 'expats'],
  countries: ['PH', 'TH', 'ID', 'MY'],
  listingFeeUsd: 0,
  refreshIntervalDays: 30,
  notes: 'Strong with foreign investor audience. Playwright automation.',
  websiteUrl: 'https://www.fazwaz.com.ph',
  dashboardUrl: 'https://www.fazwaz.com.ph/agent',
  submitUrl: 'https://www.fazwaz.com.ph/listing/create',
  signupUrl: 'https://www.fazwaz.com.ph/agent/register',
};

const REAL_PH: PortalDefinition = {
  slug: 'real-ph',
  name: 'Real.ph',
  tier: 1,
  portalType: 'property_portal',
  integrationMethod: 'playwright',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'floor_area',
    descriptions: 'description',
    image_urls: 'images',
    property_type: 'type',
  },
  imageSpecs: { maxImages: 15, minWidth: 600, format: 'jpg,png' },
  descriptionLimits: { minChars: 30, maxChars: 3000 },
  requiredFields: ['title', 'price', 'description', 'type'],
  loginUrl: 'https://www.real.ph/login',
  markets: ['PH'],
  targetAudiences: ['local_buyers', 'filipino_investors'],
  countries: ['PH'],
  listingFeeUsd: 0,
  refreshIntervalDays: 30,
  notes: 'Smaller PH portal. Low priority.',
  websiteUrl: 'https://www.real.ph',
  submitUrl: 'https://www.real.ph/post',
  signupUrl: 'https://www.real.ph/register',
};

const CAROUSELL_PROPERTY: PortalDefinition = {
  slug: 'carousell-property',
  name: 'Carousell Property',
  tier: 1,
  portalType: 'property_portal',
  integrationMethod: 'playwright',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'floor_area',
    descriptions: 'description',
    image_urls: 'images',
    property_type: 'category',
    city: 'location',
  },
  imageSpecs: { maxImages: 10, minWidth: 500, format: 'jpg,png' },
  descriptionLimits: { minChars: 20, maxChars: 3000 },
  requiredFields: ['title', 'price', 'description', 'images', 'category'],
  loginUrl: 'https://www.carousell.ph/login',
  markets: ['PH'],
  targetAudiences: ['local_buyers', 'young_professionals'],
  countries: ['PH', 'SG', 'MY'],
  listingFeeUsd: 0,
  refreshIntervalDays: 14,
  notes: 'Marketplace with property section. Property24 legacy. Playwright only.',
  websiteUrl: 'https://www.carousell.ph',
  submitUrl: 'https://www.carousell.ph/sell/property',
  signupUrl: 'https://www.carousell.ph/register',
};

// ============================================================
// Tier 2: International Luxury Portals
// ============================================================

const JAMESEDITION: PortalDefinition = {
  slug: 'jamesedition',
  name: 'JamesEdition',
  tier: 2,
  portalType: 'property_portal',
  integrationMethod: 'api_feed',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price_usd',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'living_area_sqm',
    lot_area_sqm: 'lot_area_sqm',
    descriptions: 'description',
    image_urls: 'images',
    address: 'location',
    amenities: 'amenities',
    features: 'features',
  },
  imageSpecs: { maxImages: 50, minWidth: 1200, format: 'jpg,png' },
  descriptionLimits: { minChars: 200, maxChars: 10000 },
  requiredFields: ['title', 'price_usd', 'description', 'images', 'bedrooms', 'location', 'living_area_sqm'],
  apiBaseUrl: 'https://www.jamesedition.com/api/v1',
  apiKeyEnvVar: 'JAMESEDITION_API_KEY',
  markets: ['INTL', 'IL', 'EU'],
  targetAudiences: ['luxury_intl', 'hnwi', 'family_offices'],
  countries: ['US', 'GB', 'DE', 'FR', 'IL', 'AE', 'SG', 'HK', 'AU'],
  listingFeeUsd: 99,
  refreshIntervalDays: 60,
  notes: 'Premier luxury marketplace. 50+ countries. REST API for dealers. High-quality leads.',
  websiteUrl: 'https://www.jamesedition.com',
  dashboardUrl: 'https://www.jamesedition.com/dealers/dashboard',
  submitUrl: 'https://www.jamesedition.com/dealers/listings/new',
  signupUrl: 'https://www.jamesedition.com/dealers/signup',
};

const PROPERSTAR: PortalDefinition = {
  slug: 'properstar',
  name: 'Properstar',
  tier: 2,
  portalType: 'aggregator',
  integrationMethod: 'api_feed',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    bedrooms: 'rooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'surface',
    descriptions: 'description',
    image_urls: 'pictures',
    latitude: 'latitude',
    longitude: 'longitude',
    property_type: 'type',
  },
  imageSpecs: { maxImages: 30, minWidth: 800, format: 'jpg' },
  descriptionLimits: { minChars: 100, maxChars: 8000 },
  requiredFields: ['title', 'price', 'description', 'pictures', 'type', 'surface'],
  apiKeyEnvVar: 'PROPERSTAR_AGENCY_ID',
  feedUrl: undefined, // Set via PROPERSTAR_FEED_URL env var
  markets: ['INTL'],
  targetAudiences: ['global_investors', 'expats', 'retirement'],
  countries: ['US', 'GB', 'DE', 'FR', 'CH', 'AU', 'CA'],
  listingFeeUsd: 0,
  refreshIntervalDays: 30,
  notes: 'Global aggregator with millions of listings. XML/JSON feed format.',
  websiteUrl: 'https://www.properstar.com',
  dashboardUrl: 'https://www.properstar.com/agents/dashboard',
  signupUrl: 'https://www.properstar.com/agents/register',
};

const LISTGLOBALLY: PortalDefinition = {
  slug: 'listglobally',
  name: 'ListGlobally',
  tier: 2,
  portalType: 'aggregator',
  integrationMethod: 'api_feed',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floor_area_sqm: 'living_area',
    lot_area_sqm: 'plot_area',
    descriptions: 'description',
    image_urls: 'images',
    address: 'address',
    city: 'city',
    country: 'country',
    property_type: 'property_type',
  },
  imageSpecs: { maxImages: 25, minWidth: 800, format: 'jpg,png' },
  descriptionLimits: { minChars: 100, maxChars: 8000 },
  requiredFields: ['title', 'price', 'description', 'images', 'property_type', 'city', 'country'],
  apiBaseUrl: 'https://api.listglobally.com/v2',
  apiKeyEnvVar: 'LISTGLOBALLY_API_KEY',
  markets: ['INTL', 'PH'],
  targetAudiences: ['global_investors', 'expats', 'luxury_intl'],
  countries: ['US', 'GB', 'DE', 'FR', 'CH', 'AU', 'CA', 'SG', 'HK', 'AE', 'IL'],
  listingFeeUsd: 49,
  refreshIntervalDays: 30,
  notes: 'KEY MULTIPLIER: one integration syndicates to 100+ portals worldwide including Realtor.com and Realestate.com.au.',
  websiteUrl: 'https://www.listglobally.com',
  dashboardUrl: 'https://www.listglobally.com/dashboard',
  signupUrl: 'https://www.listglobally.com/signup',
};

const MANSION_GLOBAL: PortalDefinition = {
  slug: 'mansion-global',
  name: 'Mansion Global',
  tier: 2,
  portalType: 'property_portal',
  integrationMethod: 'manual',
  fieldMapping: {
    internal_name: 'headline',
    price_php_cents: 'asking_price',
    descriptions: 'description',
    image_urls: 'gallery',
    amenities: 'features',
  },
  imageSpecs: { maxImages: 30, minWidth: 1200, format: 'jpg' },
  descriptionLimits: { minChars: 300, maxChars: 5000 },
  requiredFields: ['headline', 'asking_price', 'description', 'gallery'],
  markets: ['INTL'],
  targetAudiences: ['hnwi', 'luxury_intl', 'family_offices'],
  countries: ['US', 'GB', 'AE', 'SG', 'HK'],
  listingFeeUsd: 200,
  refreshIntervalDays: 60,
  notes: 'Dow Jones luxury property content platform. Requires editorial submission. Generate listing and submit manually.',
  websiteUrl: 'https://www.mansionglobal.com',
  submitUrl: 'https://www.mansionglobal.com/listing',
};

const LUXURY_ESTATE: PortalDefinition = {
  slug: 'luxuryestate',
  name: 'LuxuryEstate',
  tier: 2,
  portalType: 'property_portal',
  integrationMethod: 'manual',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price_eur',
    descriptions: 'description',
    image_urls: 'photos',
    bedrooms: 'rooms',
    floor_area_sqm: 'area',
  },
  imageSpecs: { maxImages: 40, minWidth: 800, format: 'jpg,png' },
  descriptionLimits: { minChars: 100, maxChars: 6000 },
  requiredFields: ['title', 'price_eur', 'description', 'photos'],
  markets: ['INTL', 'EU'],
  targetAudiences: ['luxury_intl', 'european_investors'],
  countries: ['IT', 'FR', 'ES', 'PT', 'DE', 'GB', 'US'],
  listingFeeUsd: 50,
  refreshIntervalDays: 45,
  notes: 'European luxury portal. Manual initially, can negotiate feed access for agencies.',
  websiteUrl: 'https://www.luxuryestate.com',
  dashboardUrl: 'https://www.luxuryestate.com/agents',
  signupUrl: 'https://www.luxuryestate.com/agents/register',
};

const SOTHEBYS: PortalDefinition = {
  slug: 'sothebys-intl',
  name: "Sotheby's International Realty",
  tier: 2,
  portalType: 'property_portal',
  integrationMethod: 'manual',
  fieldMapping: {
    internal_name: 'property_name',
    price_php_cents: 'price',
    descriptions: 'marketing_remarks',
    image_urls: 'media',
  },
  imageSpecs: { maxImages: 50, minWidth: 1500, format: 'jpg' },
  descriptionLimits: { minChars: 200, maxChars: 10000 },
  requiredFields: ['property_name', 'price', 'marketing_remarks', 'media'],
  markets: ['INTL'],
  targetAudiences: ['hnwi', 'ultra_luxury'],
  countries: ['US', 'GB', 'FR', 'CH', 'HK', 'SG', 'AE'],
  listingFeeUsd: 0,
  refreshIntervalDays: 90,
  notes: 'Access via local partner agent only. Generate materials, partner submits.',
  websiteUrl: 'https://www.sothebysrealty.com',
};

const CHRISTIES: PortalDefinition = {
  slug: 'christies-intl',
  name: "Christie's International Real Estate",
  tier: 2,
  portalType: 'property_portal',
  integrationMethod: 'manual',
  fieldMapping: {
    internal_name: 'title',
    price_php_cents: 'price',
    descriptions: 'description',
    image_urls: 'images',
  },
  imageSpecs: { maxImages: 50, minWidth: 1500, format: 'jpg' },
  descriptionLimits: { minChars: 200, maxChars: 10000 },
  requiredFields: ['title', 'price', 'description', 'images'],
  markets: ['INTL'],
  targetAudiences: ['hnwi', 'ultra_luxury'],
  countries: ['US', 'GB', 'FR', 'CH', 'HK', 'SG', 'AE'],
  listingFeeUsd: 0,
  refreshIntervalDays: 90,
  notes: 'Access via local partner only. Generate materials, partner submits.',
  websiteUrl: 'https://www.christiesrealestate.com',
};

// ============================================================
// Tier 3-8: Channel portals (social, ads, video, partnership)
// ============================================================

const LINKEDIN: PortalDefinition = {
  slug: 'linkedin',
  name: 'LinkedIn',
  tier: 4,
  portalType: 'social',
  integrationMethod: 'connector',
  fieldMapping: {
    internal_name: 'post_title',
    descriptions: 'post_body',
    image_urls: 'media',
  },
  imageSpecs: { maxImages: 9, minWidth: 1200, format: 'jpg,png' },
  descriptionLimits: { minChars: 50, maxChars: 3000 },
  requiredFields: ['post_body'],
  apiBaseUrl: 'https://api.linkedin.com/v2',
  apiKeyEnvVar: 'LINKEDIN_ACCESS_TOKEN',
  markets: ['INTL', 'PH', 'IL'],
  targetAudiences: ['ceos', 'business_owners', 'doctors', 'lawyers', 'investors', 'expats', 'hospitality_investors', 'family_offices'],
  countries: ['US', 'GB', 'SG', 'HK', 'AE', 'PH', 'IL', 'AU', 'CA'],
  listingFeeUsd: 0,
  refreshIntervalDays: 7,
  notes: 'Professional network. Organic posts + InMail + Ads. Rate-limited on messaging.',
  websiteUrl: 'https://www.linkedin.com',
  dashboardUrl: 'https://www.linkedin.com/feed/',
};

const GOOGLE_SEARCH_ADS: PortalDefinition = {
  slug: 'google-search-ads',
  name: 'Google Search Ads',
  tier: 5,
  portalType: 'ads',
  integrationMethod: 'connector',
  fieldMapping: {
    internal_name: 'headline',
    descriptions: 'description_lines',
    image_urls: 'image_assets',
  },
  imageSpecs: { maxImages: 5, minWidth: 600, format: 'jpg,png' },
  descriptionLimits: { minChars: 30, maxChars: 90 },
  requiredFields: ['headline', 'description_lines'],
  apiKeyEnvVar: 'GOOGLE_ADS_DEVELOPER_TOKEN',
  markets: ['INTL', 'PH'],
  targetAudiences: ['active_searchers', 'foreign_investors', 'ofw'],
  countries: ['PH', 'US', 'AU', 'CA', 'GB', 'SG', 'AE', 'HK', 'JP', 'QA', 'SA'],
  listingFeeUsd: 0,
  refreshIntervalDays: 7,
  notes: 'Captures high-intent searchers. Keywords: luxury villa Bohol, Panglao villa for sale, etc.',
  websiteUrl: 'https://ads.google.com',
  dashboardUrl: 'https://ads.google.com/aw/overview',
};

const YOUTUBE: PortalDefinition = {
  slug: 'youtube',
  name: 'YouTube',
  tier: 6,
  portalType: 'video',
  integrationMethod: 'connector',
  fieldMapping: {
    internal_name: 'title',
    descriptions: 'description',
    video_urls: 'video_file',
    seo_keywords: 'tags',
  },
  imageSpecs: { maxImages: 1, minWidth: 1280, format: 'jpg' },
  descriptionLimits: { minChars: 100, maxChars: 5000 },
  requiredFields: ['title', 'description', 'video_file'],
  apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
  apiKeyEnvVar: 'YOUTUBE_REFRESH_TOKEN',
  markets: ['INTL', 'PH'],
  targetAudiences: ['foreign_investors', 'ofw', 'luxury_intl'],
  countries: ['US', 'AU', 'CA', 'GB', 'SG', 'AE', 'HK', 'PH', 'IL'],
  listingFeeUsd: 0,
  refreshIntervalDays: 0,
  notes: 'Great for foreign buyers researching. Video content management and analytics.',
  websiteUrl: 'https://www.youtube.com',
  dashboardUrl: 'https://studio.youtube.com',
};

// ============================================================
// Export all portal definitions
// ============================================================

export const PORTAL_REGISTRY: PortalDefinition[] = [
  // Tier 1: Philippine Local
  LAMUDI_PH,
  DOT_PROPERTY_PH,
  FAZWAZ_PH,
  REAL_PH,
  CAROUSELL_PROPERTY,
  // Tier 2: International Luxury
  JAMESEDITION,
  PROPERSTAR,
  LISTGLOBALLY,
  MANSION_GLOBAL,
  LUXURY_ESTATE,
  SOTHEBYS,
  CHRISTIES,
  // Tier 3-8: Channels
  LINKEDIN,
  GOOGLE_SEARCH_ADS,
  YOUTUBE,
];

/**
 * Look up a portal definition by slug.
 */
export function getPortalDefinition(slug: string): PortalDefinition | undefined {
  return PORTAL_REGISTRY.find((p) => p.slug === slug);
}

/**
 * Get portal definitions filtered by tier.
 */
export function getPortalsByTier(tier: number): PortalDefinition[] {
  return PORTAL_REGISTRY.filter((p) => p.tier === tier);
}

/**
 * Get portal definitions filtered by integration method.
 */
export function getPortalsByMethod(method: PortalDefinition['integrationMethod']): PortalDefinition[] {
  return PORTAL_REGISTRY.filter((p) => p.integrationMethod === method);
}

/**
 * Get portal definitions filtered by market.
 */
export function getPortalsByMarket(market: string): PortalDefinition[] {
  return PORTAL_REGISTRY.filter((p) => p.markets.includes(market));
}
