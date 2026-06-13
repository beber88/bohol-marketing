-- Migration: Portal Distribution OS
-- Date: 2026-06-14
-- Purpose: Add properties, portals, portal_listings, partners, partner_referrals,
--          and portal_distribution_logs tables for the Portal Distribution OS.

-- ============================================================
-- 1. Properties table (centralized property data - source of truth)
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID REFERENCES projects(id) ON DELETE CASCADE,
  internal_name     TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  property_type     TEXT NOT NULL CHECK (property_type IN ('villa', 'condo', 'lot', 'resort', 'commercial')),
  status            TEXT NOT NULL DEFAULT 'for_sale' CHECK (status IN ('for_sale', 'reserved', 'sold', 'coming_soon')),
  -- Specs
  bedrooms          INT,
  bathrooms         INT,
  floor_area_sqm    NUMERIC(10,2),
  lot_area_sqm      NUMERIC(10,2),
  stories           INT,
  -- Location
  address           TEXT,
  city              TEXT,
  province          TEXT,
  country           TEXT DEFAULT 'Philippines',
  latitude          NUMERIC(10,7),
  longitude         NUMERIC(10,7),
  -- Pricing
  price_php_cents   BIGINT NOT NULL,
  price_display     JSONB NOT NULL DEFAULT '{}',
  -- Media
  image_urls        TEXT[] DEFAULT '{}',
  video_urls        TEXT[] DEFAULT '{}',
  virtual_tour_url  TEXT,
  floor_plan_url    TEXT,
  -- Descriptions per language
  descriptions      JSONB NOT NULL DEFAULT '{}',
  -- Features
  amenities         TEXT[] DEFAULT '{}',
  features          JSONB NOT NULL DEFAULT '{}',
  -- Investment data
  monthly_income_php INT,
  annual_roi_pct    NUMERIC(5,2),
  occupancy_pct     NUMERIC(5,2),
  -- SEO
  seo_title         TEXT,
  seo_description   TEXT,
  seo_keywords      TEXT[] DEFAULT '{}',
  -- Meta
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Portals table (portal registry)
-- ============================================================
CREATE TABLE IF NOT EXISTS portals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  tier              INT NOT NULL CHECK (tier BETWEEN 1 AND 8),
  portal_type       TEXT NOT NULL CHECK (portal_type IN (
    'property_portal', 'aggregator', 'social', 'ads', 'video', 'partnership', 'community'
  )),
  integration_method TEXT NOT NULL CHECK (integration_method IN (
    'api_feed', 'playwright', 'manual', 'connector'
  )),
  -- Portal specs
  field_mapping     JSONB NOT NULL DEFAULT '{}',
  image_specs       JSONB NOT NULL DEFAULT '{}',
  description_limits JSONB NOT NULL DEFAULT '{}',
  required_fields   TEXT[] DEFAULT '{}',
  -- Connection
  api_base_url      TEXT,
  api_key_env_var   TEXT,
  feed_url          TEXT,
  login_url         TEXT,
  -- Targeting
  markets           TEXT[] DEFAULT '{}',
  target_audiences  TEXT[] DEFAULT '{}',
  countries         TEXT[] DEFAULT '{}',
  -- Status
  is_active         BOOLEAN NOT NULL DEFAULT true,
  listing_fee_usd   NUMERIC(10,2) DEFAULT 0,
  refresh_interval_days INT DEFAULT 30,
  notes             TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. Portal listings table (property x portal adapted content)
-- ============================================================
CREATE TABLE IF NOT EXISTS portal_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portal_id         UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  -- Adapted content
  adapted_title     TEXT,
  adapted_description TEXT,
  adapted_images    TEXT[] DEFAULT '{}',
  adapted_fields    JSONB NOT NULL DEFAULT '{}',
  -- Status tracking
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'brand_guard_passed', 'submitting', 'active',
    'expired', 'rejected', 'paused', 'error', 'manual_needed'
  )),
  external_listing_id TEXT,
  external_url      TEXT,
  -- Timestamps
  submitted_at      TIMESTAMPTZ,
  published_at      TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  -- Performance
  views             INT NOT NULL DEFAULT 0,
  inquiries         INT NOT NULL DEFAULT 0,
  leads_generated   INT NOT NULL DEFAULT 0,
  -- Brand guard
  brand_guard_result JSONB,
  brand_guard_passed BOOLEAN,
  -- Error tracking
  last_error        TEXT,
  retry_count       INT NOT NULL DEFAULT 0,
  -- Meta
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, portal_id)
);

