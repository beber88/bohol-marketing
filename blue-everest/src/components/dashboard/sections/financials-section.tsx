"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DollarSign, TrendingUp, Cpu, Megaphone, Server,
  Wrench, RefreshCw, Play, AlertTriangle, Lightbulb,
  BarChart3,
} from "lucide-react";

interface CategoryTotals {
  ai_compute: number;
  advertising: number;
  infrastructure: number;
  tools: number;
  other: number;
  total: number;
}

interface AgentCostEntry {
  agent: string;
  total_cost: number;
  runs: number;
  avg_cost_per_run: number;
}

interface SavingsRecommendation {
  area: string;
  current_cost_usd?: number;
  suggested_action: string;
  estimated_savings_usd?: number;
  priority: string;
  rationale?: string;
}

interface FinancialData {
  totals: CategoryTotals;
  by_category: Record<string, number>;
  by_provider: Record<string, number>;
  agent_breakdown: AgentCostEntry[];
  budget_vs_actual: {
    campaign_budget: number;
    total_spent: number;
    remaining: number;
    ad_spend_pct: number;
    pacing: string;
  };
  leads: number;
  conversions: number;
  cost_per_lead: number | null;
  latest_analysis: {
    date: string;
    narrative: string;
    savings_recommendations: SavingsRecommendation[];
    roi_analysis: Record<string, unknown>;
  } | null;
  data_issues: string[];
}

const AGENT_DISPLAY: Record<string, string> = {
  cmo_orchestrator: "CMO",
  content_strategist: "Content",
  copywriter: "Copywriter",
  performance_ads: "Ads Manager",
  email_nurture: "Email",
  whatsapp_agent: "WhatsApp",
  crm_lead_scorer: "Lead Scorer",
  analytics_reporter: "Analytics",
  brand_guard: "Brand Guard",
  sales_chatbot: "Sales",
  financial_analyst: "Financial",
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof DollarSign; color: string }> = {
  ai_compute: { label: "AI Compute", icon: Cpu, color: "#8B5CF6" },
  advertising: { label: "Advertising", icon: Megaphone, color: "#3B82F6" },
  infrastructure: { label: "Infrastructure", icon: Server, color: "#10B981" },
  tools: { label: "Tools", icon: Wrench, color: "#F59E0B" },
  other: { label: "Other", icon: DollarSign, color: "#6B7280" },
};

