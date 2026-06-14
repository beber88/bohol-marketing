"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe2, List, CheckCircle, Clock, Eye, MessageSquare, Users,
  Loader2, RefreshCw, BarChart3, Wifi, WifiOff, ArrowRight,
  Info,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/*  Bilingual labels (HE / EN)                                        */
/* ------------------------------------------------------------------ */
const LABELS = {
  he: {
    title: "סקירת פורטלים",
    totalListings: 'סה"כ מודעות',
    published: "מפורסמות",
    pendingReview: "ממתינות לבדיקה",
    views: "צפיות",
    inquiries: "פניות",
    leads: "לידים",
    portalStatus: "סטטוס פורטלים",
    bestPerforming: "פורטלים מובילים",
    noPortals: "אין פורטלים מוגדרים.",
    noPerformance:
      "אין נתוני ביצועים עדיין. הנתונים יופיעו ברגע שמודעות יקבלו צפיות.",
    active: "פעיל",
    inactive: "לא פעיל",
    activeListings: "מודעות פעילות",
    pipelineTitle: "צינור פרסום",
    pipelineAdapted: "מותאמות",
    pipelineReady: "מוכנות",
    pipelinePublished: "מפורסמות",
    pipelineLeads: "לידים",
    nextSteps: "מה לעשות עכשיו",
    step1: "התחבר לפורטלים - הגדר API keys בניהול פורטלים",
    step2: "אשר מודעות - עבור למודעות ואשר את המודעות שעברו Brand Guard",
    step3: "פרסם - שלח מודעות מאושרות לפורטלים",
    tier: "דרגה",
    method: "שיטת חיבור",
    apiFeed: "הזנת API",
    playwright: "אוטומציה",
    manual: "ידני",
    connector: "מחבר",
    refresh: "רענון",
  },
  en: {
    title: "Portal Overview",
    totalListings: "Total Listings",
    published: "Published",
    pendingReview: "Pending Review",
    views: "Views",
    inquiries: "Inquiries",
    leads: "Leads",
    portalStatus: "Portal Status",
    bestPerforming: "Top Performing Portals",
    noPortals: "No portals configured.",
    noPerformance:
      "No performance data yet. Data will appear once listings receive views.",
    active: "Active",
    inactive: "Inactive",
    activeListings: "Active Listings",
    pipelineTitle: "Publishing Pipeline",
    pipelineAdapted: "Adapted",
    pipelineReady: "Ready",
    pipelinePublished: "Published",
    pipelineLeads: "Leads",
    nextSteps: "What to do now",
    step1: "Connect to portals - configure API keys in Portal Management",
    step2: "Approve listings - review listings that passed Brand Guard",
    step3: "Publish - submit approved listings to portals",
    tier: "Tier",
    method: "Method",
    apiFeed: "API Feed",
    playwright: "Automation",
    manual: "Manual",
    connector: "Connector",
    refresh: "Refresh",
  },
};

type Labels = (typeof LABELS)["en"];

