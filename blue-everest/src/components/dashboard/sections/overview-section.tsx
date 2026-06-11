"use client";

import {
  AlertTriangle, CheckCircle2, CircleDollarSign, Play,
  Users, Calendar, Bot, Globe, Megaphone, ExternalLink,
  Video, Zap, MessageCircle, Shield, Mail, TrendingUp,
  BarChart3, PenTool, Brain, Phone, FileText, Eye,
  Map, MessageSquare,
} from "lucide-react";
import { BLOCKERS, COMPLETED_ITEMS, BUDGET, CAMPAIGNS } from "@/lib/data/dashboard-data";
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

export function OverviewSection() {
  const { locale } = useTranslation();
  const isHe = locale === "he";
  const budgetTotal = BUDGET.totalUsd;
  const pct = Math.min((BUDGET.spentUsd / budgetTotal) * 100, 100);

  return (
    <section className="space-y-6">
      {/* 1. Hero Status Bar */}
      <div className="bg-surface rounded-2xl border border-stroke p-4 flex flex-wrap items-center gap-4">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-bold text-amber-400">
          PRE-LAUNCH
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

      {/* 6. Blockers + Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">{isHe ? "חסמים" : "Blockers"}</h3>
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">{BLOCKERS.length}</span>
          </div>
          {BLOCKERS.map(item => (
            <div key={item.title} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-medium">{isHe && item.titleHe ? item.titleHe : item.title}</p>
              <p className="mt-1 text-xs text-muted">{isHe && item.descriptionHe ? item.descriptionHe : item.description}</p>
            </div>
          ))}
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
          <a href="https://wa.me/639542555553" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-green-600/20 px-3 py-1.5 text-xs text-green-400 hover:bg-green-600/30">
            <Phone size={12} /> Marketing
          </a>
          <a href="https://wa.me/639958565865" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-green-600/20 px-3 py-1.5 text-xs text-green-400 hover:bg-green-600/30">
            <Phone size={12} /> Office
          </a>
        </div>
      </div>
    </section>
  );
}
