"use client";

import { useState, useEffect } from "react";
import {
  Eye, MessageSquare, Users, TrendingUp, Loader2, RefreshCw, BarChart3,
  LayoutList, ArrowLeft, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatusBadge } from "../cards/status-badge";
import { useTranslation } from "@/lib/i18n";

// --- Bilingual Labels ---

const LABELS = {
  he: {
    title: "אנליטיקס פורטלים",
    totalViews: 'סה"כ צפיות',
    totalInquiries: 'סה"כ פניות',
    totalLeads: 'סה"כ לידים',
    conversionRate: "יחס המרה",
    portalPerformance: "ביצועי פורטלים",
    noPerformance: "אין נתוני ביצועים עדיין.",
    leadSources: "מקורות לידים",
    noLeadData: "אין נתוני לידים.",
    costAnalysis: "ניתוח עלויות",
    noCostData: "אין נתוני עלות.",
    portal: "פורטל",
    fee: "עלות",
    leads: "לידים",
    cpl: "עלות לליד",
    listingPerformance: "ביצועי מודעות",
    property: "נכס",
    views: "צפיות",
    inquiries: "פניות",
    convRate: "יחס המרה",
    status: "סטטוס",
    noListings: "אין מודעות עדיין.",
    emptyTitle: "האנליטיקס ריקה כרגע",
    emptyText: "כדי לראות נתונים כאן, צריך קודם לפרסם מודעות בפורטלים.",
    step1: "1. התאם מודעות",
    step2: "2. פרסם בפורטלים",
    step3: "3. צפה בנתונים כאן",
    na: "לא זמין",
    unknown: "לא ידוע",
    barViews: "צפיות",
    barInquiries: "פניות",
    barLeads: "לידים",
  },
  en: {
    title: "Portal Analytics",
    totalViews: "Total Views",
    totalInquiries: "Total Inquiries",
    totalLeads: "Total Leads",
    conversionRate: "Conversion Rate",
    portalPerformance: "Portal Performance",
    noPerformance: "No performance data yet.",
    leadSources: "Lead Sources",
    noLeadData: "No lead data.",
    costAnalysis: "Cost Analysis",
    noCostData: "No cost data.",
    portal: "Portal",
    fee: "Fee",
    leads: "Leads",
    cpl: "Cost Per Lead",
    listingPerformance: "Listing Performance",
    property: "Property",
    views: "Views",
    inquiries: "Inquiries",
    convRate: "Conv. Rate",
    status: "Status",
    noListings: "No listings yet.",
    emptyTitle: "Analytics is empty",
    emptyText: "To see data here, publish listings to portals first.",
    step1: "1. Adapt listings",
    step2: "2. Publish to portals",
    step3: "3. See data here",
    na: "N/A",
    unknown: "Unknown",
    barViews: "Views",
    barInquiries: "Inquiries",
    barLeads: "Leads",
  },
};

// --- Types ---

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

interface OverviewData {
  listings: {
    total: number;
    totalViews: number;
    totalInquiries: number;
    totalLeads: number;
  };
}

interface PortalListing {
  id: string;
  status: string;
  views: number;
  inquiries: number;
  leads_generated: number;
  properties: { internal_name: string; slug: string } | null;
  portals: { name: string; slug: string; tier: number } | null;
}

// --- Constants ---

const COLORS = [
  "#89AACC", "#4E85BF", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
];

const EMPTY_OVERVIEW: OverviewData = {
  listings: { total: 0, totalViews: 0, totalInquiries: 0, totalLeads: 0 },
};

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(0 0% 8%)",
  border: "1px solid hsl(0 0% 12%)",
  color: "hsl(0 0% 96%)",
  borderRadius: 8,
};

const AXIS_TICK = { fill: "hsl(0 0% 53%)", fontSize: 11 };
const AXIS_LINE = { stroke: "hsl(0 0% 12%)" };
const GRID_STROKE = "hsl(0 0% 12%)";

// --- Component ---

