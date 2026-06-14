"use client";

import { useState, useEffect } from "react";
import {
  List, CheckCircle, Clock, Eye, MessageSquare, Users,
  Loader2, RefreshCw, BarChart3, Wifi, WifiOff,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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
  listings: { total: 0, byStatus: {}, totalViews: 0, totalInquiries: 0, totalLeads: 0 },
  partners: { total: 0, active: 0 },
  referrals: { total: 0 },
};

function TierBadge({ tier }: { tier: number }) {
  if (tier === 1) {
    return (
      <span className="bg-amber-500/20 text-amber-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
        T1
      </span>
    );
  }
  if (tier === 2) {
    return (
      <span className="bg-blue-500/20 text-blue-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
        T2
      </span>
    );
  }
  return (
    <span className="bg-zinc-500/20 text-zinc-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
      T{tier}
    </span>
  );
}

const METHOD_LABELS: Record<string, string> = {
  api_feed: "API Feed",
  playwright: "Playwright",
  manual: "Manual",
  connector: "Connector",
};

export function PortalsOverviewSection() {
  const [overview, setOverview] = useState<OverviewData>(EMPTY_OVERVIEW);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [performance, setPerformance] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [overviewRes, portalsRes, perfRes] = await Promise.all([
        fetch("/api/marketing/distribution/overview", { cache: "no-store" }),
        fetch("/api/marketing/portals", { cache: "no-store" }),
        fetch("/api/marketing/distribution/performance", { cache: "no-store" }),
      ]);

      const [overviewData, portalsData, perfData] = await Promise.all([
        overviewRes.ok ? overviewRes.json() : Promise.resolve(EMPTY_OVERVIEW),
        portalsRes.ok ? portalsRes.json() : Promise.resolve({ portals: [] }),
        perfRes.ok ? perfRes.json() : Promise.resolve({ performance: [] }),
      ]);

      setOverview({
        properties: overviewData.properties ?? EMPTY_OVERVIEW.properties,
        portals: overviewData.portals ?? EMPTY_OVERVIEW.portals,
        listings: overviewData.listings ?? EMPTY_OVERVIEW.listings,
        partners: overviewData.partners ?? EMPTY_OVERVIEW.partners,
        referrals: overviewData.referrals ?? EMPTY_OVERVIEW.referrals,
      });
      setPortals(Array.isArray(portalsData.portals) ? portalsData.portals : []);
      setPerformance(Array.isArray(perfData.performance) ? perfData.performance : []);
    } catch {
      /* keep defaults */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  const activeListings = overview.listings.byStatus?.active ?? 0;
  const pendingReview = overview.listings.byStatus?.pending_review ?? 0;

  const kpis = [
    { label: "Total Listings", value: overview.listings.total, icon: List, color: "text-blue-400" },
    { label: "Active", value: activeListings, icon: CheckCircle, color: "text-emerald-400" },
    { label: "Pending Review", value: pendingReview, icon: Clock, color: "text-amber-400" },
    { label: "Views", value: overview.listings.totalViews, icon: Eye, color: "text-purple-400" },
    { label: "Inquiries", value: overview.listings.totalInquiries, icon: MessageSquare, color: "text-[#89AACC]" },
    { label: "Leads", value: overview.listings.totalLeads, icon: Users, color: "text-emerald-400" },
  ];

  const chartData = performance
    .filter((p) => p.views > 0 || p.inquiries > 0 || p.leads > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <BarChart3 size={18} className="text-[#89AACC]" /> Portals Overview
        </h2>
        <button
          onClick={fetchAll}
          className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* KPI Row */}
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
                {kpi.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Portal Status Grid */}
      {portals.length > 0 ? (
        <div>
          <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-emerald-400" /> Portal Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portals.map((portal) => {
              const activeCount = performance.find(
                (p) => p.slug === portal.slug
              )?.listings ?? 0;

              return (
                <div
                  key={portal.id}
                  className="rounded-2xl border border-stroke bg-surface p-5"
                >
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
                        {portal.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-lg border border-stroke px-2 py-0.5 text-[10px] font-medium text-muted">
                      {METHOD_LABELS[portal.integration_method] ?? portal.integration_method}
                    </span>
                    {portal.listing_fee_usd != null && portal.listing_fee_usd > 0 && (
                      <span className="text-[10px] text-muted">
                        ${portal.listing_fee_usd}/listing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <List size={12} />
                    <span>{activeCount} active listings</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <WifiOff size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">
            No portals configured yet. Add portals to start distributing listings.
          </p>
        </div>
      )}

      {/* Best Performing Portals Chart */}
      {chartData.length > 0 ? (
        <div className="rounded-2xl border border-stroke bg-surface p-5">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-amber-400" /> Best Performing Portals
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
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
                <Bar dataKey="views" name="Views" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inquiries" name="Inquiries" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" name="Leads" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <BarChart3 size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">
            No performance data yet. Data will appear once listings receive views and inquiries.
          </p>
        </div>
      )}
    </section>
  );
}
