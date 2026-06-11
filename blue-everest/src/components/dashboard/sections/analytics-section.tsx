"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2, RefreshCw, TrendingUp, DollarSign, Users, Eye } from "lucide-react";

interface MetricRow {
  date: string;
  channel: string;
  market: string;
  impressions: number;
  clicks: number;
  spend_cents: number;
  leads_count: number;
  ctr: number;
  cpl_cents: number;
}

export function AnalyticsSection() {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = () => {
    setLoading(true);
    fetch("/api/marketing/metrics")
      .then((r) => r.json())
      .then((d) => { setMetrics(d.metrics || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMetrics(); }, []);

  const totals = {
    impressions: metrics.reduce((s, m) => s + (m.impressions || 0), 0),
    clicks: metrics.reduce((s, m) => s + (m.clicks || 0), 0),
    spend: metrics.reduce((s, m) => s + (m.spend_cents || 0), 0) / 100,
    leads: metrics.reduce((s, m) => s + (m.leads_count || 0), 0),
  };
  const avgCtr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : "0";
  const avgCpl = totals.leads > 0 ? (totals.spend / totals.leads).toFixed(0) : "0";

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted" size={32} /></div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <BarChart3 size={18} className="text-amber-400" /> Analytics
        </h2>
        <button onClick={fetchMetrics} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"><RefreshCw size={16} /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Impressions", value: totals.impressions.toLocaleString(), icon: Eye, color: "text-blue-400" },
          { label: "Clicks", value: totals.clicks.toLocaleString(), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Spend", value: `$${totals.spend.toFixed(0)}`, icon: DollarSign, color: "text-amber-400" },
          { label: "Leads", value: totals.leads.toString(), icon: Users, color: "text-purple-400" },
          { label: "Avg CTR", value: `${avgCtr}%`, icon: TrendingUp, color: "text-[#89AACC]" },
          { label: "Avg CPL", value: `$${avgCpl}`, icon: DollarSign, color: "text-red-400" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-surface rounded-xl border border-stroke p-4 text-center">
              <Icon size={16} className={`mx-auto mb-2 ${kpi.color}`} />
              <p className="font-display text-xl font-bold">{kpi.value}</p>
              <p className="text-[10px] text-muted mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {metrics.length > 0 ? (
        <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <div className="px-6 py-4 border-b border-stroke"><h3 className="text-sm font-semibold">Daily Metrics</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke text-left text-xs text-muted">
                  <th className="px-6 py-3">Date</th><th className="px-6 py-3">Channel</th><th className="px-6 py-3">Market</th>
                  <th className="px-6 py-3">Impressions</th><th className="px-6 py-3">Clicks</th><th className="px-6 py-3">CTR</th>
                  <th className="px-6 py-3">Spend</th><th className="px-6 py-3">Leads</th><th className="px-6 py-3">CPL</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice(0, 30).map((m, i) => (
                  <tr key={i} className="border-b border-stroke/50 hover:bg-white/[0.02]">
                    <td className="px-6 py-3">{m.date}</td><td className="px-6 py-3 text-muted">{m.channel}</td><td className="px-6 py-3 text-muted">{m.market}</td>
                    <td className="px-6 py-3">{m.impressions.toLocaleString()}</td><td className="px-6 py-3">{m.clicks}</td><td className="px-6 py-3">{m.ctr ? `${m.ctr}%` : "-"}</td>
                    <td className="px-6 py-3">${(m.spend_cents / 100).toFixed(2)}</td><td className="px-6 py-3">{m.leads_count}</td><td className="px-6 py-3">{m.cpl_cents ? `$${(m.cpl_cents / 100).toFixed(0)}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <BarChart3 size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">No metrics data yet. Data will flow in once campaigns are activated.</p>
          <p className="text-xs text-muted/50 mt-2">Sources: Meta Ads Manager, Google Ads, GA4, Brevo, WATI</p>
        </div>
      )}
    </section>
  );
}