-- ============================================================
-- 4. Partners table (referral partner network)
-- ============================================================
CREATE TABLE IF NOT EXISTS partners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type      TEXT NOT NULL CHECK (partner_type IN (
    'hotel', 'resort', 'dive_shop', 'transport', 'concierge',
    'lawyer', 'accountant', 'wealth_advisor', 'immigration_consultant',
    'property_management', 'broker', 'referral_individual', 'remittance_center',
    'business_association', 'ofw_community'
  )),
  name              TEXT NOT NULL,
  contact_name      TEXT,
  email             TEXT,
  phone             TEXT,
  whatsapp          TEXT,
  location          TEXT,
  country           TEXT,
  -- Partnership details
  agreement_type    TEXT CHECK (agreement_type IN (
    'referral_fee', 'commission', 'barter', 'formal_agreement', 'informal'
  )),
  commission_pct    NUMERIC(5,2),
  fixed_fee_usd     NUMERIC(10,2),
  agreement_status  TEXT DEFAULT 'prospect' CHECK (agreement_status IN (
    'prospect', 'contacted', 'negotiating', 'active', 'paused', 'terminated'
  )),
  agreement_doc_url TEXT,
  -- Tracking
  qr_code_id        TEXT UNIQUE,
  brochure_variant  TEXT,
  total_referrals   INT NOT NULL DEFAULT 0,
  total_conversions INT NOT NULL DEFAULT 0,
  total_commission_paid_usd NUMERIC(10,2) DEFAULT 0,
  -- Notes
  notes             TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. Partner referrals table
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_referrals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id        UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  lead_id           UUID REFERENCES leads(id) ON DELETE SET NULL,
  referral_source   TEXT,
  qr_scan_url       TEXT,
  status            TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'converted', 'lost'
  )),
  commission_due_usd NUMERIC(10,2),
  commission_paid   BOOLEAN DEFAULT false,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. Portal distribution logs (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS portal_distribution_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_listing_id UUID REFERENCES portal_listings(id) ON DELETE SET NULL,
  portal_id         UUID REFERENCES portals(id) ON DELETE SET NULL,
  action            TEXT NOT NULL,
  status            TEXT NOT NULL,
  error_message     TEXT,
  duration_ms       INT,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. Modifications to existing leads table
-- ============================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS portal_listing_id UUID REFERENCES portal_listings(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS portal_source TEXT;

-- ============================================================
-- 8. Indexes
-- ============================================================
CREATE INDEX idx_properties_project ON properties(project_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_slug ON properties(slug);

CREATE INDEX idx_portals_tier ON portals(tier);
CREATE INDEX idx_portals_slug ON portals(slug);
CREATE INDEX idx_portals_active ON portals(is_active);
CREATE INDEX idx_portals_type ON portals(portal_type);

CREATE INDEX idx_portal_listings_property ON portal_listings(property_id);
CREATE INDEX idx_portal_listings_portal ON portal_listings(portal_id);
CREATE INDEX idx_portal_listings_status ON portal_listings(status);
CREATE INDEX idx_portal_listings_expires ON portal_listings(expires_at);

CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_status ON partners(agreement_status);
CREATE INDEX idx_partners_country ON partners(country);

CREATE INDEX idx_partner_referrals_partner ON partner_referrals(partner_id);
CREATE INDEX idx_partner_referrals_lead ON partner_referrals(lead_id);
CREATE INDEX idx_partner_referrals_status ON partner_referrals(status);

CREATE INDEX idx_portal_dist_logs_listing ON portal_distribution_logs(portal_listing_id);
CREATE INDEX idx_portal_dist_logs_portal ON portal_distribution_logs(portal_id);
CREATE INDEX idx_portal_dist_logs_created ON portal_distribution_logs(created_at DESC);

CREATE INDEX idx_leads_portal_source ON leads(portal_source);
CREATE INDEX idx_leads_partner ON leads(partner_id);

-- ============================================================
-- 9. RLS policies
-- ============================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_distribution_logs ENABLE ROW LEVEL SECURITY;

-- Full access policies (tighten to role-based later)
CREATE POLICY "full_access_properties" ON properties FOR ALL USING (true);
CREATE POLICY "full_access_portals" ON portals FOR ALL USING (true);
CREATE POLICY "full_access_portal_listings" ON portal_listings FOR ALL USING (true);
CREATE POLICY "full_access_partners" ON partners FOR ALL USING (true);
CREATE POLICY "full_access_partner_referrals" ON partner_referrals FOR ALL USING (true);
CREATE POLICY "full_access_portal_distribution_logs" ON portal_distribution_logs FOR ALL USING (true);

-- ============================================================
-- 10. Updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_portal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_properties_updated_at
  BEFORE UPDATE ON properties FOR EACH ROW
  EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER trigger_portals_updated_at
  BEFORE UPDATE ON portals FOR EACH ROW
  EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER trigger_portal_listings_updated_at
  BEFORE UPDATE ON portal_listings FOR EACH ROW
  EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER trigger_partners_updated_at
  BEFORE UPDATE ON partners FOR EACH ROW
  EXECUTE FUNCTION update_portal_updated_at();
