"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Loader2,
  Globe,
  DollarSign,
  RefreshCw,
  Pause,
  Play,
  AlertTriangle,
  TrendingUp,
  Eye,
  MousePointer,
  Target,
} from "lucide-react";

// --- Types ---

interface Campaign {
  id: string;
  name: string;
  channel: string;
  market: string;
  status: string;
  primary_objective: string;
  daily_budget_cents: number;
  lifetime_budget_cents: number;
}

interface MetaCampaign {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  reach: number;
  leads: number;
  link_clicks: number;
}

interface MetaAdSet {
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  reach: number;
}

interface MetaTotals {
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  leads: number;
  ctr: number;
  cpc: number;
  cpl: number;
}

// --- Constants ---

import { FX_RATES, BUDGET } from "@/lib/data/dashboard-data";

const TOTAL_BUDGET = BUDGET.totalUsd;
const PHP_TO_USD = FX_RATES.phpUsd;

const MARKET_COLORS: Record<string, string> = {
  IL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PH: "bg-green-500/20 text-green-400 border-green-500/30",
  INTL: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-white/5 text-muted",
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  completed: "bg-blue-500/20 text-blue-400",
  error: "bg-red-500/20 text-red-400",
  unsettled: "bg-red-500/20 text-red-400",
};

// --- Known Meta Campaigns (from campaign_state.json) ---

const KNOWN_CAMPAIGNS = [
  { id: "120246990233390326", name: "IL-1 Awareness", market: "IL", daily_php: 1200 },
  { id: "120246990234490326", name: "PH-1 Awareness", market: "PH", daily_php: 850 },
];

const KNOWN_ADSETS = [
  { id: "120246991876370326", name: "IL-1A Aerial Hook", campaign: "IL-1" },
  { id: "120246992434990326", name: "IL-1B Rear Villa Hook", campaign: "IL-1" },
  { id: "120246992582890326", name: "PH-1A Aerial Hook", campaign: "PH-1" },
  { id: "120246992674570326", name: "PH-1B Pool Villa Hook", campaign: "PH-1" },
];

// --- Component ---

