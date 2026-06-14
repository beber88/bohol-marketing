// POST: Run Portal Distribution OS setup - create tables, seed properties and portals
// This endpoint runs the migration and seeds in one shot.
// Safe to run multiple times (uses IF NOT EXISTS and upserts).

import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { PORTAL_REGISTRY } from '@/lib/data/portal-registry';
import { SITE_CONFIG } from '@/lib/config';

// Villa data from the project knowledge base
const VILLA_PROPERTIES = [
  {
    internal_name: 'Villa C - Panglao Prime Villas',
    slug: 'villa-c-panglao',
    property_type: 'villa',
    status: 'for_sale',
    bedrooms: 4,
    bathrooms: 4,
    floor_area_sqm: 263.78,
    stories: 3,
    address: 'Bingag, Panglao',
    city: 'Panglao',
    province: 'Bohol',
    country: 'Philippines',
    latitude: 9.5581,
    longitude: 123.7634,
    price_php_cents: 3500000000, // PHP 35,000,000
    price_display: {
      PHP: '35,000,000',
      USD: '~600,000',
      ILS: '1,650,000',
      EUR: '~565,000',
      AUD: '~945,000',
      SGD: '~815,000',
    },
    image_urls: [
      '/images/exterior/hero-aerial.webp',
      '/images/exterior/panglao-rear.webp',
      '/images/exterior/front-1.jpg',
      '/images/exterior/front-2.jpg',
      '/images/exterior/rear-1.jpg',
      '/images/exterior/rear-2.jpg',
    ],
    video_urls: [],
    descriptions: {
      en: 'Luxury 4-bedroom investment villa in Panglao, Bohol. Located between JW Marriott and Mithi Resort, just 60 seconds walk to Panglao Beach. 263.78 sqm across 3 stories with private pool and rooftop jacuzzi. Verified Airbnb monthly income of PHP 395,000 with 17-25% annual ROI at 65% occupancy. Only 2 villas remaining, with 4 new villas coming soon. BDO Bank financing available for qualified Filipino buyers. Three legal ownership solutions for foreign investors: Deed of Assignment, Leasehold 25+25, and Domestic Corporation. Contact Blue Everest Asset Group: WhatsApp +639542555553 (Marketing) / +639958565865 (Office).',
      he: 'וילת יוקרה להשקעה עם 4 חדרי שינה בפנגלאו, בוהול. בין JW Marriott ל-Mithi Resort, 60 שניות הליכה לחוף פנגלאו. 263.78 מ"ר ב-3 קומות עם בריכה פרטית וג\'קוזי על הגג. הכנסה חודשית מאומתת של 1,535,000 ש"ח ותשואה שנתית של 17-25%. רק 2 וילות נותרו. 3 פתרונות בעלות חוקיים: Deed of Assignment, חכירה 25+25, תאגיד מקומי. WhatsApp: +639542555553 / +639958565865.',
      tl: 'Luxury 4-bedroom investment villa sa Panglao, Bohol. Malapit sa JW Marriott at Mithi Resort, 60 segundo lang sa Panglao Beach. 263.78 sqm na may 3 palapag, private pool at rooftop jacuzzi. PHP 395,000 buwanang kita sa Airbnb. BDO Bank financing available. WhatsApp: +639542555553 / +639958565865.',
    },
    amenities: ['private_pool', 'rooftop_jacuzzi', 'parking', 'garden', 'security', 'beach_access'],
    features: {
      pool: true,
      rooftop_jacuzzi: true,
      beach_walk_seconds: 60,
      near_jw_marriott: true,
      near_mithi_resort: true,
      airport_minutes: 15,
    },
    monthly_income_php: 395000,
    annual_roi_pct: 21,
    occupancy_pct: 65,
    seo_title: 'Luxury Villa for Sale in Panglao Bohol - PHP 35M - Blue Everest',
    seo_description: 'Premium 4-bedroom investment villa between JW Marriott and Mithi Resort. 263.78 sqm, private pool, rooftop jacuzzi. PHP 395,000 monthly Airbnb income. 17-25% ROI.',
    seo_keywords: ['panglao villa', 'bohol investment', 'luxury villa philippines', 'panglao property', 'bohol real estate'],
  },
  {
    internal_name: 'Villa D - Panglao Prime Villas',
    slug: 'villa-d-panglao',
    property_type: 'villa',
    status: 'for_sale',
    bedrooms: 4,
    bathrooms: 4,
    floor_area_sqm: 263.78,
    stories: 3,
    address: 'Bingag, Panglao',
    city: 'Panglao',
    province: 'Bohol',
    country: 'Philippines',
    latitude: 9.5581,
    longitude: 123.7634,
    price_php_cents: 3250000000, // PHP 32,500,000
    price_display: {
      PHP: '32,500,000',
      USD: '~560,000',
      ILS: '1,535,000',
      EUR: '~525,000',
      AUD: '~880,000',
      SGD: '~755,000',
    },
    image_urls: [
      '/images/exterior/panglao-rear.webp',
      '/images/exterior/hero-aerial.webp',
      '/images/exterior/front-3.jpg',
      '/images/exterior/front-4.jpg',
      '/images/exterior/rear-3.jpg',
      '/images/exterior/rear-4.jpg',
    ],
    video_urls: [],
    descriptions: {
      en: 'Luxury 4-bedroom investment villa in Panglao, Bohol. Located between JW Marriott and Mithi Resort, just 60 seconds walk to Panglao Beach. 263.78 sqm across 3 stories with private pool and rooftop jacuzzi. Verified Airbnb monthly income of PHP 395,000 with 17-25% annual ROI at 65% occupancy. Only 2 villas remaining, with 4 new villas coming soon. BDO Bank financing available for qualified Filipino buyers. Three legal ownership solutions for foreign investors: Deed of Assignment, Leasehold 25+25, and Domestic Corporation. Contact Blue Everest Asset Group: WhatsApp +639542555553 (Marketing) / +639958565865 (Office).',
      he: 'וילת יוקרה להשקעה עם 4 חדרי שינה בפנגלאו, בוהול. בין JW Marriott ל-Mithi Resort, 60 שניות הליכה לחוף פנגלאו. 263.78 מ"ר ב-3 קומות עם בריכה פרטית וג\'קוזי על הגג. הכנסה חודשית מאומתת של 1,535,000 ש"ח ותשואה שנתית של 17-25%. רק 2 וילות נותרו. 3 פתרונות בעלות חוקיים: Deed of Assignment, חכירה 25+25, תאגיד מקומי. WhatsApp: +639542555553 / +639958565865.',
      tl: 'Luxury 4-bedroom investment villa sa Panglao, Bohol. Malapit sa JW Marriott at Mithi Resort, 60 segundo lang sa Panglao Beach. 263.78 sqm na may 3 palapag, private pool at rooftop jacuzzi. PHP 395,000 buwanang kita sa Airbnb. BDO Bank financing available. WhatsApp: +639542555553 / +639958565865.',
    },
    amenities: ['private_pool', 'rooftop_jacuzzi', 'parking', 'garden', 'security', 'beach_access'],
    features: {
      pool: true,
      rooftop_jacuzzi: true,
      beach_walk_seconds: 60,
      near_jw_marriott: true,
      near_mithi_resort: true,
      airport_minutes: 15,
    },
    monthly_income_php: 395000,
    annual_roi_pct: 21,
    occupancy_pct: 65,
    seo_title: 'Luxury Villa for Sale in Panglao Bohol - PHP 32.5M - Blue Everest',
    seo_description: 'Premium 4-bedroom investment villa between JW Marriott and Mithi Resort. 263.78 sqm, private pool, rooftop jacuzzi. PHP 395,000 monthly Airbnb income. 17-25% ROI.',
    seo_keywords: ['panglao villa', 'bohol investment', 'luxury villa philippines', 'panglao property', 'bohol real estate'],
  },
];

