"use client";

import { useState, useEffect } from "react";
import {
  Headset, MessageCircle, Phone, Globe, Clock, TrendingUp,
  User, ChevronDown, ChevronUp, RefreshCw, Loader2,
  AlertTriangle, CheckCircle2, Zap, UserPlus,
} from "lucide-react";

/* -- types --------------------------------------------------- */

interface AgentConversation {
  id: string;
  agent: "david_chatbot" | "whatsapp_agent" | "email_nurture";
  agentLabel: string;
  clientName: string | null;
  clientPhone: string | null;
  clientOrigin: string | null;
  language: string;
  channel: "website_chat" | "whatsapp" | "email" | "facebook_dm";
  messages: Array<{ role: string; content: string; timestamp: string }>;
  leadScore: number;
  leadStatus: "cold" | "warm" | "hot" | "very_hot" | "handed_off";
  signals: string[];
  handedOff: boolean;
  handoffReason: string | null;
  startedAt: string;
  lastMessageAt: string;
  summary: string | null;
  followupScript?: string;
  whatsappLink?: string | null;
  canContact?: boolean;
}

/* -- live data comes from /api/marketing/sales/queue ---------- */

/* -- helpers ------------------------------------------------- */

const AGENT_COLORS: Record<string, string> = {
  david_chatbot: "text-[#89AACC]",
  whatsapp_agent: "text-green-400",
  email_nurture: "text-purple-400",
};

const CHANNEL_LABELS: Record<string, string> = {
  website_chat: "Website Chat",
  whatsapp: "WhatsApp",
  email: "Email",
  facebook_dm: "Facebook DM",
};

