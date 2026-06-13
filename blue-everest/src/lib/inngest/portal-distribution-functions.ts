/* eslint-disable @typescript-eslint/no-explicit-any */
import { inngest } from "./client";

// ============================================================
// Portal Distribution OS - Inngest scheduled and event-driven functions
// ============================================================

// ----- DAILY CRON: XML Feed Push (6am Manila) -----
export const portalXmlFeedPush = inngest.createFunction(
  { id: "portal-xml-feed-push", triggers: [{ cron: "TZ=Asia/Manila 0 6 * * *" }] },
  async ({ step }: any) => {
    const properties = await step.run("fetch-active-properties", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return [];
      const { data } = await supabase.from("properties").select("*").eq("status", "for_sale");
      return data || [];
    });

    if (!properties.length) return { status: "skipped", reason: "No active properties" };

    // Push to Lamudi
    const lamudiResult = await step.run("push-lamudi-feed", async () => {
      try {
        const { generateFeedXML, pushFeed, isConfigured } = await import("@/lib/connectors/lamudi");
        if (!isConfigured()) return { skipped: true, reason: "Lamudi not configured" };

        const feedProperties = properties.map((p: any) => ({
          id: p.id,
          title: p.internal_name,
          description: p.descriptions?.en ?? "",
          price: p.price_php_cents / 100,
          currency: "PHP",
          bedrooms: p.bedrooms ?? 4,
          bathrooms: p.bathrooms ?? 4,
          floorArea: p.floor_area_sqm ?? 263.78,
          lotArea: p.lot_area_sqm,
          propertyType: "house",
          listingType: "sale",
          city: p.city ?? "Panglao",
          region: p.province ?? "Bohol",
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          images: p.image_urls ?? [],
          agentName: "Blue Everest Asset Group",
          agentPhone: "+639542555553",
          agentEmail: "ceo@blue-everest.com",
        }));

        const xml = generateFeedXML(feedProperties);
        return await pushFeed(xml);
      } catch (e) {
        console.error("Lamudi feed push failed:", e);
        return { success: false, error: (e as Error).message };
      }
    });

    // Push to Properstar
    const properstarResult = await step.run("push-properstar-feed", async () => {
      try {
        const { generatePropertystarXML, uploadFeed, isConfigured } = await import("@/lib/connectors/properstar");
        if (!isConfigured()) return { skipped: true, reason: "Properstar not configured" };

        const feedProperties = properties.map((p: any) => ({
          id: p.id,
          title: p.internal_name,
          description: p.descriptions?.en ?? "",
          price: p.price_php_cents / 100,
          currency: "PHP",
          type: "villa",
          surface: p.floor_area_sqm ?? 263.78,
          rooms: p.bedrooms ?? 4,
          bathrooms: p.bathrooms ?? 4,
          latitude: p.latitude ?? 9.5581,
          longitude: p.longitude ?? 123.7634,
          pictures: p.image_urls ?? [],
          country: "Philippines",
          city: p.city ?? "Panglao",
          agencyId: process.env.PROPERSTAR_AGENCY_ID ?? "blue-everest",
          agentName: "Blue Everest Asset Group",
          agentPhone: "+639542555553",
          agentEmail: "ceo@blue-everest.com",
        }));

        const xml = generatePropertystarXML(feedProperties);
        return await uploadFeed(xml);
      } catch (e) {
        console.error("Properstar feed push failed:", e);
        return { success: false, error: (e as Error).message };
      }
    });

    return { status: "completed", lamudi: lamudiResult, properstar: properstarResult };
  }
);

// ----- DAILY CRON: Freshness Check (7am Manila) -----
export const portalFreshnessCheck = inngest.createFunction(
  { id: "portal-daily-freshness-check", triggers: [{ cron: "TZ=Asia/Manila 0 7 * * *" }] },
  async ({ step }: any) => {
    const expiring = await step.run("find-expiring-listings", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return [];

      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("portal_listings")
        .select("id, status, expires_at, portal_id, portals(name, slug, integration_method)")
        .eq("status", "active")
        .lte("expires_at", sevenDaysFromNow)
        .order("expires_at", { ascending: true });

      return data || [];
    });

    if (!expiring.length) return { status: "completed", expiring: 0 };

    const refreshed = await step.run("refresh-expiring", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return { refreshed: 0 };

      let count = 0;
      for (const listing of expiring) {
        const portal = (listing as any).portals;
        const method = portal?.integration_method;

        if (method === "api_feed" || method === "connector") {
          // Auto-refresh: extend expiration
          await supabase.from("portal_listings").update({
            last_refreshed_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }).eq("id", listing.id);

          await supabase.from("portal_distribution_logs").insert({
            portal_listing_id: listing.id,
            portal_id: listing.portal_id,
            action: "refresh",
            status: "success",
          });
          count++;
        } else {
          // Manual/Playwright portals: create escalation
          await supabase.from("portal_distribution_logs").insert({
            portal_listing_id: listing.id,
            portal_id: listing.portal_id,
            action: "refresh",
            status: "skipped",
            error_message: `Manual refresh needed for ${portal?.name}. Listing expires ${listing.expires_at}`,
          });
        }
      }
      return { refreshed: count };
    });

    return { status: "completed", expiring: expiring.length, refreshed };
  }
);