export async function POST() {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const results: Record<string, unknown> = {};

  // ── Step 1: Create tables via raw SQL ──
  try {
    const migrationSQL = `
      -- Properties
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID,
        internal_name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        property_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'for_sale',
        bedrooms INT, bathrooms INT,
        floor_area_sqm NUMERIC(10,2), lot_area_sqm NUMERIC(10,2), stories INT,
        address TEXT, city TEXT, province TEXT, country TEXT DEFAULT 'Philippines',
        latitude NUMERIC(10,7), longitude NUMERIC(10,7),
        price_php_cents BIGINT NOT NULL,
        price_display JSONB NOT NULL DEFAULT '{}',
        image_urls TEXT[] DEFAULT '{}', video_urls TEXT[] DEFAULT '{}',
        virtual_tour_url TEXT, floor_plan_url TEXT,
        descriptions JSONB NOT NULL DEFAULT '{}',
        amenities TEXT[] DEFAULT '{}', features JSONB NOT NULL DEFAULT '{}',
        monthly_income_php INT, annual_roi_pct NUMERIC(5,2), occupancy_pct NUMERIC(5,2),
        seo_title TEXT, seo_description TEXT, seo_keywords TEXT[] DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Portals
      CREATE TABLE IF NOT EXISTS portals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
        tier INT NOT NULL, portal_type TEXT NOT NULL, integration_method TEXT NOT NULL,
        field_mapping JSONB NOT NULL DEFAULT '{}', image_specs JSONB NOT NULL DEFAULT '{}',
        description_limits JSONB NOT NULL DEFAULT '{}', required_fields TEXT[] DEFAULT '{}',
        api_base_url TEXT, api_key_env_var TEXT, feed_url TEXT, login_url TEXT,
        markets TEXT[] DEFAULT '{}', target_audiences TEXT[] DEFAULT '{}', countries TEXT[] DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true, listing_fee_usd NUMERIC(10,2) DEFAULT 0,
        refresh_interval_days INT DEFAULT 30, notes TEXT,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Portal listings
      CREATE TABLE IF NOT EXISTS portal_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
        adapted_title TEXT, adapted_description TEXT,
        adapted_images TEXT[] DEFAULT '{}', adapted_fields JSONB NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'draft',
        external_listing_id TEXT, external_url TEXT,
        submitted_at TIMESTAMPTZ, published_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ, last_refreshed_at TIMESTAMPTZ,
        views INT NOT NULL DEFAULT 0, inquiries INT NOT NULL DEFAULT 0, leads_generated INT NOT NULL DEFAULT 0,
        brand_guard_result JSONB, brand_guard_passed BOOLEAN,
        last_error TEXT, retry_count INT NOT NULL DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(property_id, portal_id)
      );

      -- Partners
      CREATE TABLE IF NOT EXISTS partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        partner_type TEXT NOT NULL, name TEXT NOT NULL,
        contact_name TEXT, email TEXT, phone TEXT, whatsapp TEXT,
        location TEXT, country TEXT,
        agreement_type TEXT, commission_pct NUMERIC(5,2), fixed_fee_usd NUMERIC(10,2),
        agreement_status TEXT DEFAULT 'prospect', agreement_doc_url TEXT,
        qr_code_id TEXT UNIQUE, brochure_variant TEXT,
        total_referrals INT NOT NULL DEFAULT 0, total_conversions INT NOT NULL DEFAULT 0,
        total_commission_paid_usd NUMERIC(10,2) DEFAULT 0,
        notes TEXT, metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Partner referrals
      CREATE TABLE IF NOT EXISTS partner_referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
        lead_id UUID,
        referral_source TEXT, qr_scan_url TEXT,
        status TEXT DEFAULT 'new',
        commission_due_usd NUMERIC(10,2), commission_paid BOOLEAN DEFAULT false,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Distribution logs
      CREATE TABLE IF NOT EXISTS portal_distribution_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        portal_listing_id UUID, portal_id UUID,
        action TEXT NOT NULL, status TEXT NOT NULL,
        error_message TEXT, duration_ms INT,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Add columns to leads if they don't exist
      DO $$ BEGIN
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS portal_listing_id UUID;
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS partner_id UUID;
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS portal_source TEXT;
      EXCEPTION WHEN undefined_table THEN NULL;
      END $$;

      -- Enable RLS
      ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
      ALTER TABLE portals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE portal_listings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
      ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE portal_distribution_logs ENABLE ROW LEVEL SECURITY;

      -- Policies (drop if exist then create)
      DROP POLICY IF EXISTS "full_access_properties" ON properties;
      CREATE POLICY "full_access_properties" ON properties FOR ALL USING (true);
      DROP POLICY IF EXISTS "full_access_portals" ON portals;
      CREATE POLICY "full_access_portals" ON portals FOR ALL USING (true);
      DROP POLICY IF EXISTS "full_access_portal_listings" ON portal_listings;
      CREATE POLICY "full_access_portal_listings" ON portal_listings FOR ALL USING (true);
      DROP POLICY IF EXISTS "full_access_partners" ON partners;
      CREATE POLICY "full_access_partners" ON partners FOR ALL USING (true);
      DROP POLICY IF EXISTS "full_access_partner_referrals" ON partner_referrals;
      CREATE POLICY "full_access_partner_referrals" ON partner_referrals FOR ALL USING (true);
      DROP POLICY IF EXISTS "full_access_portal_distribution_logs" ON portal_distribution_logs;
      CREATE POLICY "full_access_portal_distribution_logs" ON portal_distribution_logs FOR ALL USING (true);
    `;

    // Run migration via Supabase rpc if available, or table-by-table check
    const { error: migError } = await supabase.rpc('exec_sql', { query: migrationSQL });
    if (migError) {
      // exec_sql may not exist. Try checking if tables already exist
      const { data: tableCheck } = await supabase.from('properties').select('id').limit(1);
      if (tableCheck === null) {
        results.migration = { status: 'needs_manual_run', note: 'Run the SQL in supabase/migrations/20260614_portal_distribution.sql via Supabase Dashboard > SQL Editor' };
      } else {
        results.migration = { status: 'tables_exist' };
      }
    } else {
      results.migration = { status: 'success' };
    }
  } catch {
    // Tables might already exist - check
    const { data } = await supabase.from('properties').select('id').limit(1);
    results.migration = data !== null ? { status: 'tables_exist' } : { status: 'needs_manual_run' };
  }

  // ── Step 2: Seed properties ──
  try {
    for (const villa of VILLA_PROPERTIES) {
      const { error } = await supabase
        .from('properties')
        .upsert(villa, { onConflict: 'slug' });

      if (error) {
        results[`property_${villa.slug}`] = { error: error.message };
      } else {
        results[`property_${villa.slug}`] = { status: 'seeded' };
      }
    }
  } catch (err) {
    results.properties = { error: err instanceof Error ? err.message : 'Failed' };
  }

  // ── Step 3: Seed portals ──
  try {
    let portalCount = 0;
    for (const p of PORTAL_REGISTRY) {
      const { error } = await supabase.from('portals').upsert({
        name: p.name,
        slug: p.slug,
        tier: p.tier,
        portal_type: p.portalType,
        integration_method: p.integrationMethod,
        field_mapping: p.fieldMapping,
        image_specs: p.imageSpecs,
        description_limits: p.descriptionLimits,
        required_fields: p.requiredFields,
        api_base_url: p.apiBaseUrl ?? null,
        api_key_env_var: p.apiKeyEnvVar ?? null,
        feed_url: p.feedUrl ?? null,
        login_url: p.loginUrl ?? null,
        markets: p.markets,
        target_audiences: p.targetAudiences,
        countries: p.countries,
        is_active: true,
        listing_fee_usd: p.listingFeeUsd,
        refresh_interval_days: p.refreshIntervalDays,
        notes: p.notes ?? null,
      }, { onConflict: 'slug' });

      if (!error) portalCount++;
    }
    results.portals = { seeded: portalCount, total: PORTAL_REGISTRY.length };
  } catch (err) {
    results.portals = { error: err instanceof Error ? err.message : 'Failed' };
  }

  // ── Step 4: Check available API keys ──
  const apiStatus: Record<string, boolean> = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    LAMUDI_API_KEY: !!process.env.LAMUDI_API_KEY,
    LAMUDI_FEED_URL: !!process.env.LAMUDI_FEED_URL,
    LISTGLOBALLY_API_KEY: !!process.env.LISTGLOBALLY_API_KEY,
    JAMESEDITION_API_KEY: !!process.env.JAMESEDITION_API_KEY,
    PROPERSTAR_FEED_URL: !!process.env.PROPERSTAR_FEED_URL,
    LINKEDIN_ACCESS_TOKEN: !!process.env.LINKEDIN_ACCESS_TOKEN,
    YOUTUBE_ACCESS_TOKEN: !!process.env.YOUTUBE_ACCESS_TOKEN,
    META_PAGE_ACCESS_TOKEN: !!process.env.META_PAGE_ACCESS_TOKEN,
    WHATSAPP_ACCESS_TOKEN: !!process.env.WHATSAPP_ACCESS_TOKEN,
  };
  results.apiKeys = apiStatus;

  // ── Step 5: Verify data ──
  try {
    const [propCount, portalCount] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase.from('portals').select('id', { count: 'exact', head: true }),
    ]);
    results.verification = {
      properties_in_db: propCount.count ?? 0,
      portals_in_db: portalCount.count ?? 0,
    };
  } catch {
    results.verification = { error: 'Could not verify' };
  }

  return Response.json({
    status: 'setup_complete',
    timestamp: new Date().toISOString(),
    results,
  });
}