const STATUS_STYLES: Record<string, string> = {
  cold: "bg-white/5 text-muted",
  warm: "bg-amber-500/20 text-amber-400",
  hot: "bg-red-500/20 text-red-400",
  very_hot: "bg-red-600/20 text-red-300",
  handed_off: "bg-green-500/20 text-green-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* -- component ----------------------------------------------- */

export function SalesActivitySection() {
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "hot" | "handed_off">("all");

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchSalesQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/sales/queue?limit=50");
      const data = await res.json();
      setConversations(data.leads || []);
    } catch {
      setConversations([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSalesQueue(); }, []);

  const sendReply = async (convId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    const current = conversations.find((c) => c.id === convId);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, { role: "assistant", content: replyText, timestamp: new Date().toISOString() }] }
          : c
      )
    );
    try {
      await fetch("/api/marketing/sales/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: convId, message: replyText }),
      });
      if (current?.whatsappLink) {
        window.open(current.whatsappLink, "_blank", "noopener,noreferrer");
      }
    } catch {}
    setReplyText("");
    setSendingReply(false);
  };

  const filtered = conversations.filter((c) => {
    if (filter === "hot") return c.leadStatus === "hot" || c.leadStatus === "very_hot";
    if (filter === "handed_off") return c.handedOff;
    return true;
  });

  const totalConvs = conversations.length;
  const hotCount = conversations.filter((c) => c.leadStatus === "hot" || c.leadStatus === "very_hot").length;
  const handoffCount = conversations.filter((c) => c.handedOff).length;
  const agentBreakdown = {
    david: conversations.filter((c) => c.agent === "david_chatbot").length,
    whatsapp: conversations.filter((c) => c.agent === "whatsapp_agent").length,
    email: conversations.filter((c) => c.agent === "email_nurture").length,
  };

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
          <Headset size={18} className="text-[#89AACC]" /> Sales Agent Activity
        </h2>
        <button
          onClick={fetchSalesQueue}
          className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <MessageCircle className="mx-auto mb-1.5 text-[#89AACC]" size={18} />
          <p className="font-display text-2xl font-bold">{totalConvs}</p>
          <p className="text-[10px] text-muted">Total Conversations</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <TrendingUp className="mx-auto mb-1.5 text-red-400" size={18} />
          <p className="font-display text-2xl font-bold">{hotCount}</p>
          <p className="text-[10px] text-muted">Hot / Very Hot</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Phone className="mx-auto mb-1.5 text-green-400" size={18} />
          <p className="font-display text-2xl font-bold">{handoffCount}</p>
          <p className="text-[10px] text-muted">Handed Off to Sales</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <User className="mx-auto mb-1.5 text-[#89AACC]" size={18} />
          <p className="font-display text-2xl font-bold">{agentBreakdown.david}</p>
          <p className="text-[10px] text-muted">David (Chat)</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Zap className="mx-auto mb-1.5 text-green-400" size={18} />
          <p className="font-display text-2xl font-bold">{agentBreakdown.whatsapp + agentBreakdown.email}</p>
          <p className="text-[10px] text-muted">WhatsApp + Email</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "hot", "handed_off"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f
                ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white"
                : "border border-stroke bg-surface text-muted hover:text-white"
            }`}
          >
            {f === "all" ? "All" : f === "hot" ? "Hot Leads" : "Handed Off"}
          </button>
        ))}
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filtered.map((conv) => {
          const isExpanded = expandedId === conv.id;
          const AgentColor = AGENT_COLORS[conv.agent] || "text-muted";

          return (
            <div key={conv.id} className="bg-surface rounded-2xl border border-stroke overflow-hidden">
              {/* Summary Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                {/* Agent Badge */}
                <div className={`flex items-center gap-2 shrink-0 ${AgentColor}`}>
                  {conv.agent === "david_chatbot" ? <MessageCircle size={16} /> :
                   conv.agent === "whatsapp_agent" ? <Phone size={16} /> :
                   <Globe size={16} />}
                  <span className="text-xs font-semibold hidden sm:inline">{conv.agentLabel}</span>
                </div>

                {/* Client Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {conv.clientName || conv.clientOrigin || "Anonymous"}
                    </span>
                    <span className="text-[10px] text-muted">{conv.language.toUpperCase()}</span>
                    <span className="text-[10px] text-muted">{CHANNEL_LABELS[conv.channel]}</span>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{conv.summary}</p>
                </div>

                {/* Score + Status */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold">{conv.leadScore}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[conv.leadStatus]}`}>
                    {conv.leadStatus.replace("_", " ")}
                  </span>
                  {conv.handedOff && (
                    <CheckCircle2 size={14} className="text-green-400" />
                  )}
                  <span className="text-[10px] text-muted whitespace-nowrap">
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                </div>
              </button>

              {/* Expanded: Full Conversation */}
              {isExpanded && (
                <div className="border-t border-stroke">
                  {/* Signals */}
                  {conv.signals.length > 0 && (
                    <div className="px-5 py-3 border-b border-stroke/50 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-muted mr-2">Signals:</span>
                      {conv.signals.map((s) => (
                        <span key={s} className="rounded-full bg-[#89AACC]/10 px-2 py-0.5 text-[10px] text-[#89AACC]">
                          {s.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Handoff Alert */}
                  {conv.handedOff && conv.handoffReason && (
                    <div className="mx-5 mt-3 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2.5 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-green-400">Handed off to human sales</p>
                        <p className="text-[11px] text-muted mt-0.5">{conv.handoffReason}</p>
                      </div>
                    </div>
                  )}

                  {conv.followupScript && (
                    <div className="mx-5 mt-3 rounded-lg bg-[#89AACC]/10 border border-[#4E85BF]/20 px-4 py-3">
                      <p className="text-xs font-semibold text-[#89AACC]">Prepared follow-up script</p>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-text-primary" dir={conv.language === "he" ? "rtl" : "ltr"}>
                        {conv.followupScript}
                      </p>
                      {conv.whatsappLink ? (
                        <a
                          href={conv.whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20"
                        >
                          <Phone size={12} /> Open WhatsApp
                        </a>
                      ) : (
                        <p className="mt-2 text-[11px] text-amber-400">No valid phone yet. Agent must collect phone/email before live follow-up.</p>
                      )}
                    </div>
                  )}

                  {/* Messages */}
                  <div className="px-5 py-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {conv.messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          msg.role === "user"
                            ? "bg-white/5 border border-stroke"
                            : "bg-[#89AACC]/10 border border-[#4E85BF]/20"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold ${msg.role === "user" ? "text-amber-400" : AgentColor}`}>
                              {msg.role === "user" ? (conv.clientName || "Client") : conv.agentLabel}
                            </span>
                            <span className="text-[9px] text-muted">
                              {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed" dir={conv.language === "he" ? "rtl" : "ltr"}>
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Client Details Card */}
                  <div className="mx-5 mt-2 rounded-lg bg-white/[0.03] border border-stroke px-4 py-3">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Client Details</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-muted">Name:</span> <span className="font-medium">{conv.clientName || "Not collected"}</span></div>
                      <div><span className="text-muted">Phone:</span> <span className="font-medium">{conv.clientPhone || "Not collected"}</span></div>
                      <div><span className="text-muted">Origin:</span> <span className="font-medium">{conv.clientOrigin || "Unknown"}</span></div>
                      <div><span className="text-muted">Score:</span> <span className="font-bold">{conv.leadScore}</span> <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        conv.leadStatus === "very_hot" || conv.leadStatus === "hot" ? "bg-red-500/20 text-red-400" :
                        conv.leadStatus === "warm" ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-muted"
                      }`}>{conv.leadStatus}</span></div>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Real lead from Supabase pipeline
                    </p>
                  </div>

                  {/* Reply Input */}
                  <div className="border-t border-stroke px-5 py-3 flex gap-2">
                    <input
                      value={expandedId === conv.id ? replyText : ""}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(conv.id); } }}
                      placeholder="Type a reply to this client..."
                      className="flex-1 rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#4E85BF] focus:outline-none"
                      dir="auto"
                    />
                    <button
                      onClick={() => sendReply(conv.id)}
                      disabled={sendingReply || !replyText.trim()}
                      className="shrink-0 rounded-lg bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                    >
                      Log / Open WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <Headset size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">No conversations match this filter.</p>
        </div>
      )}
    </section>
  );
}