export function CampaignsSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaign[]>([]);
  const [metaAdSets, setMetaAdSets] = useState<MetaAdSet[]>([]);
  const [metaTotals, setMetaTotals] = useState<MetaTotals | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState("last_7d");

  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    fetch("/api/marketing/campaigns")
      .then((r) => r.json())
      .then((d) => {
        setCampaigns(d.campaigns || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchMetaMetrics = useCallback(() => {
    setMetaLoading(true);
    setMetaError(null);
    fetch(`/api/marketing/metrics/meta?date_preset=${datePreset}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error && d.fallback) {
          setMetaError(d.error);
        }
        setMetaCampaigns(d.campaigns || []);
        setMetaAdSets(d.adsets || []);
        setMetaTotals(d.totals || null);
        setMetaLoading(false);
      })
      .catch((e) => {
        setMetaError(String(e));
        setMetaLoading(false);
      });
  }, [datePreset]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    fetchMetaMetrics();
  }, [fetchMetaMetrics]);

  const handleCampaignAction = async (campaignId: string, action: "pause" | "resume") => {
    setActionLoading(campaignId);
    try {
      await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // Refresh metrics after action
      fetchMetaMetrics();
    } catch (e) {
      console.error("Campaign action failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const totalSpendUsd = metaTotals ? metaTotals.spend * PHP_TO_USD : 0;
  const budgetPct = Math.min((totalSpendUsd / TOTAL_BUDGET) * 100, 100);
  const isOverBudget = totalSpendUsd > TOTAL_BUDGET;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Megaphone size={18} className="text-[#89AACC]" /> Live Campaigns
          </h2>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted">
            {KNOWN_CAMPAIGNS.length} Meta + {campaigns.length} DB
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_3d">Last 3 days</option>
            <option value="last_7d">Last 7 days</option>
            <option value="last_14d">Last 14 days</option>
            <option value="last_30d">Last 30 days</option>
          </select>
          <button
            onClick={() => { fetchCampaigns(); fetchMetaMetrics(); }}
            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Budget meter */}
      <div className="bg-surface rounded-xl border border-stroke p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold flex items-center gap-2">
            <DollarSign size={14} /> Budget: ${totalSpendUsd.toFixed(2)} / ${TOTAL_BUDGET}
          </span>
          <span className={`text-xs font-bold ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}>
            {budgetPct.toFixed(1)}% used
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${isOverBudget ? "bg-red-500" : budgetPct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted">
          <span>Remaining: ${(TOTAL_BUDGET - totalSpendUsd).toFixed(2)}</span>
          <span>15-day campaign</span>
        </div>
      </div>

      {/* Meta account warning */}
      {metaError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Meta Ad Account Issue</p>
            <p className="text-xs text-red-300/70 mt-1">{metaError}</p>
            <p className="text-xs text-muted mt-2">
              Go to business.facebook.com &gt; Billing to resolve the payment issue. Campaigns will start delivering once the balance is settled.
            </p>
          </div>
        </div>
      )}

      {/* Totals cards */}
      {metaTotals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard icon={<Eye size={14} />} label="Impressions" value={metaTotals.impressions.toLocaleString()} />
          <MetricCard icon={<MousePointer size={14} />} label="Clicks" value={metaTotals.clicks.toLocaleString()} sub={`${metaTotals.ctr.toFixed(2)}% CTR`} />
          <MetricCard icon={<DollarSign size={14} />} label="Spend (PHP)" value={`₱${metaTotals.spend.toLocaleString()}`} sub={`$${totalSpendUsd.toFixed(2)} USD`} />
          <MetricCard icon={<Target size={14} />} label="Reach" value={metaTotals.reach.toLocaleString()} sub={`${metaTotals.leads} leads`} />
        </div>
      )}

      {/* Meta Live Campaigns */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-[#89AACC]" /> Meta Ads - Live
          {metaLoading && <Loader2 size={14} className="animate-spin text-muted" />}
        </h3>

        {KNOWN_CAMPAIGNS.map((kc) => {
          const live = metaCampaigns.find((mc) => mc.campaign_id === kc.id);
          const adSets = metaAdSets.filter((as) => as.campaign_id === kc.id);
          const hasData = !!live;
          const noDelivery = hasData && live.impressions === 0;

          return (
            <div key={kc.id} className="bg-surface rounded-xl border border-stroke p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{kc.name}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${MARKET_COLORS[kc.market]}`}>
                    {kc.market}
                  </span>
                  {noDelivery && (
                    <span className="rounded-full bg-red-500/20 text-red-400 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle size={10} /> No delivery
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCampaignAction(kc.id, "pause")}
                    disabled={actionLoading === kc.id}
                    className="p-1.5 rounded-lg hover:bg-amber-500/10 text-muted hover:text-amber-400 transition-colors"
                    title="Pause campaign"
                  >
                    {actionLoading === kc.id ? <Loader2 size={14} className="animate-spin" /> : <Pause size={14} />}
                  </button>
                  <button
                    onClick={() => handleCampaignAction(kc.id, "resume")}
                    disabled={actionLoading === kc.id}
                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted hover:text-emerald-400 transition-colors"
                    title="Resume campaign"
                  >
                    <Play size={14} />
                  </button>
                </div>
              </div>

              {/* Campaign metrics */}
              {hasData ? (
                <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                  <MiniStat label="Impressions" value={live.impressions.toLocaleString()} />
                  <MiniStat label="Clicks" value={live.clicks.toLocaleString()} />
                  <MiniStat label="CTR" value={`${live.ctr.toFixed(2)}%`} />
                  <MiniStat label="Spend" value={`₱${live.spend.toFixed(0)}`} />
                </div>
              ) : (
                <p className="text-xs text-muted mb-3">No metrics data yet - campaign may not be delivering</p>
              )}

              {/* Ad sets breakdown */}
              {adSets.length > 0 && (
                <div className="space-y-1.5">
                  {adSets.map((as) => {
                    const known = KNOWN_ADSETS.find((k) => k.id === as.adset_id);
                    return (
                      <div key={as.adset_id} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-1.5 text-[11px]">
                        <span className="text-muted">{known?.name || as.adset_name}</span>
                        <div className="flex items-center gap-3 text-muted">
                          <span>{as.impressions.toLocaleString()} imp</span>
                          <span>{as.clicks} clicks</span>
                          <span>{as.ctr.toFixed(2)}%</span>
                          <span>₱{as.spend.toFixed(0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show known ad sets even without data */}
              {adSets.length === 0 && (
                <div className="space-y-1.5">
                  {KNOWN_ADSETS.filter((k) => k.campaign === kc.name.split(" ")[0]).map((k) => (
                    <div key={k.id} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-1.5 text-[11px]">
                      <span className="text-muted">{k.name}</span>
                      <span className="text-muted">Awaiting delivery</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DB Campaigns (Supabase) */}
      {campaigns.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Globe size={14} className="text-muted" /> Campaign Plans (Database)
            {loading && <Loader2 size={14} className="animate-spin text-muted" />}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns.map((c) => (
              <div key={c.id} className="bg-surface rounded-xl border border-stroke p-4 hover:border-[#4E85BF]/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold pr-2">{c.name}</h4>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[c.status] || STATUS_COLORS.draft}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-muted">{c.channel}</span>
                  <span className={`rounded px-2 py-0.5 text-[11px] border ${MARKET_COLORS[c.market] || "bg-white/5 text-muted border-white/10"}`}>
                    {c.market}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <DollarSign size={10} />
                    {(c.lifetime_budget_cents || 0) > 0 ? `$${(c.lifetime_budget_cents / 100).toFixed(0)} total` : "Free"}
                  </span>
                  {(c.daily_budget_cents || 0) > 0 && <span>${(c.daily_budget_cents / 100).toFixed(0)}/day</span>}
                </div>
                <p className="text-[11px] text-muted mt-2">{c.primary_objective}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary footer */}
      <div className="bg-surface rounded-xl border border-stroke p-4 flex flex-wrap gap-6 text-sm">
        <div><span className="text-muted">Meta Campaigns:</span> <strong>{KNOWN_CAMPAIGNS.length}</strong></div>
        <div><span className="text-muted">Ad Sets:</span> <strong>{KNOWN_ADSETS.length}</strong></div>
        <div><span className="text-muted">Total Budget:</span> <strong>${TOTAL_BUDGET}</strong></div>
        <div><span className="text-muted">Spent:</span> <strong className={totalSpendUsd > 0 ? "text-emerald-400" : "text-red-400"}>${totalSpendUsd.toFixed(2)}</strong></div>
        <div><span className="text-muted">Markets:</span> <strong>IL + PH</strong></div>
      </div>
    </section>
  );
}

// --- Sub-components ---

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-muted mb-1">{icon}<span className="text-[10px]">{label}</span></div>
      <p className="text-lg font-bold">{value}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/3 rounded-lg py-1">
      <p className="text-[10px] text-muted">{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}