function getMethodLabels(L: Labels): Record<string, string> {
  return {
    api_feed: L.apiFeed,
    playwright: L.playwright,
    manual: L.manual,
    connector: L.connector,
  };
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface OverviewData {
  properties: { total: number };
  portals: { total: number; active: number };
  listings: {
    total: number;
    byStatus: Record<string, number>;
    totalViews: number;
    totalInquiries: number;
    totalLeads: number;
  };
  partners: { total: number; active: number };
  referrals: { total: number };
}

interface Portal {
  id: string;
  name: string;
  slug: string;
  tier: number;
  portal_type: string;
  integration_method: string;
  is_active: boolean;
  listing_fee_usd: number | null;
  notes: string | null;
}

interface PerformanceRow {
  name: string;
  slug: string;
  tier: number;
  listings: number;
  views: number;
  inquiries: number;
  leads: number;
  fee: number;
}

const EMPTY_OVERVIEW: OverviewData = {
  properties: { total: 0 },
  portals: { total: 0, active: 0 },
  listings: {
    total: 0,
    byStatus: {},
    totalViews: 0,
    totalInquiries: 0,
    totalLeads: 0,
  },
  partners: { total: 0, active: 0 },
  referrals: { total: 0 },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */
function TierBadge({ tier }: { tier: number }) {
  const styles: Record<number, string> = {
    1: "bg-amber-500/20 text-amber-400",
    2: "bg-blue-500/20 text-blue-400",
  };
  const cls = styles[tier] ?? "bg-zinc-500/20 text-zinc-400";
  return (
    <span
      className={`${cls} rounded-full px-2 py-0.5 text-[10px] font-semibold`}
    >
      T{tier}
    </span>
  );
}

function PipelineStep({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${color}`}
      >
        <span className="font-display text-lg font-bold">{count}</span>
      </div>
      <span className="text-[11px] text-muted text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export function PortalsOverviewSection() {
  const { locale } = useTranslation();
  const L = LABELS[locale === "he" ? "he" : "en"];
  const METHOD_LABELS = getMethodLabels(L);

  const [overview, setOverview] = useState<OverviewData>(EMPTY_OVERVIEW);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [performance, setPerformance] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, portalsRes, perfRes] = await Promise.all([
        fetch("/api/marketing/distribution/overview", { cache: "no-store" }),
        fetch("/api/marketing/portals", { cache: "no-store" }),
        fetch("/api/marketing/distribution/performance", { cache: "no-store" }),
      ]);

      const [overviewData, portalsData, perfData] = await Promise.all([
        overviewRes.ok ? overviewRes.json() : EMPTY_OVERVIEW,
        portalsRes.ok ? portalsRes.json() : { portals: [] },
        perfRes.ok ? perfRes.json() : { performance: [] },
      ]);

      setOverview({
        properties: overviewData.properties ?? EMPTY_OVERVIEW.properties,
        portals: overviewData.portals ?? EMPTY_OVERVIEW.portals,
        listings: overviewData.listings ?? EMPTY_OVERVIEW.listings,
        partners: overviewData.partners ?? EMPTY_OVERVIEW.partners,
        referrals: overviewData.referrals ?? EMPTY_OVERVIEW.referrals,
      });
      setPortals(
        Array.isArray(portalsData.portals) ? portalsData.portals : [],
      );
      setPerformance(
        Array.isArray(perfData.performance) ? perfData.performance : [],
      );
    } catch {
      /* keep defaults */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  /* Loading state */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  /* Derived numbers */
  const activeListings = overview.listings.byStatus?.active ?? 0;
  const pendingReview = overview.listings.byStatus?.pending_review ?? 0;
  const brandGuardPassed =
    overview.listings.byStatus?.brand_guard_passed ?? 0;

  const localeTag = locale === "he" ? "he-IL" : "en-US";

  const kpis = [
    {
      label: L.totalListings,
      value: overview.listings.total,
      icon: List,
      color: "text-blue-400",
    },
    {
      label: L.published,
      value: activeListings,
      icon: CheckCircle,
      color: "text-emerald-400",
    },
    {
      label: L.pendingReview,
      value: pendingReview,
      icon: Clock,
      color: "text-amber-400",
    },
    {
      label: L.views,
      value: overview.listings.totalViews,
      icon: Eye,
      color: "text-purple-400",
    },
    {
      label: L.inquiries,
      value: overview.listings.totalInquiries,
      icon: MessageSquare,
      color: "text-[#89AACC]",
    },
    {
      label: L.leads,
      value: overview.listings.totalLeads,
      icon: Users,
      color: "text-emerald-400",
    },
  ];

  const chartData = performance
    .filter((p) => p.views > 0 || p.inquiries > 0 || p.leads > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return (
    <section dir={locale === "he" ? "rtl" : "ltr"} className="space-y-6">
      {/* -- Header -------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Globe2 size={18} className="text-[#89AACC]" />
          {L.title}
        </h2>
        <button
          onClick={fetchAll}
          className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
          aria-label={L.refresh}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* -- KPI Row ------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-stroke bg-surface p-5 text-center"
            >
              <Icon size={16} className={`mx-auto mb-2 ${kpi.color}`} />
              <p className="font-display text-3xl font-bold">
                {kpi.value.toLocaleString(localeTag)}
              </p>
              <p className="text-xs text-muted mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* -- Pipeline Card ------------------------------------------- */}
      <div className="rounded-2xl border border-stroke bg-surface p-5">
        <h3 className="font-display text-sm font-semibold mb-5 flex items-center gap-2">
          <BarChart3 size={16} className="text-[#89AACC]" />
          {L.pipelineTitle}
        </h3>
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          <PipelineStep
            label={L.pipelineAdapted}
            count={overview.listings.total}
            color="border-blue-400/60 text-blue-400"
          />
          <ArrowRight size={18} className="text-muted/40 shrink-0 hidden sm:block" />
          <PipelineStep
            label={L.pipelineReady}
            count={brandGuardPassed}
            color="border-amber-400/60 text-amber-400"
          />
          <ArrowRight size={18} className="text-muted/40 shrink-0 hidden sm:block" />
          <PipelineStep
            label={L.pipelinePublished}
            count={activeListings}
            color="border-emerald-400/60 text-emerald-400"
          />
          <ArrowRight size={18} className="text-muted/40 shrink-0 hidden sm:block" />
          <PipelineStep
            label={L.pipelineLeads}
            count={overview.listings.totalLeads}
            color="border-purple-400/60 text-purple-400"
          />
        </div>
      </div>

      {/* -- Next Steps (shown when no leads yet) -------------------- */}
      {overview.listings.totalLeads === 0 && (
        <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-5">
          <h3 className="font-display text-sm font-semibold mb-4 flex items-center gap-2 text-blue-400">
            <Info size={16} />
            {L.nextSteps}
          </h3>
          <ol className="space-y-3 text-sm text-text-primary leading-relaxed list-decimal list-inside">
            <li>{L.step1}</li>
            <li>{L.step2}</li>
            <li>{L.step3}</li>
          </ol>
        </div>
      )}

      {/* -- Portal Status Grid -------------------------------------- */}
      {portals.length > 0 ? (
        <div>
          <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-emerald-400" />
            {L.portalStatus}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portals.map((portal) => {
              const activeCount =
                performance.find((p) => p.slug === portal.slug)?.listings ?? 0;

              return (
                <div
                  key={portal.id}
                  className="rounded-2xl border border-stroke bg-surface p-5"
                >
                  {/* Name + status dot */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-display text-sm font-bold truncate">
                        {portal.name}
                      </span>
                      <TierBadge tier={portal.tier} />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          portal.is_active ? "bg-emerald-400" : "bg-zinc-500"
                        }`}
                      />
                      <span className="text-[10px] text-muted">
                        {portal.is_active ? L.active : L.inactive}
                      </span>
                    </div>
                  </div>

                  {/* Method + fee */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="rounded-lg border border-stroke px-2 py-0.5 text-[10px] font-medium text-muted">
                      {L.method}:{" "}
                      {METHOD_LABELS[portal.integration_method] ??
                        portal.integration_method}
                    </span>
                    <span className="rounded-lg border border-stroke px-2 py-0.5 text-[10px] font-medium text-muted">
                      {L.tier} {portal.tier}
                    </span>
                    {portal.listing_fee_usd != null &&
                      portal.listing_fee_usd > 0 && (
                        <span className="text-[10px] text-muted">
                          ${portal.listing_fee_usd}
                        </span>
                      )}
                  </div>

                  {/* Active listing count */}
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <List size={12} />
                    <span>
                      {activeCount} {L.activeListings}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <WifiOff size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">{L.noPortals}</p>
        </div>
      )}

      {/* -- Best Performing Portals Chart --------------------------- */}
      {chartData.length > 0 ? (
        <div className="rounded-2xl border border-stroke bg-surface p-5">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-amber-400" />
            {L.bestPerforming}
          </h3>
          <div className="h-[320px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(0 0% 12%)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(0 0% 53%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(0 0% 12%)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(0 0% 53%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(0 0% 12%)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 8%)",
                    border: "1px solid hsl(0 0% 12%)",
                    color: "hsl(0 0% 96%)",
                    borderRadius: 8,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="views"
                  name={L.views}
                  fill="#a78bfa"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="inquiries"
                  name={L.inquiries}
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="leads"
                  name={L.leads}
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <BarChart3 size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">{L.noPerformance}</p>
        </div>
      )}
    </section>
  );
}
