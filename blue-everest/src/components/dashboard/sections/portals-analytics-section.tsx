"use client";

import { useState, useEffect } from "react";
import {
  Eye, MessageSquare, Users, TrendingUp, Loader2, RefreshCw, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatusBadge } from "../cards/status-badge";

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

// --- Component ---

export function PortalsAnalyticsSection() {
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
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <BarChart3 size={18} className="text-[#89AACC]" /> Portal Analytics
        </h2>
        <button
          onClick={fetchAll}
          className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-400" },
          { label: "Total Inquiries", value: totalInquiries.toLocaleString(), icon: MessageSquare, color: "text-amber-400" },
          { label: "Total Leads", value: totalLeads.toLocaleString(), icon: Users, color: "text-emerald-400" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-purple-400" },
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
            <BarChart3 size={18} className="text-amber-400" /> Portal Performance
          </h3>
          <ResponsiveContainer width="100%" height={350}>
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
              <Bar dataKey="views" name="Views" fill="#89AACC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inquiries" name="Inquiries" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" name="Leads" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <BarChart3 size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">No portal performance data yet. Data will appear once listings receive views.</p>
        </div>
      )}

      {/* Pie Chart + Cost Analysis Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lead Source Pie Chart */}
        <div className="rounded-2xl border border-stroke bg-surface p-5">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <Users size={18} className="text-emerald-400" /> Lead Sources
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 8%)",
                    border: "1px solid hsl(0 0% 12%)",
                    color: "hsl(0 0% 96%)",
                    borderRadius: 8,
                  }}
                />
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
              <p className="text-xs text-muted">No lead data available.</p>
            </div>
          )}
        </div>

        {/* Cost Analysis Card */}
        <div className="rounded-2xl border border-stroke bg-surface p-5">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-amber-400" /> Cost Analysis
          </h3>
          {costData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke text-left">
                    <th className="pb-2 text-xs font-semibold text-muted uppercase tracking-wider">Portal</th>
                    <th className="pb-2 text-xs font-semibold text-muted uppercase tracking-wider text-right">Fee</th>
                    <th className="pb-2 text-xs font-semibold text-muted uppercase tracking-wider text-right">Leads</th>
                    <th className="pb-2 text-xs font-semibold text-muted uppercase tracking-wider text-right">CPL</th>
                  </tr>
                </thead>
                <tbody>
                  {costData.map((row) => {
                    const cpl = row.leads > 0 ? (row.fee / row.leads).toFixed(2) : null;
                    return (
                      <tr key={row.slug} className="border-t border-stroke hover:bg-surface/50">
                        <td className="py-2 text-text-primary text-xs">{row.name}</td>
                        <td className="py-2 text-right text-xs text-muted">${row.fee}</td>
                        <td className="py-2 text-right text-xs font-semibold">{row.leads}</td>
                        <td className="py-2 text-right text-xs">
                          {cpl ? (
                            <span className={parseFloat(cpl) > 50 ? "text-red-400" : "text-emerald-400"}>
                              ${cpl}
                            </span>
                          ) : (
                            <span className="text-muted">N/A</span>
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
              <p className="text-xs text-muted">No cost data available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Listing Performance Table */}
      {sortedListings.length > 0 ? (
        <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-stroke">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Eye size={18} className="text-blue-400" /> Listing Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Portal</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Views</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Inquiries</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Leads</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Conv. Rate</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
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
                        {listing.properties?.internal_name || "Unknown"}
                      </td>
                      <td className="px-6 py-3 text-muted">
                        {listing.portals?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-3 text-right">{views.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">{inquiries.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-semibold">{leads.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">{convRate}%</td>
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
          <p className="text-muted">No listings yet. Create listings to track their performance across portals.</p>
        </div>
      )}
    </section>
  );
}
