"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList, CheckCircle2, XCircle, AlertTriangle,
  Clock, Bot, Zap, Target, Users, MessageCircle, PenTool,
  BarChart3, Shield, Mail, Phone, RefreshCw, Loader2,
} from "lucide-react";

/* ── Types ─────────────────────────────────────── */

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

interface Lead {
  id: string;
  source: string;
  full_name: string | null;
  lead_score: number;
  lead_status: string;
  funnel_stage: string;
  preferred_language: string | null;
  raw_data: {
    conversations?: { role: string; content: string; timestamp?: string }[];
    signals?: string[];
    chatbot_session_id?: string;
    last_message_at?: string;
  };
  created_at: string;
  updated_at: string;
}

interface AgentDailyReport {
  agent: string;
  displayName: string;
  icon: typeof Bot;
  status: "active" | "idle" | "no_data";
  tasksCompleted: number;
  tasksTotal: number;
  kpis: { label: string; value: string; target: string; met: boolean }[];
  activities: string[];
  issues: string[];
  costToday: number;
}

/* ── Agent Metadata ───────────────────────────── */

const AGENT_META: Record<string, { displayName: string; icon: typeof Bot }> = {
  cmo_orchestrator: { displayName: "CMO Orchestrator", icon: Bot },
  content_strategist: { displayName: "Content Strategist", icon: Target },
  copywriter: { displayName: "Copywriter", icon: PenTool },
  performance_ads: { displayName: "Performance Ads", icon: BarChart3 },
  email_nurture: { displayName: "Email Nurture", icon: Mail },
  whatsapp_agent: { displayName: "WhatsApp Agent", icon: Phone },
  crm_lead_scorer: { displayName: "CRM Lead Scorer", icon: Users },
  analytics_reporter: { displayName: "Analytics Reporter", icon: BarChart3 },
  brand_guard: { displayName: "Brand Guard", icon: Shield },
  sales_chatbot: { displayName: "David (Sales)", icon: MessageCircle },
};

/* ── Helper: Build reports from real data ─────── */