export function PortalsAnalyticsSection() {
  const { locale } = useTranslation();
  const L = LABELS[locale === "he" ? "he" : "en"];
  const dir = locale === "he" ? "rtl" : "ltr";
  const numLocale = locale === "he" ? "he-IL" : "en-US";
  const StepArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [overview, setOverview] = useState<OverviewData>(EMPTY_OVERVIEW);
  const [performance, setPerformance] = useState<PerformanceRow[]>([]);
  const [listings, setListings] = useState<PortalListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [overviewRes, perfRes, listingsRes] = await Promise.all([
        fetch("/api/marketing/distribution/overview", { cache: "no-store" }),
        fetch("/api/marketing/distribution/performance", { cache: "no-store" }),
        fetch("/api/marketing/portal-listings", { cache: "no-store" }),
      ]);

      const [overviewData, perfData, listingsData] = await Promise.all([
        overviewRes.ok ? overviewRes.json() : Promise.resolve(EMPTY_OVERVIEW),
        perfRes.ok ? perfRes.json() : Promise.resolve({ performance: [] }),
        listingsRes.ok ? listingsRes.json() : Promise.resolve({ listings: [] }),
      ]);

      setOverview({
        listings: overviewData.listings ?? EMPTY_OVERVIEW.listings,
      });
      setPerformance(Array.isArray(perfData.performance) ? perfData.performance : []);
      setListings(Array.isArray(listingsData.listings) ? listingsData.listings : []);
    } catch {
      /* keep defaults */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  const totalViews = overview.listings.totalViews;
  const totalInquiries = overview.listings.totalInquiries;
  const totalLeads = overview.listings.totalLeads;
  const conversionRate = totalViews > 0
    ? ((totalLeads / totalViews) * 100).toFixed(1)
    : "0.0";

  const isAllZero = totalViews === 0 && totalInquiries === 0 && totalLeads === 0;

  // Chart data: only portals with activity
  const chartData = performance
    .filter((p) => p.views + p.inquiries + p.leads > 0)
    .sort((a, b) => b.views - a.views)
    .map((p) => ({
      ...p,
      name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
      fullName: p.name,
    }));

  // Pie chart data: leads per portal
  const pieData = performance
    .filter((p) => p.leads > 0)
    .sort((a, b) => b.leads - a.leads)
    .map((p) => ({ name: p.name, value: p.leads }));

  // Cost analysis data
  const costData = performance
    .filter((p) => p.fee > 0 || p.leads > 0)
    .sort((a, b) => b.leads - a.leads);

  // Listings sorted by leads descending
  const sortedListings = [...listings].sort(
    (a, b) => (b.leads_generated ?? 0) - (a.leads_generated ?? 0)
  );

  return (
    <section dir={dir} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <BarChart3 size={18} className="text-[#89AACC]" /> {L.title}
        </h2>
        <button
          onClick={fetchAll}
          className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Empty State */}
      {isAllZero && chartData.length === 0 && sortedListings.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-stroke p-10 text-center space-y-5">
          <BarChart3 size={44} className="mx-auto text-muted/20" />
          <div>
            <p className="text-text-primary font-display font-semibold text-base">{L.emptyTitle}</p>
            <p className="text-xs text-muted mt-1">{L.emptyText}</p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-[#4E85BF]/20 bg-[#4E85BF]/5 px-4 py-2.5">
              <LayoutList size={14} className="text-[#89AACC]" />
              <span className="text-xs font-semibold text-[#89AACC]">{L.step1}</span>
            </div>
            <StepArrow size={14} className="text-muted/40" />
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
              <Eye size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">{L.step2}</span>
            </div>
            <StepArrow size={14} className="text-muted/40" />
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
              <BarChart3 size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">{L.step3}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: L.totalViews, value: totalViews.toLocaleString(numLocale), icon: Eye, color: "text-blue-400" },
              { label: L.totalInquiries, value: totalInquiries.toLocaleString(numLocale), icon: MessageSquare, color: "text-amber-400" },
              { label: L.totalLeads, value: totalLeads.toLocaleString(numLocale), icon: Users, color: "text-emerald-400" },
              { label: L.conversionRate, value: `${conversionRate}%`, icon: TrendingUp, color: "text-purple-400" },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="rounded-2xl border border-stroke bg-surface p-5 text-center"
                >
                  <Icon size={16} className={`mx-auto mb-2 ${kpi.color}`} />
                  <p className="font-display text-3xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted mt-1">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          {/* Portal Performance Bar Chart */}
          {chartData.length > 0 ? (
            <div className="rounded-2xl border border-stroke bg-surface p-5">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-amber-400" /> {L.portalPerformance}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis
                    dataKey="name"
                    tick={AXIS_TICK}
                    axisLine={AXIS_LINE}
                    tickLine={false}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    axisLine={AXIS_LINE}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="views" name={L.barViews} fill="#89AACC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inquiries" name={L.barInquiries} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" name={L.barLeads} fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
              <BarChart3 size={40} className="mx-auto mb-4 text-muted/30" />
              <p className="text-muted">{L.noPerformance}</p>
            </div>
          )}

          {/* Pie Chart + Cost Analysis Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Source Pie Chart */}
            <div className="rounded-2xl border border-stroke bg-surface p-5">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <Users size={18} className="text-emerald-400" /> {L.leadSources}
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span style={{ color: "hsl(0 0% 53%)", fontSize: 11 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-xs text-muted">{L.noLeadData}</p>
                </div>
              )}
            </div>

            {/* Cost Analysis Card */}
            <div className="rounded-2xl border border-stroke bg-surface p-5">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-amber-400" /> {L.costAnalysis}
              </h3>
              {costData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b border-stroke ${dir === "rtl" ? "text-right" : "text-left"}`}>
                        <th className="pb-2 text-xs font-semibold text-muted uppercase tracking-wider">{L.portal}</th>
                        <th className={`pb-2 text-xs font-semibold text-muted uppercase tracking-wider ${dir === "rtl" ? "text-left" : "text-right"}`}>{L.fee}</th>
                        <th className={`pb-2 text-xs font-semibold text-muted uppercase tracking-wider ${dir === "rtl" ? "text-left" : "text-right"}`}>{L.leads}</th>
                        <th className={`pb-2 text-xs font-semibold text-muted uppercase tracking-wider ${dir === "rtl" ? "text-left" : "text-right"}`}>{L.cpl}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costData.map((row) => {
                        const cpl = row.leads > 0 ? (row.fee / row.leads).toFixed(2) : null;
                        return (
                          <tr key={row.slug} className="border-t border-stroke hover:bg-surface/50">
                            <td className="py-2 text-text-primary text-xs">{row.name}</td>
                            <td className={`py-2 text-xs text-muted ${dir === "rtl" ? "text-left" : "text-right"}`}>${row.fee}</td>
                            <td className={`py-2 text-xs font-semibold ${dir === "rtl" ? "text-left" : "text-right"}`}>{row.leads}</td>
                            <td className={`py-2 text-xs ${dir === "rtl" ? "text-left" : "text-right"}`}>
                              {cpl ? (
                                <span className={parseFloat(cpl) > 50 ? "text-red-400" : "text-emerald-400"}>
                                  ${cpl}
                                </span>
                              ) : (
                                <span className="text-muted">{L.na}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <p className="text-xs text-muted">{L.noCostData}</p>
                </div>
              )}
            </div>
          </div>

          {/* Listing Performance Table */}
          {sortedListings.length > 0 ? (
            <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
              <div className="px-6 py-4 border-b border-stroke">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Eye size={18} className="text-blue-400" /> {L.listingPerformance}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b border-stroke ${dir === "rtl" ? "text-right" : "text-left"}`}>
                      <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">{L.property}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">{L.portal}</th>
                      <th className={`px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider ${dir === "rtl" ? "text-left" : "text-right"}`}>{L.views}</th>
                      <th className={`px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider ${dir === "rtl" ? "text-left" : "text-right"}`}>{L.inquiries}</th>
                      <th className={`px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider ${dir === "rtl" ? "text-left" : "text-right"}`}>{L.leads}</th>
                      <th className={`px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider ${dir === "rtl" ? "text-left" : "text-right"}`}>{L.convRate}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">{L.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedListings.map((listing) => {
                      const views = listing.views ?? 0;
                      const inquiries = listing.inquiries ?? 0;
                      const leads = listing.leads_generated ?? 0;
                      const convRate = views > 0 ? ((leads / views) * 100).toFixed(1) : "0.0";

                      return (
                        <tr key={listing.id} className="border-t border-stroke hover:bg-surface/50">
                          <td className="px-6 py-3 text-text-primary font-medium">
                            {listing.properties?.internal_name || L.unknown}
                          </td>
                          <td className="px-6 py-3 text-muted">
                            {listing.portals?.name || L.unknown}
                          </td>
                          <td className={`px-6 py-3 ${dir === "rtl" ? "text-left" : "text-right"}`}>{views.toLocaleString(numLocale)}</td>
                          <td className={`px-6 py-3 ${dir === "rtl" ? "text-left" : "text-right"}`}>{inquiries.toLocaleString(numLocale)}</td>
                          <td className={`px-6 py-3 font-semibold ${dir === "rtl" ? "text-left" : "text-right"}`}>{leads.toLocaleString(numLocale)}</td>
                          <td className={`px-6 py-3 ${dir === "rtl" ? "text-left" : "text-right"}`}>{convRate}%</td>
                          <td className="px-6 py-3">
                            <StatusBadge status={listing.status} type="listing" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
              <Eye size={40} className="mx-auto mb-4 text-muted/30" />
              <p className="text-muted">{L.noListings}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
