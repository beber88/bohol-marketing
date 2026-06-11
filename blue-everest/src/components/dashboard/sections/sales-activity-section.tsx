"use client";

import { useState, useEffect } from "react";
import {
  Headset, MessageCircle, Phone, Globe, Clock, TrendingUp,
  User, ChevronDown, ChevronUp, RefreshCw, Loader2,
  AlertTriangle, CheckCircle2, Zap, UserPlus,
} from "lucide-react";

/* ── types ─────────────────────────────────────────────────── */

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
}

/* ── mock data (replaced by Supabase in production) ────────── */

const MOCK_CONVERSATIONS: AgentConversation[] = [
  {
    id: "conv-001",
    agent: "david_chatbot",
    agentLabel: "David (Website Chat)",
    clientName: null,
    clientPhone: null,
    clientOrigin: "Israel",
    language: "he",
    channel: "website_chat",
    messages: [
      { role: "user", content: "היי, ראיתי את הוילות שלכם בפנגלאו. כמה עולה וילה D?", timestamp: "2026-05-25T20:12:00Z" },
      { role: "assistant", content: "וילה D עומדת על PHP 32,500,000. מדובר בווילה עם בריכה פרטית, ג'קוזי על הגג ו-4 חדרים. ההכנסה החודשית המאומתת מ-Airbnb היא PHP 395,000. מאיפה אתה בארץ?", timestamp: "2026-05-25T20:12:08Z" },
      { role: "user", content: "מתל אביב. מה הסיפור עם הבעלות? אני יכול לקנות כזר?", timestamp: "2026-05-25T20:13:15Z" },
      { role: "assistant", content: "כן, בהחלט. יש 3 מסלולים משפטיים מוכחים. Deed of Assignment - הכי פופולרי, בעלות מלאה על המבנה, פשוט ומהיר. Leasehold 25+25 שנותן שליטה ל-50 שנה. ותאגיד מקומי 60/40 לביטחון מקסימלי. יש גם הסכם מס כפל ישראל-פיליפינים מ-97. התהליך אפשרי מרחוק. רוצה שאכין לך ניתוח תשואה אישי?", timestamp: "2026-05-25T20:13:25Z" },
    ],
    leadScore: 65,
    leadStatus: "warm",
    signals: ["budget_mention", "legal_question"],
    handedOff: false,
    handoffReason: null,
    startedAt: "2026-05-25T20:12:00Z",
    lastMessageAt: "2026-05-25T20:13:25Z",
    summary: "Israeli from Tel Aviv asking about Villa D pricing and foreign ownership structures",
  },
  {
    id: "conv-002",
    agent: "david_chatbot",
    agentLabel: "David (Website Chat)",
    clientName: null,
    clientPhone: null,
    clientOrigin: "Philippines",
    language: "en",
    channel: "website_chat",
    messages: [
      { role: "user", content: "How much is Villa C? Is BDO financing available?", timestamp: "2026-05-25T14:30:00Z" },
      { role: "assistant", content: "Villa C is PHP 35,000,000 - the slightly larger lot at 192.85 sqm. And yes, BDO financing is available for qualified Filipino buyers. Up to 70% loan-to-value, 15-year terms, around 6% interest. The payment structure is 25% down, 55% over 24 months during construction, and 20% on turnover. Have you been to Panglao before?", timestamp: "2026-05-25T14:30:12Z" },
      { role: "user", content: "Yes I visited last month. I want to reserve Villa C. What's the process?", timestamp: "2026-05-25T14:31:45Z" },
      { role: "assistant", content: "Great, you already know the area. The reservation is PHP 200,000 to secure Villa C. After that, it is 25% down on signing. I recommend speaking with our team directly to walk through the exact schedule. WhatsApp: +639542555553 (Marketing) / +639958565865 (Office).", timestamp: "2026-05-25T14:32:00Z" },
    ],
    leadScore: 92,
    leadStatus: "very_hot",
    signals: ["budget_mention", "reservation_intent", "visit_intent", "financing_question"],
    handedOff: true,
    handoffReason: "Reservation intent - wants to reserve Villa C. BDO financing. Visited property.",
    startedAt: "2026-05-25T14:30:00Z",
    lastMessageAt: "2026-05-25T14:32:00Z",
    summary: "Filipino buyer wants to reserve Villa C with BDO financing. Already visited site.",
  },
  {
    id: "conv-003",
    agent: "whatsapp_agent",
    agentLabel: "WhatsApp Agent",
    clientName: "Park Jihoon",
    clientPhone: "+82-10-****-5531",
    clientOrigin: "South Korea",
    language: "en",
    channel: "whatsapp",
    messages: [
      { role: "user", content: "Hi, I saw your ad on Facebook. I'm Korean living in Seoul. My family visits Panglao every year. How much for a villa?", timestamp: "2026-05-25T11:00:00Z" },
      { role: "assistant", content: "Great to hear from you. Villa D is PHP 32,500,000 and Villa C is PHP 35,000,000. Since you already know Panglao, you know the area is growing fast. 42% of foreign tourists to Bohol are Korean, and monthly rental income is around PHP 395,000 on average. Would you like me to send you the full investment deck? WhatsApp: +639542555553 (Marketing) / +639958565865 (Office).", timestamp: "2026-05-25T11:00:30Z" },
    ],
    leadScore: 55,
    leadStatus: "warm",
    signals: ["budget_mention", "visit_intent"],
    handedOff: false,
    handoffReason: null,
    startedAt: "2026-05-25T11:00:00Z",
    lastMessageAt: "2026-05-25T11:00:30Z",
    summary: "Korean family from Seoul, annual Panglao visitors, asking about pricing",
  },
  {
    id: "conv-004",
    agent: "whatsapp_agent",
    agentLabel: "WhatsApp Agent",
    clientName: "Sarah M.",
    clientPhone: "+971-50-****-2209",
    clientOrigin: "UAE",
    language: "en",
    channel: "whatsapp",
    messages: [
      { role: "user", content: "Hello, I'm an OFW based in Dubai. Looking for passive income investment in PH. Is this project legit?", timestamp: "2026-05-24T08:15:00Z" },
      { role: "assistant", content: "Hello Sarah, Blue Everest Asset Group is a registered Philippine developer. The villas are in Panglao between JW Marriott and Mithi Resort. For an OFW in Dubai, the PHP 395,000/month verified rental income can be reviewed alongside your UAE tax position with your adviser. BDO financing is available for qualified Filipino buyers. Where in the Philippines are you originally from?", timestamp: "2026-05-24T08:15:45Z" },
      { role: "user", content: "From Cebu. Can I do BDO financing even if I'm OFW?", timestamp: "2026-05-24T08:20:00Z" },
      { role: "assistant", content: "Yes! BDO serves OFWs - up to 70% LTV, 15-year terms. Being from Cebu you know the Visayas well. Panglao is a short hop from Cebu. Villa D is PHP 32.5M. Want me to have our team prepare a financing scenario for you?", timestamp: "2026-05-24T08:20:30Z" },
    ],
    leadScore: 72,
    leadStatus: "hot",
    signals: ["financing_question", "roi_interest", "budget_mention"],
    handedOff: false,
    handoffReason: null,
    startedAt: "2026-05-24T08:15:00Z",
    lastMessageAt: "2026-05-24T08:20:30Z",
    summary: "OFW from Cebu based in Dubai, interested in BDO financing for passive income",
  },
  {
    id: "conv-005",
    agent: "email_nurture",
    agentLabel: "Email Nurture",
    clientName: "James T.",
    clientPhone: null,
    clientOrigin: "Australia",
    language: "en",
    channel: "email",
    messages: [
      { role: "user", content: "Downloaded the investment report. The ROI numbers look good but I'm concerned about property management from Australia. How does that work?", timestamp: "2026-05-23T06:00:00Z" },
      { role: "assistant", content: "James, the management model is fully hands-off. A professional Airbnb management company handles guest communication, cleaning, maintenance, pricing optimization and reviews. You receive a monthly report and a bank transfer. The fee is 20-25% of gross rental. You can block personal dates anytime you want to visit. For remote ownership, our team walks through reporting, access and handoff before reservation.", timestamp: "2026-05-23T09:00:00Z" },
    ],
    leadScore: 45,
    leadStatus: "warm",
    signals: ["roi_interest", "comparison"],
    handedOff: false,
    handoffReason: null,
    startedAt: "2026-05-23T06:00:00Z",
    lastMessageAt: "2026-05-23T09:00:00Z",
    summary: "Australian investor concerned about remote property management",
  },
];