function buildReports(runs: AgentRun[], leads: Lead[]): AgentDailyReport[] {
  const today = new Date().toISOString().slice(0, 10);

  // Chatbot leads from today
  const chatbotLeads = leads.filter(
    (l) => l.source === "chatbot" && l.created_at?.slice(0, 10) === today
  );
  const hotLeadsToday = chatbotLeads.filter((l) => l.lead_status === "hot");
  const warmLeadsToday = chatbotLeads.filter((l) => l.lead_status === "warm");

  // All chatbot leads (any date)
  const allChatbotLeads = leads.filter((l) => l.source === "chatbot");
  const allHotLeads = allChatbotLeads.filter((l) => l.lead_status === "hot");

  // Agent runs grouped by agent_id, filtered to today
  const todayRuns = runs.filter((r) => r.created_at?.slice(0, 10) === today);
  const runsByAgent: Record<string, AgentRun[]> = {};
  for (const run of todayRuns) {
    const key = run.agent_id || "unknown";
    if (!runsByAgent[key]) runsByAgent[key] = [];
    runsByAgent[key].push(run);
  }

  const reports: AgentDailyReport[] = [];

  for (const [agentKey, meta] of Object.entries(AGENT_META)) {
    const agentRuns = runsByAgent[agentKey] || [];
    const completedRuns = agentRuns.filter((r) => r.status === "complete" || r.status === "success");
    const agentCost = agentRuns.reduce((s, r) => s + (Number(r.total_cost_usd) || 0), 0);

    // Special handling for sales_chatbot - use lead data
    if (agentKey === "sales_chatbot") {
      const convCount = allChatbotLeads.length;
      const hasActivity = convCount > 0 || agentRuns.length > 0;

      const activities: string[] = [];
      // Show recent chatbot conversations as activities
      for (const lead of chatbotLeads.slice(0, 8)) {
        const lang = lead.preferred_language === "he" ? "Hebrew" : "English";
        const preview = lead.raw_data?.conversations
          ?.filter((m) => m.role === "user")
          .slice(-1)[0]?.content?.slice(0, 60);
        const time = lead.created_at
          ? new Date(lead.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : "";
        const status = lead.lead_status === "hot" ? "HOT" : lead.lead_status === "warm" ? "WARM" : "NEW";
        activities.push(
          `${time} - ${lang} visitor (score ${lead.lead_score}, ${status})${preview ? `: "${preview}..."` : ""}`
        );
      }
      // Also include any older leads not from today
      if (allChatbotLeads.length > chatbotLeads.length) {
        activities.push(`+ ${allChatbotLeads.length - chatbotLeads.length} conversations from previous days`);
      }

      reports.push({
        agent: agentKey,
        displayName: meta.displayName,
        icon: meta.icon,
        status: hasActivity ? "active" : "no_data",
        tasksCompleted: convCount,
        tasksTotal: convCount,
        kpis: [
          { label: "Conversations", value: String(convCount), target: "N/A", met: true },
          { label: "HOT leads", value: String(allHotLeads.length), target: "1+", met: allHotLeads.length >= 1 },
          { label: "Leads qualified", value: String(allChatbotLeads.filter((l) => l.lead_status !== "cold").length), target: "N/A", met: true },
        ],
        activities: activities.length > 0 ? activities : ["No chatbot conversations yet. Leads will appear here when visitors use the chat."],
        issues: [],
        costToday: agentCost,
      });
      continue;
    }

    // Special handling for crm_lead_scorer
    if (agentKey === "crm_lead_scorer") {
      const scoredCount = allChatbotLeads.length;
      const hasActivity = scoredCount > 0 || agentRuns.length > 0;

      const activities: string[] = [];
      if (hotLeadsToday.length > 0) {
        activities.push(`Triggered HOT alert for ${hotLeadsToday.length} lead(s) today`);
      }
      if (warmLeadsToday.length > 0) {
        activities.push(`Scored ${warmLeadsToday.length} warm lead(s) today`);
      }
      if (chatbotLeads.length > 0) {
        activities.push(`Total ${chatbotLeads.length} leads scored today`);
      }

      reports.push({
        agent: agentKey,
        displayName: meta.displayName,
        icon: meta.icon,
        status: hasActivity ? "active" : "no_data",
        tasksCompleted: scoredCount,
        tasksTotal: scoredCount,
        kpis: [
          { label: "Leads scored", value: String(scoredCount), target: "All new", met: true },
          { label: "HOT detected", value: String(allHotLeads.length), target: "N/A", met: true },
          { label: "Alert sent", value: String(allHotLeads.length), target: "All HOT", met: true },
        ],
        activities: activities.length > 0 ? activities : ["No leads scored yet. Scoring happens automatically when visitors use the chat."],
        issues: [],
        costToday: agentCost,
      });
      continue;
    }

    // Generic agent report from agent_runs
    const hasRuns = agentRuns.length > 0;
    const activities = agentRuns.slice(0, 5).map((run) => {
      const time = new Date(run.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const summary =
        typeof run.output === "object" && run.output !== null
          ? (run.output as Record<string, unknown>).summary || (run.output as Record<string, unknown>).output_summary || run.triggered_by || run.status
          : run.status;
      return `${time} - ${String(summary).slice(0, 100)}`;
    });

    reports.push({
      agent: agentKey,
      displayName: meta.displayName,
      icon: meta.icon,
      status: hasRuns ? "active" : "no_data",
      tasksCompleted: completedRuns.length,
      tasksTotal: agentRuns.length,
      kpis: [
        { label: "Runs today", value: String(agentRuns.length), target: "N/A", met: true },
        { label: "Success rate", value: agentRuns.length > 0 ? `${Math.round((completedRuns.length / agentRuns.length) * 100)}%` : "-", target: "90%+", met: agentRuns.length === 0 || completedRuns.length / agentRuns.length >= 0.9 },
      ],
      activities: activities.length > 0 ? activities : ["No runs today. Agent is ready and waiting for tasks."],
      issues: [],
      costToday: agentCost,
    });
  }

  return reports;
}

/* ── Component ─────────────────────────────────── */

export function AgentReportsSection() {
  const [reports, setReports] = useState<AgentDailyReport[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [runsRes, leadsRes] = await Promise.all([
        fetch("/api/marketing/agents?limit=100"),
        fetch("/api/marketing/leads?limit=100"),
      ]);

      const runsData = await runsRes.json();
      const leadsData = await leadsRes.json();

      const builtReports = buildReports(
        runsData.runs || [],
        leadsData.leads || []
      );
      setReports(builtReports);
    } catch {
      // If APIs fail (e.g. Supabase not configured), show empty state
      setReports(
        Object.entries(AGENT_META).map(([key, meta]) => ({
          agent: key,
          displayName: meta.displayName,
          icon: meta.icon,
          status: "no_data" as const,
          tasksCompleted: 0,
          tasksTotal: 0,
          kpis: [],
          activities: ["Database not connected. Configure Supabase to see real data."],
          issues: ["Supabase connection required"],
          costToday: 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const activeCount = reports.filter((r) => r.status === "active").length;
  const noDataCount = reports.filter((r) => r.status === "no_data").length;
  const totalTasks = reports.reduce((s, r) => s + r.tasksTotal, 0);
  const completedTasks = reports.reduce((s, r) => s + r.tasksCompleted, 0);
  const totalCost = reports.reduce((s, r) => s + r.costToday, 0);
  const failedKpis = reports.reduce((s, r) => s + r.kpis.filter((k) => !k.met).length, 0);

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
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <ClipboardList size={18} className="text-[#89AACC]" /> Agent Daily Reports
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
          <p className="font-display text-xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-[9px] text-muted">Active</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
          <p className="font-display text-xl font-bold text-white/30">{noDataCount}</p>
          <p className="text-[9px] text-muted">No Data</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
          <p className="font-display text-xl font-bold">{completedTasks}/{totalTasks}</p>
          <p className="text-[9px] text-muted">Tasks Done</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
          <p className="font-display text-xl font-bold text-red-400">{failedKpis}</p>
          <p className="text-[9px] text-muted">Failed KPIs</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
          <p className="font-display text-xl font-bold">${totalCost.toFixed(3)}</p>
          <p className="text-[9px] text-muted">Cost Today</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
          <p className="font-display text-xl font-bold text-[#89AACC]">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</p>
          <p className="text-[9px] text-muted">Completion</p>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-2">
        {reports.map((report) => {
          const Icon = report.icon;
          const isExpanded = expandedAgent === report.agent;
          const allKpisMet = report.kpis.length === 0 || report.kpis.every((k) => k.met);
          const hasIssues = report.issues.length > 0;
          const completionRate = report.tasksTotal > 0 ? Math.round((report.tasksCompleted / report.tasksTotal) * 100) : 0;

          return (
            <div key={report.agent} className="bg-surface rounded-xl border border-stroke overflow-hidden">
              {/* Summary Row */}
              <button
                onClick={() => setExpandedAgent(isExpanded ? null : report.agent)}
                className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                {/* Status dot */}
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  report.status === "active" ? "bg-emerald-400" :
                  report.status === "idle" ? "bg-amber-400" :
                  "bg-white/20"
                }`} />

                {/* Icon + Name */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Icon size={14} className={report.status === "active" ? "text-[#89AACC]" : "text-muted/40"} />
                  <span className="text-sm font-semibold">{report.displayName}</span>
                </div>

                {/* Progress bar */}
                <div className="flex-1 max-w-[150px] hidden sm:block">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      report.status === "no_data" ? "bg-white/10" :
                      completionRate === 100 ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                      style={{ width: `${report.status === "no_data" ? 0 : Math.max(completionRate, 5)}%` }} />
                  </div>
                </div>

                {/* Tasks */}
                <span className="text-xs text-muted shrink-0">
                  {report.status === "no_data" ? "-" : `${report.tasksCompleted}/${report.tasksTotal}`}
                </span>

                {/* KPI status */}
                {report.kpis.length > 0 ? (
                  allKpisMet ? (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  )
                ) : (
                  <div className="w-[14px] shrink-0" />
                )}

                {/* Issues badge */}
                {hasIssues && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400 shrink-0">
                    {report.issues.length} issues
                  </span>
                )}

                {/* Cost */}
                <span className="text-[10px] text-muted shrink-0">${report.costToday.toFixed(3)}</span>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-stroke px-5 py-4 space-y-4">
                  {/* KPIs */}
                  {report.kpis.length > 0 && (
                    <div>
                      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">KPIs</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {report.kpis.map((kpi, i) => (
                          <div key={i} className={`rounded-lg border px-3 py-2 ${
                            kpi.met ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted">{kpi.label}</span>
                              {kpi.met ? <CheckCircle2 size={10} className="text-emerald-400" /> : <XCircle size={10} className="text-red-400" />}
                            </div>
                            <p className="text-sm font-bold mt-0.5">{kpi.value} <span className="text-[9px] text-muted font-normal">/ {kpi.target}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity Log */}
                  {report.activities.length > 0 && (
                    <div>
                      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Activity Log</label>
                      <div className="mt-2 space-y-1">
                        {report.activities.map((a, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Zap size={10} className={`mt-1 shrink-0 ${report.status === "active" ? "text-[#89AACC]" : "text-muted/30"}`} />
                            <p className="text-xs text-text-primary">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {report.issues.length > 0 && (
                    <div>
                      <label className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Issues</label>
                      <div className="mt-2 space-y-1">
                        {report.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                            <AlertTriangle size={10} className="text-red-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-red-300">{issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-muted hover:text-white transition-colors">
                      <Clock size={12} /> View History
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
