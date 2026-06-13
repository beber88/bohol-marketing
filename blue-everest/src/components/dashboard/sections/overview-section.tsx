"use client";

import {
  AlertTriangle, CheckCircle2, CircleDollarSign, Play,
  Users, Calendar, Bot, Globe, Megaphone, ExternalLink,
  Video, Zap, MessageCircle, Shield, Mail, TrendingUp,
  BarChart3, PenTool, Brain, Phone, FileText, Eye,
  Map, MessageSquare,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { COMPLETED_ITEMS, BUDGET, CAMPAIGNS } from "@/lib/data/dashboard-data";
import { SITE_CONFIG } from "@/lib/config";
import { useTranslation } from "@/lib/i18n";

const VIDEOS = [
  { title: "Villa Overview", id: "1yEuBI36PmRm9uHQXwxR1nLGkEkfCW3RV", size: "67MB" },
  { title: "Full Property Tour", id: "1JmciI7ev9XVwWCh3CnL0UN2Sbz_Y8bBZ", size: "89MB" },
  { title: "Location & Beach", id: "1c5opYji9O7yuESFhm6jdU9yDUy-zKy9F", size: "24MB" },
  { title: "Interior Design", id: "12B5eik_L9eblyNXoXwDlZFcHOdlQgD4w", size: "42MB" },
  { title: "Investment Case", id: "1HWfj9F0hrNWCmByyMfg3U_qcwqP_6Vmv", size: "37MB" },
  { title: "Lifestyle & Area", id: "1PECl1vpzwCVZdqwHE3MoEUczAxgdAkyU", size: "26MB" },
];

const QUICK_LINKS = [
  { title: "360 Virtual Tour", icon: Eye, url: "https://kuula.co/share/collection/7HMGx?logo=1&info=0&logosize=96&fs=1&vr=0&initload=0&thumbs=1&margin=10", color: "text-purple-400" },
  { title: "Marketing Deck", icon: FileText, url: "https://drive.google.com/file/d/1VjkUDB_xDaXJuJepiIqZd_T_r9g7WRwn/view", color: "text-amber-400" },
  { title: "Design Plans", icon: Map, url: "https://drive.google.com/file/d/1W8izh1PvoQeZ0LJBsdD7ITeB9gzOmaoM/view", color: "text-emerald-400" },
  { title: "Lead Sheet", icon: Users, url: "https://docs.google.com/spreadsheets/d/1oVnbkLNM_DgOAd7EZQVxxaPD0TwNGqqsD7Ezmp0bXSo/edit", color: "text-blue-400" },
  { title: "Sales Chatbot", icon: MessageCircle, url: "/chat", color: "text-green-400", internal: true },
  { title: "Facebook Page", icon: Globe, url: "https://www.facebook.com/BlueEverestGroup", color: "text-[#89AACC]" },
];

const AGENTS = [
  { name: "CMO", icon: Brain, status: "ready" },
  { name: "Content", icon: PenTool, status: "ready" },
  { name: "Copywriter", icon: PenTool, status: "ready" },
  { name: "Ads", icon: TrendingUp, status: "ready" },
  { name: "Email", icon: Mail, status: "ready" },
  { name: "WhatsApp", icon: MessageSquare, status: "ready" },
  { name: "CRM", icon: Users, status: "ready" },
  { name: "Analytics", icon: BarChart3, status: "ready" },
  { name: "Brand Guard", icon: Shield, status: "ready" },
  { name: "Chatbot", icon: MessageCircle, status: "ready" },
];

const MARKET_GROUPS = [
  { label: "Israel", prefix: "IL", color: "border-blue-500/30 bg-blue-500/5", badge: "bg-blue-500/20 text-blue-400" },
  { label: "Philippines", prefix: "PH", color: "border-green-500/30 bg-green-500/5", badge: "bg-green-500/20 text-green-400" },
  { label: "Global", prefix: "INTL", color: "border-purple-500/30 bg-purple-500/5", badge: "bg-purple-500/20 text-purple-400" },
  { label: "Asia", prefix: "ASIA", color: "border-amber-500/30 bg-amber-500/5", badge: "bg-amber-500/20 text-amber-400" },
  { label: "Nurture", prefix: "WA,EM", color: "border-teal-500/30 bg-teal-500/5", badge: "bg-teal-500/20 text-teal-400" },
];

type OpsState = {
  salesTotal: number;
  salesContactable: number;
  facebookLeads: number;
  inboxTotal: number;
  openThreads: number;
  facebookInbox: number;
  knowledgeTotal: number;
  agentRuns: number;
  agentSuccessRate: number;
  contentTotal: number;
  approvedContent: number;
  watiConfigured: boolean;
  readyForLiveAction: boolean;
  readyForLeadCapture: boolean;
  readyForFullAutomation: boolean;
  liveBlockers: string[];
  liveWarnings: string[];
  systems: {
    supabaseConfigured?: boolean;
    supabaseServiceRoleConfigured?: boolean;
    metaConfigured?: boolean;
    metaWebhookVerifyTokenConfigured?: boolean;
    watiConfigured?: boolean;
    whatsappCloudConfigured?: boolean;
    simulation?: boolean | string;
  };
  loaded: boolean;
};

const EMPTY_OPS: OpsState = {
  salesTotal: 0,
  salesContactable: 0,
  facebookLeads: 0,
  inboxTotal: 0,
  openThreads: 0,
  facebookInbox: 0,
  knowledgeTotal: 0,
  agentRuns: 0,
  agentSuccessRate: 0,
  contentTotal: 0,
  approvedContent: 0,
  watiConfigured: false,
  readyForLiveAction: false,
  readyForLeadCapture: false,
  readyForFullAutomation: false,
  liveBlockers: [],
  liveWarnings: [],
  systems: {},
  loaded: false,
};

export function OverviewSection() {
  const { locale } = useTranslation();
  const isHe = locale === "he";
  const budgetTotal = BUDGET.totalUsd;
  const pct = Math.min((BUDGET.spentUsd / budgetTotal) * 100, 100);
  const [ops, setOps] = useState<OpsState>(EMPTY_OPS);

  useEffect(() => {
    let cancelled = false;

    async function loadOps() {
      try {
        const [salesRes, inboxRes, knowledgeRes, agentsRes, contentRes, readinessRes] = await Promise.all([
          fetch("/api/marketing/sales/queue?limit=50", { cache: "no-store" }),
          fetch("/api/marketing/inbox?limit=100", { cache: "no-store" }),
          fetch("/api/marketing/knowledge?limit=50", { cache: "no-store" }),
          fetch("/api/marketing/agents?limit=50", { cache: "no-store" }),
          fetch("/api/marketing/content?limit=50", { cache: "no-store" }),
          fetch("/api/cron/morning-readiness", { cache: "no-store" }),
        ]);

        const [sales, inbox, knowledge, agents, content, readiness] = await Promise.all([
          salesRes.ok ? salesRes.json() : Promise.resolve({}),
          inboxRes.ok ? inboxRes.json() : Promise.resolve({}),
          knowledgeRes.ok ? knowledgeRes.json() : Promise.resolve({}),
          agentsRes.ok ? agentsRes.json() : Promise.resolve({}),
          contentRes.ok ? contentRes.json() : Promise.resolve({}),
          readinessRes.ok ? readinessRes.json() : Promise.resolve({}),
        ]);

        if (cancelled) return;

        const leads = Array.isArray(sales.leads) ? sales.leads : [];
        const contentItems = Array.isArray(content.content) ? content.content : [];

        setOps({
          salesTotal: Number(sales.total ?? leads.length ?? 0),
          salesContactable: leads.filter((lead: { canContact?: boolean }) => lead.canContact).length,
          facebookLeads: leads.filter((lead: { channel?: string }) => String(lead.channel ?? "").startsWith("facebook")).length,
          inboxTotal: Number(inbox.total ?? 0),
          openThreads: Number(inbox.summary?.openThreads ?? 0),
          facebookInbox:
            Number(inbox.summary?.byChannel?.facebook_dm ?? 0) +
            Number(inbox.summary?.byChannel?.facebook_comment ?? 0),
          knowledgeTotal: Number(knowledge.total ?? knowledge.entries?.length ?? 0),
          agentRuns: Number(agents.total ?? agents.runs?.length ?? 0),
          agentSuccessRate: Number(agents.summary?.successRate ?? 0),
          contentTotal: Number(content.total ?? contentItems.length ?? 0),
          approvedContent: contentItems.filter((item: { brand_check_passed?: boolean; status?: string }) =>
            item.brand_check_passed || item.status === "approved" || item.status === "published"
          ).length,
          watiConfigured: Boolean(sales.blockers?.watiConfigured || readiness.systems?.watiConfigured),
          readyForLiveAction: Boolean(readiness.readyForLiveAction),
          readyForLeadCapture: Boolean(readiness.readyForLeadCapture),
          readyForFullAutomation: Boolean(readiness.readyForFullAutomation),
          liveBlockers: Array.isArray(readiness.blockers) ? readiness.blockers : [],
          liveWarnings: Array.isArray(readiness.warnings) ? readiness.warnings : [],
          systems: readiness.systems ?? {},
          loaded: true,
        });
      } catch {
        if (!cancelled) setOps({ ...EMPTY_OPS, loaded: true });
      }
    }

    loadOps();
    return () => {
      cancelled = true;
    };
  }, []);

  const commandTasks = useMemo(() => {
    const tasks = isHe
      ? [
          `${ops.salesContactable} לידים זמינים לטיפול עכשיו, כולל Facebook אם יש PSID.`,
          `${ops.openThreads} שיחות פתוחות דורשות בדיקת אדם או סוכן.`,
          "אם אין אירועי Facebook נכנסים, לבדוק Meta webhook, App Mode והרשאות Page Messaging.",
          "WATI לא חוסם את האתר, הצ׳אט או Facebook. הוא נדרש רק לשליחה אוטומטית ב-WhatsApp.",
        ]
      : [
          `${ops.salesContactable} leads are contactable now, including Facebook leads with PSID.`,
          `${ops.openThreads} open conversations need human or agent review.`,
          "If Facebook events are not arriving, verify Meta webhook, App Mode and Page Messaging permissions.",
          "WATI does not block website chat or Facebook. It is only needed for automated WhatsApp sends.",
        ];
    return tasks;
  }, [isHe, ops.openThreads, ops.salesContactable]);

  return (
    <section className="space-y-6">
      {/* 1. Hero Status Bar */}
      <div className="bg-surface rounded-2xl border border-stroke p-4 flex flex-wrap items-center gap-4">
        <span className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
          ops.readyForLiveAction
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        }`}>
          {ops.readyForLiveAction ? "LIVE" : "PARTIAL"}
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <CircleDollarSign size={16} className="text-emerald-400" />
          <span className="text-sm text-muted">${BUDGET.spentUsd}</span>
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm text-muted">${budgetTotal}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium">10 AI Agents</span>
        </div>
        <div className="flex gap-1.5">
          {["IL", "PH", "INTL", "ASIA"].map(m => (
            <span key={m} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold">{m}</span>
          ))}
        </div>
        <span className="text-xs text-muted ml-auto">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* 2. Live Command Center */}
      <div className="rounded-2xl border border-[#4E85BF]/25 bg-[#07111d] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {isHe ? "חדר פיקוד שיווק ומכירות" : "Marketing & Sales Command Center"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {isHe
                ? "תמונה חיה של לידים, Facebook Inbox, ידע, תוכן וסוכנים. המערכת ממשיכה לעבוד גם בלי WATI."
                : "Live view of leads, Facebook Inbox, knowledge, content and agents. The system keeps working without WATI."}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            ops.watiConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
          }`}>
            {ops.watiConfigured ? "WATI Connected" : "WATI Optional / Not Blocking"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[
            { label: isHe ? "לידים לתור מכירות" : "Sales Queue", value: ops.loaded ? ops.salesTotal : "...", icon: Users, color: "text-emerald-400" },
            { label: isHe ? "לידים מפייסבוק" : "Facebook Leads", value: ops.loaded ? ops.facebookLeads : "...", icon: MessageCircle, color: "text-blue-400" },
            { label: isHe ? "שיחות פתוחות" : "Open Threads", value: ops.loaded ? ops.openThreads : "...", icon: MessageSquare, color: "text-amber-400" },
            { label: isHe ? "אירועי Inbox" : "Inbox Events", value: ops.loaded ? ops.inboxTotal : "...", icon: Mail, color: "text-purple-400" },
            { label: isHe ? "בסיס ידע" : "Knowledge Base", value: ops.loaded ? ops.knowledgeTotal : "...", icon: Brain, color: "text-[#89AACC]" },
            { label: isHe ? "ריצות סוכנים" : "Agent Runs", value: ops.loaded ? ops.agentRuns : "...", icon: Bot, color: "text-green-400" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Icon size={16} className={item.color} />
                <p className="mt-2 font-display text-2xl font-bold">{item.value}</p>
                <p className="mt-1 text-[11px] text-muted">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-sm font-semibold">{isHe ? "מה צריך לזוז עכשיו" : "What Needs To Move Now"}</h3>
            <div className="mt-3 grid gap-2">
              {commandTasks.map((task) => (
                <div key={task} className="flex items-start gap-2 text-xs text-muted">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-sm font-semibold">{isHe ? "מדדי מנוע" : "Engine Health"}</h3>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <div className="flex justify-between gap-3">
                <span>{isHe ? "Facebook Inbox" : "Facebook Inbox"}</span>
                <span className="font-semibold text-blue-400">{ops.facebookInbox}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>{isHe ? "תוכן מאושר" : "Approved Content"}</span>
                <span className="font-semibold text-emerald-400">{ops.approvedContent}/{ops.contentTotal}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>{isHe ? "הצלחת סוכנים" : "Agent Success"}</span>
                <span className="font-semibold text-emerald-400">{ops.agentSuccessRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <Megaphone className="mx-auto mb-2 text-[#89AACC]" size={22} />
          <p className="font-display text-3xl font-bold">{CAMPAIGNS.length}</p>
          <p className="text-xs text-muted mt-1">Total Campaigns</p>
        </div>
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <Globe className="mx-auto mb-2 text-purple-400" size={22} />
          <p className="font-display text-3xl font-bold">4</p>
          <p className="text-xs text-muted mt-1">Active Markets</p>
        </div>
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <Bot className="mx-auto mb-2 text-emerald-400" size={22} />
          <p className="font-display text-3xl font-bold">10</p>
          <p className="text-xs text-muted mt-1">AI Agents</p>
        </div>
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <Video className="mx-auto mb-2 text-amber-400" size={22} />
          <p className="font-display text-3xl font-bold">{VIDEOS.length}</p>
          <p className="text-xs text-muted mt-1">Marketing Videos</p>
        </div>
      </div>

      {/* 3. Marketing Videos */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Video size={18} className="text-amber-400" />
          {isHe ? "סרטוני שיווק" : "Marketing Videos"}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {VIDEOS.map((v, i) => (
            <a
              key={v.id}
              href={`https://drive.google.com/file/d/${v.id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-[220px] group"
            >
              <div className="bg-surface rounded-xl border border-stroke overflow-hidden hover:border-amber-500/30 transition-colors">
                <div className="h-[124px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[url('/images/exterior/aerial-1.webp')] bg-cover bg-center opacity-20" />
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-amber-500/20 transition-colors z-10">
                    <Play size={20} className="text-white ml-0.5" />
                  </div>
                  <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80 z-10">
                    #{i + 1}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{v.title}</p>
                  <p className="text-[11px] text-muted mt-0.5">{v.size} - MP4</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 4. Campaign Grid by Market */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-[#89AACC]" />
          {isHe ? "קמפיינים לפי שוק" : "Campaigns by Market"}
        </h2>
        <div className="space-y-4">
          {MARKET_GROUPS.map(group => {
            const prefixes = group.prefix.split(",");
            const groupCampaigns = CAMPAIGNS.filter(c => prefixes.some(p => c.id.startsWith(p)));
            if (groupCampaigns.length === 0) return null;
            return (
              <div key={group.label} className={`rounded-xl border p-4 ${group.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${group.badge}`}>{group.label}</span>
                  <span className="text-xs text-muted">{groupCampaigns.length} campaigns</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groupCampaigns.map(c => (
                    <div key={c.id} className="bg-surface/50 rounded-lg border border-stroke/50 p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.id}: {c.name}</p>
                        <p className="text-[11px] text-muted">{c.channel} - {c.totalBudgetUsd > 0 ? `$${c.totalBudgetUsd}` : "Free"}</p>
                      </div>
                      <span className={`shrink-0 ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        c.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                        c.status === "planned" ? "bg-amber-500/20 text-amber-400" :
                        c.status === "phase2" ? "bg-blue-500/20 text-blue-400" :
                        "bg-white/5 text-muted"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Links */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          {isHe ? "קישורים מהירים" : "Quick Links"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            const Tag = link.internal ? "a" : "a";
            return (
              <a
                key={link.title}
                href={link.url}
                target={link.internal ? undefined : "_blank"}
                rel={link.internal ? undefined : "noopener noreferrer"}
                className="bg-surface rounded-xl border border-stroke p-4 text-center hover:border-[#4E85BF]/30 transition-colors group"
              >
                <Icon size={20} className={`mx-auto mb-2 ${link.color} group-hover:scale-110 transition-transform`} />
                <p className="text-xs font-medium">{link.title}</p>
                {!link.internal && <ExternalLink size={10} className="mx-auto mt-1 text-muted" />}
              </a>
            );
          })}
        </div>
      </div>

      {/* 6. Live Readiness + Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {ops.liveBlockers.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <h3 className={`text-sm font-semibold ${ops.liveBlockers.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {isHe ? "תקינות וסנכרון מערכת" : "System Readiness"}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              ops.liveBlockers.length > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {ops.liveBlockers.length > 0 ? ops.liveBlockers.length : "OK"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: "Live", value: ops.readyForLiveAction },
              { label: "Leads", value: ops.readyForLeadCapture },
              { label: "Full Auto", value: ops.readyForFullAutomation },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg border px-3 py-2 ${
                item.value ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"
              }`}>
                <p className="text-[10px] text-muted">{item.label}</p>
                <p className={`text-xs font-bold ${item.value ? "text-emerald-400" : "text-amber-400"}`}>
                  {item.value ? "Ready" : "Partial"}
                </p>
              </div>
            ))}
          </div>
          {ops.liveBlockers.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-sm font-medium text-emerald-300">
                {isHe ? "אין חסמים קריטיים לפעילות האתר, CRM, Messenger וסוכני המכירות." : "No critical blockers for website, CRM, Messenger and sales agents."}
              </p>
              <p className="mt-1 text-xs text-muted">
                {isHe ? "אזהרות למטה הן רכיבי אוטומציה חלקיים, לא חסמי מערכת." : "Warnings below are partial automation gaps, not system blockers."}
              </p>
            </div>
          ) : ops.liveBlockers.map((item) => (
            <div key={item} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-medium text-red-300">{item}</p>
            </div>
          ))}
          {ops.liveWarnings.map((item) => (
            <div key={item} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-medium text-amber-300">{isHe ? "אזהרה" : "Warning"}</p>
              <p className="mt-1 text-xs text-muted">{item}</p>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted">
            {[
              ["Supabase", ops.systems.supabaseConfigured],
              ["Meta", ops.systems.metaConfigured],
              ["Meta Webhook", ops.systems.metaWebhookVerifyTokenConfigured],
              ["WhatsApp Cloud", ops.systems.whatsappCloudConfigured],
              ["WATI", ops.systems.watiConfigured],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-lg border border-stroke bg-white/[0.02] px-3 py-2">
                <span>{label}</span>
                <span className={value ? "text-emerald-400" : "text-amber-400"}>{value ? "on" : "partial"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-400">{isHe ? "הושלמו" : "Completed"}</h3>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{COMPLETED_ITEMS.length}</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {COMPLETED_ITEMS.map(item => (
              <div key={item.title} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-sm font-medium">{isHe && item.titleHe ? item.titleHe : item.title}</p>
                <p className="mt-0.5 text-[11px] text-muted">{isHe && item.descriptionHe ? item.descriptionHe : item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Agent System Status */}
      <div className="bg-surface rounded-2xl border border-stroke p-5">
        <h2 className="font-display text-sm font-semibold mb-4 flex items-center gap-2">
          <Bot size={16} className="text-emerald-400" />
          {isHe ? "סטטוס מערכת סוכנים" : "AI Agent System"}
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">QA Ready</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {AGENTS.map(agent => {
            const Icon = agent.icon;
            return (
              <div key={agent.name} className="bg-white/[0.02] rounded-lg border border-stroke/50 p-2.5 text-center">
                <Icon size={14} className="mx-auto mb-1.5 text-emerald-400" />
                <p className="text-[10px] font-medium truncate">{agent.name}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] text-emerald-400/80">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Contact Bar */}
      <div className="bg-gradient-to-r from-[#89AACC]/10 to-[#4E85BF]/10 rounded-2xl border border-[#4E85BF]/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Panglao Prime Villas - Blue Everest Asset Group</p>
          <p className="text-xs text-muted mt-0.5">Villa C: PHP 35,000,000 - Villa D: PHP 32,500,000 - 2 remaining</p>
        </div>
        <div className="flex gap-3">
          <a href={SITE_CONFIG.whatsappLinks.marketing} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-green-600/20 px-3 py-1.5 text-xs text-green-400 hover:bg-green-600/30">
            <Phone size={12} /> Marketing
          </a>
          <a href={SITE_CONFIG.whatsappLinks.office} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-green-600/20 px-3 py-1.5 text-xs text-green-400 hover:bg-green-600/30">
            <Phone size={12} /> Office
          </a>
        </div>
      </div>
    </section>
  );
}