// ----- DAILY CRON: Metrics Sync (12pm Manila) -----
export const portalMetricsSync = inngest.createFunction(
  { id: "portal-daily-metrics-sync", triggers: [{ cron: "TZ=Asia/Manila 0 12 * * *" }] },
  async ({ step }: any) => {
    const synced = await step.run("sync-portal-metrics", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return { synced: 0 };

      // Get active listings with API-based portals
      const { data: listings } = await supabase
        .from("portal_listings")
        .select("id, external_listing_id, portal_id, portals(slug, integration_method)")
        .eq("status", "active")
        .not("external_listing_id", "is", null);

      if (!listings?.length) return { synced: 0 };

      let count = 0;
      for (const listing of listings) {
        const portal = (listing as any).portals;
        if (portal?.integration_method !== "api_feed") continue;

        try {
          if (portal.slug === "jamesedition" && listing.external_listing_id) {
            const { getListingPerformance, isConfigured } = await import("@/lib/connectors/jamesedition");
            if (!isConfigured()) continue;

            const perf = await getListingPerformance(listing.external_listing_id);
            if (perf.success && perf.data) {
              await supabase.from("portal_listings").update({
                views: perf.data.views ?? 0,
                inquiries: perf.data.inquiries ?? 0,
              }).eq("id", listing.id);
              count++;
            }
          }

          if (portal.slug === "listglobally" && listing.external_listing_id) {
            const { getListingStatus, isConfigured } = await import("@/lib/connectors/listglobally");
            if (!isConfigured()) continue;

            const status = await getListingStatus(listing.external_listing_id);
            if (status.success && status.data) {
              await supabase.from("portal_listings").update({
                metadata: { portals_distributed: status.data.portals_distributed, portal_statuses: status.data.portal_statuses },
              }).eq("id", listing.id);
              count++;
            }
          }
        } catch (e) {
          console.error(`Metrics sync failed for listing ${listing.id}:`, e);
        }
      }

      return { synced: count };
    });

    return { status: "completed", ...synced };
  }
);

// ----- MON/WED/FRI CRON: LinkedIn Posting (10am Manila) -----
export const portalLinkedInPosting = inngest.createFunction(
  { id: "portal-linkedin-posting", triggers: [{ cron: "TZ=Asia/Manila 0 10 * * 1,3,5" }] },
  async ({ step }: any) => {
    const post = await step.run("post-to-linkedin", async () => {
      try {
        const { createPost, isConfigured } = await import("@/lib/connectors/linkedin-organic");
        if (!isConfigured()) return { skipped: true, reason: "LinkedIn not configured" };

        // Get a property to feature
        const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
        const supabase = createSupabaseAdmin();
        if (!supabase) return { skipped: true, reason: "Supabase not configured" };

        const { data: property } = await supabase
          .from("properties")
          .select("*")
          .eq("status", "for_sale")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!property) return { skipped: true, reason: "No active properties" };

        // Generate a business-focused LinkedIn post
        const { copywriter } = await import("@/lib/agents/copywriter");
        const copyResult = await copywriter.execute({
          context: {
            contentType: "social_post",
            platform: "linkedin",
            language: "en",
            market: "INTL",
            property,
          },
        });

        if (!copyResult.success) return { skipped: true, reason: "Copy generation failed" };

        const postContent = typeof copyResult.data === "string"
          ? copyResult.data
          : (copyResult.data as any)?.body ?? "Luxury Villa Investment Opportunity in Bohol, Philippines. Contact us for details.";

        const result = await createPost({ text: postContent });
        return result;
      } catch (e) {
        console.error("LinkedIn posting failed:", e);
        return { success: false, error: (e as Error).message };
      }
    });

    return { status: "completed", post };
  }
);