/* -- Convert to Lead Form ------------------------------------ */

function ConvertToLeadForm({ conversation }: { conversation: AgentConversation }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: conversation.clientName || "",
    email: "",
    phone: conversation.clientPhone || "",
    whatsapp: conversation.clientPhone || "",
    nationality: conversation.clientOrigin || "",
    villaInterest: "",
    notes: conversation.summary || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/marketing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          nationality: form.nationality,
          villa_interest: form.villaInterest,
          source: conversation.channel === "whatsapp" ? "whatsapp" : conversation.channel === "email" ? "organic" : "website",
          lead_score: conversation.leadScore,
          lead_status: conversation.leadStatus === "very_hot" ? "hot" : conversation.leadStatus,
          funnel_stage: conversation.handedOff ? "contacted" : "new",
          notes: `[From ${conversation.agentLabel}] ${form.notes}\n\nConversation ID: ${conversation.id}`,
          conversation_id: conversation.id,
        }),
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to create lead:", err);
    }
    setSaving(false);
  };

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle2 size={16} />
        <span className="text-sm font-semibold">Lead created in pipeline</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[#4E85BF]/30 bg-[#4E85BF]/10 px-4 py-2 text-sm font-semibold text-[#89AACC] transition-all hover:bg-[#4E85BF]/20"
      >
        <UserPlus size={14} /> Convert to Lead
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#4E85BF]/20 bg-[#4E85BF]/5 p-4">
      <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        <UserPlus size={14} className="text-[#89AACC]" /> Create Lead from Conversation
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Full Name *"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#4E85BF] focus:outline-none"
        />
        <input
          placeholder="Email *"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#4E85BF] focus:outline-none"
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#4E85BF] focus:outline-none"
        />
        <input
          placeholder="WhatsApp"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          className="rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#4E85BF] focus:outline-none"
        />
        <input
          placeholder="Nationality / Country"
          value={form.nationality}
          onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          className="rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#4E85BF] focus:outline-none"
        />
        <select
          value={form.villaInterest}
          onChange={(e) => setForm({ ...form, villaInterest: e.target.value })}
          className="rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary focus:border-[#4E85BF] focus:outline-none"
        >
          <option value="">Villa Interest</option>
          <option value="villa_c">Villa C (PHP 35M)</option>
          <option value="villa_d">Villa D (PHP 32.5M)</option>
          <option value="both">Both / Either</option>
        </select>
      </div>
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        rows={2}
        className="w-full rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-[#4E85BF] focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !form.fullName.trim()}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          {saving ? "Creating..." : "Create Lead"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-stroke px-4 py-2 text-sm text-muted hover:text-text-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
