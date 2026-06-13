// src/lib/marketing/portal-analyzer.ts
// Analyzes property data against portal requirements and recommends distribution.
// Analogous to fb-autoposter's group-analyzer.js but for property portals.

import { PORTAL_REGISTRY, type PortalDefinition } from '@/lib/data/portal-registry';

export interface PortalFit {
  portal: PortalDefinition;
  score: number;
  reasons: string[];
  warnings: string[];
  missingFields: string[];
}

export interface PropertyData {
  internal_name: string;
  slug: string;
  property_type: string;
  price_php_cents: number;
  bedrooms?: number;
  bathrooms?: number;
  floor_area_sqm?: number;
  lot_area_sqm?: number;
  city?: string;
  province?: string;
  country?: string;
  descriptions: Record<string, string>;
  image_urls: string[];
  video_urls?: string[];
  amenities?: string[];
  features?: Record<string, unknown>;
  monthly_income_php?: number;
  annual_roi_pct?: number;
}

/**
 * Analyze how well a property fits each portal's requirements.
 * Returns scored results sorted by best fit.
 */
export function analyzePropertyPortalFit(property: PropertyData): PortalFit[] {
  return PORTAL_REGISTRY.map((portal) => scorePropertyForPortal(property, portal))
    .sort((a, b) => b.score - a.score);
}

/**
 * Score a property's fit for a specific portal.
 */
function scorePropertyForPortal(property: PropertyData, portal: PortalDefinition): PortalFit {
  let score = 50; // Base score
  const reasons: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Check required fields
  for (const field of portal.requiredFields) {
    const ourField = Object.entries(portal.fieldMapping).find(([, v]) => v === field)?.[0];
    if (ourField) {
      const value = (property as unknown as Record<string, unknown>)[ourField];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
        score -= 10;
      }
    }
  }

  // Image check
  const imageCount = property.image_urls?.length ?? 0;
  if (imageCount === 0) {
    warnings.push('No images available');
    score -= 20;
  } else if (imageCount >= portal.imageSpecs.maxImages) {
    reasons.push(`Full image gallery available (${imageCount} images)`);
    score += 10;
  } else if (imageCount >= 5) {
    reasons.push(`Good image selection (${imageCount} images)`);
    score += 5;
  }

  // Description check
  const description = property.descriptions?.en ?? '';
  if (description.length < portal.descriptionLimits.minChars) {
    warnings.push(`Description too short (${description.length} chars, need ${portal.descriptionLimits.minChars})`);
    score -= 10;
  } else if (description.length <= portal.descriptionLimits.maxChars) {
    reasons.push('Description length fits portal requirements');
    score += 5;
  }

  // Price relevance
  const priceUsd = property.price_php_cents / (58 * 100); // rough PHP/USD
  if (portal.tier === 2 && priceUsd >= 300000) {
    reasons.push('Price point fits luxury portal threshold');
    score += 15;
  } else if (portal.tier === 2 && priceUsd < 300000) {
    warnings.push('Price may be below luxury portal typical range');
    score -= 5;
  }

  // Market match
  const isPhProperty = (property.country ?? 'Philippines') === 'Philippines';
  if (isPhProperty && portal.markets.includes('PH')) {
    reasons.push('Philippine property matches portal PH market');
    score += 10;
  }
  if (portal.markets.includes('INTL')) {
    reasons.push('Portal has international reach');
    score += 5;
  }

  // Integration method bonus (easier = higher score for initial rollout)
  if (portal.integrationMethod === 'api_feed') {
    reasons.push('API/Feed integration - automated submission');
    score += 10;
  } else if (portal.integrationMethod === 'connector') {
    reasons.push('Connector integration available');
    score += 5;
  }

  // Investment data bonus for investor-focused portals
  if (property.monthly_income_php && property.annual_roi_pct) {
    if (portal.targetAudiences.some((a) => a.includes('investor') || a === 'ofw')) {
      reasons.push('Investment data available - strong for investor portals');
      score += 10;
    }
  }

  // Aggregator multiplier
  if (portal.slug === 'listglobally') {
    reasons.push('ListGlobally multiplier: syndicates to 100+ portals');
    score += 15;
  }

  // No missing fields bonus
  if (missingFields.length === 0) {
    reasons.push('All required fields available');
    score += 10;
  }

  return { portal, score: Math.max(0, Math.min(100, score)), reasons, warnings, missingFields };
}

/**
 * Generate a distribution plan: which portals to submit to, in what order.
 */
export function generateDistributionPlan(
  property: PropertyData,
  options?: { maxPortals?: number; tiersOnly?: number[] }
): PortalFit[] {
  let fits = analyzePropertyPortalFit(property);

  if (options?.tiersOnly?.length) {
    fits = fits.filter((f) => options.tiersOnly!.includes(f.portal.tier));
  }

  // Filter out portals with too many missing fields
  fits = fits.filter((f) => f.missingFields.length <= 2);

  if (options?.maxPortals) {
    fits = fits.slice(0, options.maxPortals);
  }

  return fits;
}

/**
 * Convert price from PHP cents to other currencies.
 */
export function convertPrice(phpCents: number): Record<string, string> {
  const php = phpCents / 100;
  return {
    PHP: php.toLocaleString('en-PH', { maximumFractionDigits: 0 }),
    USD: `~${Math.round(php / 58).toLocaleString('en-US')}`,
    ILS: Math.round(php / 21.2).toLocaleString('he-IL'),
    EUR: `~${Math.round(php / 62).toLocaleString('de-DE')}`,
    AUD: `~${Math.round(php / 37).toLocaleString('en-AU')}`,
    SGD: `~${Math.round(php / 43).toLocaleString('en-SG')}`,
    AED: `~${Math.round(php / 15.8).toLocaleString('ar-AE')}`,
  };
}