// ----- WEEKLY CRON: Portal Performance (Monday 9am Manila) -----
export const portalWeeklyPerformance = inngest.createFunction(
  { id: "portal-weekly-performance", triggers: [{ cron: "TZ=Asia/Manila 0 9 * * 1" }] },
  async ({ step }: any) => {
    const analysis = await step.run("analyze-portal-performance", async () => {
      try {
        const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
        const supabase = createSupabaseAdmin();
        if (!supabase) return null;

        const { data: listings } = await supabase
          .from("portal_listings")
          .select("*, portals(name, slug, tier, listing_fee_usd)");

        const { portalDistributionManager } = await import("@/lib/agents/portal-distribution-manager");
        const result = await portalDistributionManager.execute({
          trigger: "weekly_performance",
          context: { action: "analyze", metrics: { listings } },
        });

        return result.data;
      } catch (e) {
        console.error("Weekly portal analysis failed:", e);
        return null;
      }
    });

    return { status: "completed", analysis };
  }
);

// ----- WEEKLY CRON: Partner Commission (Monday 8am Manila) -----
export const partnerWeeklyCommission = inngest.createFunction(
  { id: "partner-weekly-commission", triggers: [{ cron: "TZ=Asia/Manila 0 8 * * 1" }] },
  async ({ step }: any) => {
    const commissions = await step.run("calculate-commissions", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return { total: 0, partners: [] };

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: referrals } = await supabase
        .from("partner_referrals")
        .select("*, partners(name, commission_pct, fixed_fee_usd)")
        .eq("status", "converted")
        .eq("commission_paid", false)
        .gte("created_at", oneWeekAgo);

      if (!referrals?.length) return { total: 0, partners: [] };

      const summary: Record<string, { name: string; due: number; count: number }> = {};
      for (const r of referrals) {
        const partner = (r as any).partners;
        const partnerId = (r as any).partner_id;
        if (!summary[partnerId]) {
          summary[partnerId] = { name: partner?.name ?? "Unknown", due: 0, count: 0 };
        }
        summary[partnerId].due += (r as any).commission_due_usd ?? 0;
        summary[partnerId].count++;
      }

      return { total: referrals.length, partners: Object.entries(summary).map(([id, s]) => ({ id, ...s })) };
    });

    return { status: "completed", commissions };
  }
);

// ----- TUE/THU CRON: OFW Engagement (2pm Manila) -----
export const portalOfwEngagement = inngest.createFunction(
  { id: "portal-ofw-engagement", triggers: [{ cron: "TZ=Asia/Manila 0 14 * * 2,4" }] },
  async ({ step }: any) => {
    const content = await step.run("generate-ofw-content", async () => {
      try {
        const { copywriter } = await import("@/lib/agents/copywriter");
        const result = await copywriter.execute({
          context: {
            contentType: "social_post",
            platform: "facebook",
            language: "en",
            market: "PH",
            pillar: "ofw_investment",
            awarenessLevel: "consideration",
            targetAudience: "OFW in Gulf countries and Singapore",
          },
        });
        return result.data;
      } catch (e) {
        console.error("OFW content gen failed:", e);
        return null;
      }
    });

    return { status: "completed", content };
  }
);

// ----- EVENT: Portal listing adapted -----
export const portalListingAdapted = inngest.createFunction(
  { id: "portal-listing-adapted", triggers: [{ event: "portal/listing.adapted" }] },
  async ({ event, step }: any) => {
    const { listingId } = event.data;

    await step.run("run-brand-guard", async () => {
      const { createSupabaseAdmin } = await import("@/lib/connectors/supabase");
      const supabase = createSupabaseAdmin();
      if (!supabase) return;

      const { data: listing } = await supabase
        .from("portal_listings")
        .select("adapted_description")
        .eq("id", listingId)
        .single();

      if (!listing?.adapted_description) return;

      const { quickValidate } = await import("@/lib/agents/brand-guard");
      const result = quickValidate(listing.adapted_description, "en", "INTL");

      await supabase.from("portal_listings").update({
        brand_guard_result: result,
        brand_guard_passed: result.passed,
        status: result.passed ? "brand_guard_passed" : "pending_review",
      }).eq("id", listingId);
    });

    return { status: "completed" };
  }
);

// ----- Export all portal distribution functions -----
export const portalDistributionFunctions = [
  portalXmlFeedPush,
  portalFreshnessCheck,
  portalMetricsSync,
  portalLinkedInPosting,
  portalWeeklyPerformance,
  partnerWeeklyCommission,
  portalOfwEngagement,
  portalListingAdapted,
];