export function FinancialsSection() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marketing/financials");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(normalizeFinancialData(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load financial data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/marketing/agents/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: "financial_analyst",
          query: "Generate comprehensive financial snapshot with savings recommendations and financial map.",
          trigger: "manual_dashboard",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Refresh data after analysis
      setTimeout(fetchData, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted" />
        <span className="ml-3 text-muted">Loading financial data...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-3" />
        <p className="text-red-400 font-medium">{error}</p>
        <button onClick={fetchData} className="mt-4 text-sm text-muted hover:text-white underline">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const pacingColor = data.budget_vs_actual.pacing === "on_track"
    ? "text-emerald-400"
    : data.budget_vs_actual.pacing === "warning"
      ? "text-amber-400"
      : "text-red-400";

  const totalProviders = Object.entries(data.by_provider)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Financial Overview</h2>
          <p className="text-sm text-muted mt-1">Total cost transparency across all operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-xl border border-stroke bg-surface px-4 py-2 text-sm font-medium hover:bg-surface/80 transition"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {analyzing ? "Analyzing..." : "Run Financial Analysis"}
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Operational Cost"
          value={`$${data.totals.total.toFixed(2)}`}
          icon={DollarSign}
          color="#89AACC"
        />
        <StatCard
          label="AI Compute"
          value={`$${data.totals.ai_compute.toFixed(2)}`}
          icon={Cpu}
          subtext={`${data.agent_breakdown.reduce((s, a) => s + a.runs, 0)} agent runs`}
          color="#8B5CF6"
        />
        <StatCard
          label="Ad Spend"
          value={`$${data.totals.advertising.toFixed(2)}`}
          icon={Megaphone}
          subtext={`${data.leads} leads`}
          color="#3B82F6"
        />
        <StatCard
          label="Infrastructure + Tools"
          value={`$${(data.totals.infrastructure + data.totals.tools).toFixed(2)}`}
          icon={Server}
          color="#10B981"
        />
      </div>

      {/* Budget vs Actual */}
      <div className="rounded-2xl border border-stroke bg-surface p-6">
        <h3 className="font-display text-base font-semibold mb-4">Budget vs Actual</h3>
        <div className="grid grid-cols-4 gap-6 text-center mb-4">
          <div>
            <div className="font-display text-2xl font-bold">${data.budget_vs_actual.campaign_budget}</div>
            <div className="text-xs text-muted mt-1">Campaign Budget</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold">${data.totals.advertising.toFixed(2)}</div>
            <div className="text-xs text-muted mt-1">Ad Spend</div>
          </div>
          <div>
            <div className={`font-display text-2xl font-bold ${pacingColor}`}>
              ${data.budget_vs_actual.remaining.toFixed(2)}
            </div>
            <div className="text-xs text-muted mt-1">Remaining</div>
          </div>
          <div>
            <div className={`font-display text-2xl font-bold ${pacingColor}`}>
              {data.budget_vs_actual.ad_spend_pct}%
            </div>
            <div className="text-xs text-muted mt-1">Utilized</div>
          </div>
        </div>
        <div className="h-3 rounded-full bg-bg overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.budget_vs_actual.pacing === "over_budget"
                ? "bg-red-500"
                : data.budget_vs_actual.pacing === "warning"
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-[#89AACC] to-[#4E85BF]"
            }`}
            style={{ width: `${Math.min(data.budget_vs_actual.ad_spend_pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>$0</span>
          <span className={pacingColor}>{data.budget_vs_actual.pacing.replace("_", " ").toUpperCase()}</span>
          <span>${data.budget_vs_actual.campaign_budget}</span>
        </div>
      </div>

      {/* Cost by Category + Cost by Provider side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cost by Category */}
        <div className="rounded-2xl border border-stroke bg-surface p-6">
          <h3 className="font-display text-base font-semibold mb-4">Cost by Category</h3>
          <div className="space-y-3">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const value = data.by_category[key] ?? 0;
              const pct = data.totals.total > 0 ? (value / data.totals.total) * 100 : 0;
              const Icon = config.icon;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: config.color }} />
                      <span>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted">{pct.toFixed(1)}%</span>
                      <span className="font-semibold">${value.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-bg overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: config.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost by Provider */}
        <div className="rounded-2xl border border-stroke bg-surface p-6">
          <h3 className="font-display text-base font-semibold mb-4">Cost by Provider</h3>
          {totalProviders.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No provider data yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="py-2 text-left text-xs text-muted">Provider</th>
                  <th className="py-2 text-right text-xs text-muted">Amount</th>
                  <th className="py-2 text-right text-xs text-muted">Share</th>
                </tr>
              </thead>
              <tbody>
                {totalProviders.map(([provider, amount]) => (
                  <tr key={provider} className="border-b border-stroke/50">
                    <td className="py-2.5 capitalize font-medium">{provider}</td>
                    <td className="py-2.5 text-right">${amount.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-muted">
                      {data.totals.total > 0 ? ((amount / data.totals.total) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="py-2.5">Total</td>
                  <td className="py-2.5 text-right">${data.totals.total.toFixed(2)}</td>
                  <td className="py-2.5 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Agent Cost Efficiency */}
      <div className="rounded-2xl border border-stroke bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-[#89AACC]" />
          <h3 className="font-display text-base font-semibold">Agent Cost Efficiency</h3>
        </div>
        {data.agent_breakdown.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">No agent runs recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="py-2 text-left text-xs text-muted">Agent</th>
                  <th className="py-2 text-right text-xs text-muted">Runs</th>
                  <th className="py-2 text-right text-xs text-muted">Total Cost</th>
                  <th className="py-2 text-right text-xs text-muted">Avg/Run</th>
                  <th className="py-2 text-right text-xs text-muted">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.agent_breakdown.map((agent) => (
                  <tr key={agent.agent} className="border-b border-stroke/50">
                    <td className="py-2.5 font-medium">
                      {AGENT_DISPLAY[agent.agent] ?? agent.agent}
                    </td>
                    <td className="py-2.5 text-right">{agent.runs}</td>
                    <td className="py-2.5 text-right">${agent.total_cost.toFixed(4)}</td>
                    <td className="py-2.5 text-right text-muted">${agent.avg_cost_per_run.toFixed(5)}</td>
                    <td className="py-2.5 text-right text-muted">
                      {data.totals.ai_compute > 0
                        ? ((agent.total_cost / data.totals.ai_compute) * 100).toFixed(1)
                        : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ROI Analysis */}
      <div className="rounded-2xl border border-stroke bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-400" />
          <h3 className="font-display text-base font-semibold">ROI Analysis</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-display text-2xl font-bold">{data.leads}</div>
            <div className="text-xs text-muted mt-1">Total Leads</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold">{data.conversions}</div>
            <div className="text-xs text-muted mt-1">Conversions</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold">
              {data.cost_per_lead !== null ? `$${data.cost_per_lead.toFixed(2)}` : "N/A"}
            </div>
            <div className="text-xs text-muted mt-1">Cost per Lead</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold">
              {data.totals.advertising > 0 && data.leads > 0
                ? `$${(data.totals.advertising / data.leads).toFixed(2)}`
                : "N/A"}
            </div>
            <div className="text-xs text-muted mt-1">Ad CPL</div>
          </div>
        </div>
      </div>

      {/* Savings Recommendations */}
      {data.latest_analysis?.savings_recommendations && data.latest_analysis.savings_recommendations.length > 0 && (
        <div className="rounded-2xl border border-stroke bg-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-400" />
            <h3 className="font-display text-base font-semibold">Savings Recommendations</h3>
            <span className="text-xs text-muted">
              (Analysis from {data.latest_analysis.date})
            </span>
          </div>
          <div className="space-y-3">
            {data.latest_analysis.savings_recommendations.map((rec, i) => (
              <div key={i} className="rounded-xl border border-stroke/50 bg-bg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        rec.priority === "high"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : rec.priority === "medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-sm font-semibold">{rec.area}</span>
                    </div>
                    <p className="text-sm text-muted">{rec.suggested_action}</p>
                    {rec.rationale && (
                      <p className="text-xs text-muted/70 mt-1">{rec.rationale}</p>
                    )}
                  </div>
                  {rec.estimated_savings_usd != null && rec.estimated_savings_usd > 0 && (
                    <div className="text-right ml-4">
                      <div className="text-sm font-bold text-emerald-400">
                        -${rec.estimated_savings_usd.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted">est. savings</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Narrative from latest analysis */}
      {data.latest_analysis?.narrative && (
        <div className="rounded-2xl border border-stroke bg-surface p-6">
          <h3 className="font-display text-base font-semibold mb-3">Financial Analyst Summary</h3>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
            {data.latest_analysis.narrative}
          </p>
          <p className="text-xs text-muted/60 mt-3">
            Analysis generated on {data.latest_analysis.date}
          </p>
        </div>
      )}

      {/* Data Quality Issues */}
      {data.data_issues.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <h4 className="text-sm font-semibold text-amber-400">Data Quality Issues</h4>
          </div>
          <ul className="space-y-1">
            {data.data_issues.map((issue, i) => (
              <li key={i} className="text-xs text-amber-300/80 flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-400 shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {data.totals.total === 0 && !data.latest_analysis && (
        <div className="rounded-2xl border border-stroke bg-surface p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted/30 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">No financial data yet</h3>
          <p className="text-sm text-muted mb-4">
            Run the Financial Analyst agent to generate your first cost report and savings recommendations.
          </p>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            <Play size={14} />
            Run First Analysis
          </button>
        </div>
      )}
    </div>
  );
}

function normalizeFinancialData(input: unknown): FinancialData {
  const source = (input && typeof input === "object" ? input : {}) as Partial<FinancialData>;
  const totals = source.totals ?? {
    ai_compute: 0,
    advertising: 0,
    infrastructure: 0,
    tools: 0,
    other: 0,
    total: 0,
  };
  const budget = source.budget_vs_actual ?? {
    campaign_budget: 900,
    total_spent: totals.total ?? 0,
    remaining: 900,
    ad_spend_pct: 0,
    pacing: "on_track",
  };

  return {
    totals: {
      ai_compute: Number(totals.ai_compute ?? 0),
      advertising: Number(totals.advertising ?? 0),
      infrastructure: Number(totals.infrastructure ?? 0),
      tools: Number(totals.tools ?? 0),
      other: Number(totals.other ?? 0),
      total: Number(totals.total ?? 0),
    },
    by_category: source.by_category ?? {},
    by_provider: source.by_provider ?? {},
    agent_breakdown: Array.isArray(source.agent_breakdown) ? source.agent_breakdown : [],
    budget_vs_actual: {
      campaign_budget: Number(budget.campaign_budget ?? 900),
      total_spent: Number(budget.total_spent ?? 0),
      remaining: Number(budget.remaining ?? 900),
      ad_spend_pct: Number(budget.ad_spend_pct ?? 0),
      pacing: String(budget.pacing ?? "on_track"),
    },
    leads: Number(source.leads ?? 0),
    conversions: Number(source.conversions ?? 0),
    cost_per_lead: typeof source.cost_per_lead === "number" ? source.cost_per_lead : null,
    latest_analysis: source.latest_analysis
      ? {
          date: String(source.latest_analysis.date ?? ""),
          narrative: String(source.latest_analysis.narrative ?? ""),
          savings_recommendations: Array.isArray(source.latest_analysis.savings_recommendations)
            ? source.latest_analysis.savings_recommendations
            : [],
          roi_analysis: source.latest_analysis.roi_analysis ?? {},
        }
      : null,
    data_issues: Array.isArray(source.data_issues) ? source.data_issues : [],
  };
}

function StatCard({
  label, value, icon: Icon, subtext, color,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-stroke bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      {subtext && <div className="text-[10px] text-muted/70 mt-0.5">{subtext}</div>}
    </div>
  );
}
