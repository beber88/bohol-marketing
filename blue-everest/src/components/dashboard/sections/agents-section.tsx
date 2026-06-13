"use client";

import { useState, useEffect } from "react";
import {
  Bot, Brain, PenTool, TrendingUp, Mail, MessageSquare,
  Users, BarChart3, Shield, MessageCircle, Play, Loader2,
  Clock, DollarSign, Zap, Activity, RefreshCw,
} from "lucide-react";

interface AgentRun {
  id: string;
  agent_id: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  triggered_by: string;
  total_cost_usd: number;
  total_tokens: number;
  latency_ms: number;
  started_at: string;
  completed_at: string;
  created_at: string;
}

const AGENT_ICONS: Record<string, typeof Bot> = {
  cmo_orchestrator: Brain, content_strategist: PenTool, copywriter: PenTool,
  performance_ads: TrendingUp, email_nurture: Mail, whatsapp_agent: MessageSquare,
  crm_lead_scorer: Users, analytics_reporter: BarChart3, brand_guard: Shield,
  sales_chatbot: MessageCircle,
  financial_analyst: DollarSign,
};

const AGENT_NAMES: Record<string, string> = {
  cmo_orchestrator: "CMO", content_strategist: "Content", copywriter: "Copywriter",
  performance_ads: "Ads", email_nurture: "Email", whatsapp_agent: "WhatsApp",
  crm_lead_scorer: "CRM", analytics_reporter: "Analytics", brand_guard: "Brand Guard",
  sales_chatbot: "Chatbot",
  financial_analyst: "Financial",
};

export function AgentsSection() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [runningWorkday, setRunningWorkday] = useState(false);

  const fetchRuns = () => {
    setLoading(true);
    fetch("/api/marketing/agents")
      .then((r) => r.json())
      .then((d) => { setRuns(d.runs || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRuns(); }, []);

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      await fetch("/api/marketing/agents/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "Daily review: check campaigns, leads, and recommend actions", trigger: "manual" }),
      });
      setTimeout(() => { fetchRuns(); setDispatching(false); }, 3000);
    } catch { setDispatching(false); }
  };

  const handleWorkday = async () => {
    setRunningWorkday(true);
    try {
      await fetch("/api/cron/agent-workday");
      fetchRuns();
    } finally {
      setRunningWorkday(false);
    }
  };

  // Aggregate stats per agent
  const agentStats = Object.keys(AGENT_NAMES).map((name) => {
    const agentRuns = runs.filter((r) => r.agent_id === name);
    return {
      name,
      displayName: AGENT_NAMES[name],
      runs: agentRuns.length,
      cost: agentRuns.reduce((s, r) => s + (Number(r.total_cost_usd) || 0), 0),
      lastRun: agentRuns[0]?.created_at,
      status: agentRuns.some((r) => r.status === "running") ? "active" : "ready",
    };
  });

  const totalRuns = runs.length;
  const totalCost = runs.reduce((s, r) => s + (Number(r.total_cost_usd) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Bot size={18} className="text-emerald-400" /> AI Agents
          </h2>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted">{totalRuns} runs</span>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">${totalCost.toFixed(4)} cost</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRuns} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleDispatch}
            disabled={dispatching}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {dispatching ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {dispatching ? "Running..." : "Dispatch CMO"}
          </button>
          <button
            onClick={handleWorkday}
            disabled={runningWorkday}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-50"
          >
            {runningWorkday ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {runningWorkday ? "Working..." : "Run Workday"}
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Zap className="mx-auto mb-1.5 text-amber-400" size={18} />
          <p className="font-display text-2xl font-bold">{totalRuns}</p>
          <p className="text-[10px] text-muted">Total Runs</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Activity className="mx-auto mb-1.5 text-emerald-400" size={18} />
          <p className="font-display text-2xl font-bold">{Object.keys(AGENT_NAMES).length}</p>
          <p className="text-[10px] text-muted">Agents Ready</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <DollarSign className="mx-auto mb-1.5 text-[#89AACC]" size={18} />
          <p className="font-display text-2xl font-bold">${totalCost.toFixed(4)}</p>
          <p className="text-[10px] text-muted">Total Cost</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Bot className="mx-auto mb-1.5 text-purple-400" size={18} />
          <p className="font-display text-2xl font-bold">{agentStats.filter((a) => a.runs > 0).length}</p>
          <p className="text-[10px] text-muted">Active Agents</p>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {agentStats.map((agent) => {
          const Icon = AGENT_ICONS[agent.name] || Bot;
          return (
            <div key={agent.name} className="bg-surface rounded-lg border border-stroke p-3 text-center hover:border-[#4E85BF]/30 transition-colors">
              <Icon size={14} className={`mx-auto mb-1.5 ${agent.runs > 0 ? "text-emerald-400" : "text-muted"}`} />
              <p className="text-[10px] font-semibold truncate">{agent.displayName}</p>
              <p className="text-[9px] text-muted">{agent.runs} runs</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className={`h-1.5 w-1.5 rounded-full ${agent.runs > 0 ? "bg-emerald-400" : "bg-white/20"}`} />
                <span className="text-[8px] text-muted">{agent.runs > 0 ? "Active" : "Ready"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Runs Table */}
      {runs.length > 0 ? (
        <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <div className="px-6 py-4 border-b border-stroke">
            <h3 className="text-sm font-semibold">Recent Runs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke text-left text-xs text-muted">
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Agent</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Cost</th>
                  <th className="px-6 py-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 20).map((run) => (
                  <tr key={run.id} className="border-b border-stroke/50 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-xs text-muted whitespace-nowrap">
                      {new Date(run.created_at).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-3 font-medium whitespace-nowrap">{AGENT_NAMES[run.agent_id] || run.agent_id}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        run.status === "complete" || run.status === "success" ? "bg-emerald-500/20 text-emerald-400" :
                        run.status === "running" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>{run.status}</span>
                    </td>
                    <td className="px-6 py-3 text-muted text-xs">{run.latency_ms ? `${(run.latency_ms / 1000).toFixed(1)}s` : "-"}</td>
                    <td className="px-6 py-3 text-muted text-xs">${Number(run.total_cost_usd || 0).toFixed(4)}</td>
                    <td className="px-6 py-3 text-muted text-xs max-w-[250px] truncate">{(run.output as Record<string, unknown>)?.summary as string || run.triggered_by || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <Bot size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">No agent runs yet. Click "Dispatch CMO" to trigger the first run.</p>
          <p className="text-xs text-muted/50 mt-2">Agents will also run automatically via scheduled Inngest functions.</p>
        </div>
      )}
    </section>
  );
}