/* ── helpers ───────────────────────────────────────────────── */

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

/* ── component ─────────────────────────────────────────────── */

export function SalesActivitySection() {
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "hot" | "handed_off">("all");

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    // In production, fetch from Supabase conversations table
    const timer = setTimeout(() => {
      setConversations(MOCK_CONVERSATIONS);
      setLoading(false);

      // Auto-create leads from all conversations
      for (const conv of MOCK_CONVERSATIONS) {
        fetch("/api/marketing/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: conv.clientName || `Lead from ${conv.clientOrigin || "unknown"}`,
            phone: conv.clientPhone || "",
            nationality: conv.clientOrigin || "",
            source: conv.channel === "whatsapp" ? "whatsapp" : "website",
            lead_score: conv.leadScore,
            lead_status: conv.leadStatus === "very_hot" ? "hot" : conv.leadStatus,
            funnel_stage: conv.handedOff ? "contacted" : "new",
            notes: `[Auto-created from ${conv.agentLabel}] ${conv.summary || ""}`,
            conversation_id: conv.id,
          }),
        }).catch(() => {}); // Silent - don't block UI
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const sendReply = async (convId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    // Add the reply to the conversation locally
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, { role: "assistant", content: replyText, timestamp: new Date().toISOString() }] }
          : c
      )
    );
    // In production: send via WhatsApp/email API
    try {
      await fetch("/api/marketing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: replyText, sender: "ceo" }),
      });
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
          onClick={() => setLoading(true)}
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
                      <CheckCircle2 size={10} /> Auto-created as lead in pipeline
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
                      Send
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

/* ── Convert to Lead Form ──────────────────────────────────── */

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
