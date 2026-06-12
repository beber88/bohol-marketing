"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users, Loader2, RefreshCw, Phone, Mail, Globe,
  MessageCircle, ChevronDown, ChevronUp, ExternalLink, Copy, Check,
  UserCheck, Bot, Send, ArrowLeftRight, Plus, Upload, X,
} from "lucide-react";

interface ConversationMessage {
  role: string;
  content: string;
  timestamp?: string;
  sentBy?: string;
  isHuman?: boolean;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  lead_score: number;
  lead_status: string;
  funnel_stage: string;
  source: string;
  preferred_language: string;
  raw_data: {
    conversations?: ConversationMessage[];
    signals?: string[];
    chatbot_session_id?: string;
    last_message_at?: string;
  };
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ConversationState {
  agent_mode: "auto" | "human_takeover";
  taken_over_by: string | null;
  taken_over_at: string | null;
  messages: ConversationMessage[];
}

const FUNNEL_STAGES = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-sky-500" },
  { key: "qualified", label: "Qualified", color: "bg-amber-500" },
  { key: "proposal_sent", label: "Proposal", color: "bg-orange-500" },
  { key: "reservation_discussed", label: "Reservation", color: "bg-purple-500" },
  { key: "agreement_signed", label: "Agreement", color: "bg-emerald-500" },
  { key: "closed_won", label: "Closed Won", color: "bg-green-500" },
];

const STATUS_COLORS: Record<string, string> = {
  cold: "text-blue-400 bg-blue-500/10",
  warm: "text-amber-400 bg-amber-500/10",
  hot: "text-orange-400 bg-orange-500/10",
  very_hot: "text-red-400 bg-red-500/10",
};

/* -- Takeover Chat Panel ------------------------ */

function TakeoverPanel({
  lead,
  sessionId,
  onUpdate,
}: {
  lead: Lead;
  sessionId: string;
  onUpdate: () => void;
}) {
  const [convoState, setConvoState] = useState<ConversationState | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConvo = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketing/chat/takeover?sessionId=${encodeURIComponent(sessionId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.conversation) {
        setConvoState({
          agent_mode: data.conversation.agent_mode,
          taken_over_by: data.conversation.taken_over_by,
          taken_over_at: data.conversation.taken_over_at,
          messages: data.conversation.messages || [],
        });
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetchConvo();
    // Poll every 3 seconds for live updates
    pollRef.current = setInterval(fetchConvo, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convoState?.messages]);

  const handleTakeover = async () => {
    setSending(true);
    await fetch("/api/marketing/chat/takeover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "takeover", operator: "Bar" }),
    });
    await fetchConvo();
    setSending(false);
    onUpdate();
  };

  const handleReturnToAgent = async () => {
    setSending(true);
    await fetch("/api/marketing/chat/takeover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "return_to_agent", operator: "Bar" }),
    });
    await fetchConvo();
    setSending(false);
    onUpdate();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    await fetch("/api/marketing/chat/takeover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "send_message", message: newMessage.trim(), operator: "Bar" }),
    });
    setNewMessage("");
    await fetchConvo();
    setSending(false);
    onUpdate();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-muted" size={20} /></div>;
  }

  const isHumanMode = convoState?.agent_mode === "human_takeover";
  const messages = convoState?.messages || lead.raw_data?.conversations || [];

  return (
    <div className="space-y-3">
      {/* Control Bar */}
      <div className="flex items-center justify-between rounded-lg bg-white/5 border border-stroke px-4 py-2.5">
        <div className="flex items-center gap-3">
          {isHumanMode ? (
            <>
              <div className="flex items-center gap-1.5">
                <UserCheck size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400">YOU ARE IN CONTROL</span>
              </div>
              <span className="text-[10px] text-muted">
                since {convoState?.taken_over_at ? new Date(convoState.taken_over_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "-"}
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Bot size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">AGENT DAVID ACTIVE</span>
              </div>
              <span className="text-[10px] text-muted">AI is responding to this visitor</span>
            </>
          )}
        </div>

        <button
          onClick={isHumanMode ? handleReturnToAgent : handleTakeover}
          disabled={sending}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            isHumanMode
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
          }`}
        >
          <ArrowLeftRight size={12} />
          {isHumanMode ? "Return to Agent" : "Take Control"}
        </button>
      </div>

      {/* Live Conversation */}
      <div className="rounded-xl bg-black/20 border border-stroke overflow-hidden">
        <div className="px-4 py-2.5 border-b border-stroke flex items-center justify-between">
          <span className="text-xs font-semibold">
            Live Conversation ({messages.length} messages)
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${isHumanMode ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="text-[10px] text-muted">{isHumanMode ? "Your turn" : "AI active"}</span>
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-3 space-y-2">
          {messages.length > 0 ? messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                msg.role === "user"
                  ? "bg-[#89AACC]/10 border border-[#89AACC]/20"
                  : msg.isHuman
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-white/5 border border-stroke"
              }`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] font-bold ${
                    msg.role === "user" ? "text-[#89AACC]" :
                    msg.isHuman ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {msg.role === "user" ? "VISITOR" : msg.isHuman ? `${msg.sentBy || "YOU"}` : "DAVID (AI)"}
                  </span>
                  {msg.timestamp && (
                    <span className="text-[9px] text-muted/50">
                      {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          )) : (
            <p className="text-xs text-muted text-center py-6">No messages yet</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input (only in takeover mode) */}
        {isHumanMode && (
          <div className="border-t border-stroke px-3 py-2.5 flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message to the visitor..."
              className="flex-1 bg-white/5 border border-stroke rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted/50 outline-none focus:border-amber-500/30"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-2 text-amber-400 hover:bg-amber-500/30 disabled:opacity-30 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -- Main Component ----------------------------- */

/* -- Add Lead Modal ------------------------ */

function AddLeadModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", nationality: "", source: "manual", villa_interest: "", purpose: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [result, setResult] = useState<{ imported?: number; failed?: number } | null>(null);

  const handleSingle = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/marketing/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: [form] }),
      });
      const data = await res.json();
      setResult({ imported: data.imported, failed: data.failed });
      if (data.imported > 0) {
        setTimeout(() => { onAdded(); onClose(); }, 1000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleBulk = async () => {
    setSaving(true);
    try {
      // Parse bulk text: each line = "name, phone, country, source"
      const lines = bulkText.split("\n").filter(l => l.trim());
      const leads = lines.map(line => {
        const parts = line.split(",").map(p => p.trim());
        return {
          full_name: parts[0] || undefined,
          phone: parts[1] || undefined,
          nationality: parts[2] || undefined,
          source: parts[3] || "manual_import",
        };
      });
      const res = await fetch("/api/marketing/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      const data = await res.json();
      setResult({ imported: data.imported, failed: data.failed });
      if (data.imported > 0) {
        setTimeout(() => { onAdded(); onClose(); }, 1500);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1a2e] border border-stroke rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Plus size={16} className="text-emerald-400" />
            {bulkMode ? "Bulk Import Leads" : "Add Lead"}
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setBulkMode(!bulkMode)} className="text-[10px] text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-500/20">
              {bulkMode ? "Single" : "Bulk Import"}
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={16} className="text-muted" /></button>
          </div>
        </div>

        {result && (
          <div className={`mx-4 mt-3 p-2 rounded-lg text-xs ${result.imported ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {result.imported ? `${result.imported} leads imported` : ""} {result.failed ? `${result.failed} failed` : ""}
          </div>
        )}

        {bulkMode ? (
          <div className="p-4 space-y-3">
            <p className="text-[11px] text-muted">Paste leads, one per line. Format: <strong>name, phone, country, source</strong></p>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              rows={8}
              placeholder={"David Cohen, +972501234567, Israel, whatsapp\nMaria Santos, +639171234567, Philippines, facebook\nJohn Smith, +61412345678, Australia, website"}
              className="w-full bg-black/30 border border-stroke rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-blue-500/50"
            />
            <button onClick={handleBulk} disabled={saving || !bulkText.trim()} className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-xl py-2 text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Import {bulkText.split("\n").filter(l => l.trim()).length} Leads
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Full Name *" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="col-span-2 bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-blue-500/50" />
              <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-blue-500/50" />
              <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-blue-500/50" />
              <select value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option value="">Country</option>
                <option value="Israel">Israel</option>
                <option value="Philippines">Philippines</option>
                <option value="UAE">UAE</option>
                <option value="South Korea">South Korea</option>
                <option value="Australia">Australia</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option value="manual">Manual</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
            <select value={form.villa_interest} onChange={e => setForm({ ...form, villa_interest: e.target.value })} className="w-full bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
              <option value="">Villa Interest</option>
              <option value="villa_c">Villa C (PHP 35M)</option>
              <option value="villa_d">Villa D (PHP 32.5M)</option>
              <option value="either">Either Villa</option>
            </select>
            <textarea placeholder="Notes / purpose" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-black/30 border border-stroke rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-blue-500/50" />
            <button onClick={handleSingle} disabled={saving || !form.full_name} className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-xl py-2 text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add Lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LeadPipelineSection() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const startEditContact = (lead: Lead) => {
    setEditingContact(lead.id);
    setEditForm({
      full_name: lead.full_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
    });
  };

  const saveContact = async (leadId: string) => {
    setSaving(true);
    try {
      const updates: Record<string, string> = { id: leadId };
      if (editForm.full_name) updates.full_name = editForm.full_name;
      if (editForm.email) updates.email = editForm.email;
      if (editForm.phone) { updates.phone = editForm.phone; updates.whatsapp = editForm.phone; }

      await fetch("/api/marketing/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setEditingContact(null);
      fetchLeads();
    } catch { /* ignore */ }
    setSaving(false);
  };
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    fetch("/api/marketing/leads?limit=100")
      .then((r) => r.json())
      .then((d) => { setLeads(d.leads || []); setTotal(d.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const funnelData = FUNNEL_STAGES.map((stage) => ({
    ...stage,
    count: leads.filter((l) => l.funnel_stage === stage.key).length,
  }));
  const maxCount = Math.max(...funnelData.map((s) => s.count), 1);
  const hotLeads = leads.filter((l) => l.lead_status === "hot" || l.lead_status === "very_hot");

  const copyLeadDetails = (lead: Lead) => {
    const lines = [
      `Lead: ${lead.full_name || "Anonymous"}`,
      `Score: ${lead.lead_score} (${lead.lead_status})`,
      `Source: ${lead.source}`,
      `Language: ${lead.preferred_language || "-"}`,
      lead.phone ? `Phone: ${lead.phone}` : null,
      lead.email ? `Email: ${lead.email}` : null,
      lead.nationality ? `Nationality: ${lead.nationality}` : null,
      `Date: ${new Date(lead.created_at).toLocaleString()}`,
      "",
      "--- Conversation ---",
      ...(lead.raw_data?.conversations?.map(
        (m) => `${m.role === "user" ? "Visitor" : m.isHuman ? (m.sentBy || "You") : "David (AI)"}: ${m.content}`
      ) || ["No conversation recorded"]),
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(lead.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted" size={32} /></div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Users size={18} className="text-emerald-400" /> Lead Pipeline
        </h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted">{total} total</span>
          {hotLeads.length > 0 && <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400 animate-pulse">{hotLeads.length} HOT</span>}
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors"><Plus size={14} /> Add Lead</button>
          <button onClick={fetchLeads} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-surface rounded-2xl border border-stroke p-6">
        <h3 className="text-sm font-semibold mb-4">Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelData.map((stage) => (
            <div key={stage.key} className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted text-right shrink-0">{stage.label}</span>
              <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                <div className={`h-full ${stage.color} rounded-lg transition-all duration-700 flex items-center px-3`}
                  style={{ width: `${Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 8 : 0)}%` }}>
                  {stage.count > 0 && <span className="text-xs font-bold text-white">{stage.count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {leads.length > 0 ? (
        <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <div className="px-6 py-4 border-b border-stroke"><h3 className="text-sm font-semibold">All Leads</h3></div>
          <div>
            {leads.map((lead) => {
              const isExpanded = expandedLead === lead.id;
              const conversations = lead.raw_data?.conversations || [];
              const hasConversation = conversations.length > 0;
              const signals = lead.raw_data?.signals || [];
              const sessionId = lead.raw_data?.chatbot_session_id;

              return (
                <div key={lead.id} className="border-b border-stroke/50">
                  {/* Lead Row */}
                  <button
                    onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                    className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-white/[0.02] transition-colors text-sm"
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      lead.lead_status === "hot" || lead.lead_status === "very_hot"
                        ? "bg-red-500/20 text-red-400"
                        : lead.lead_status === "warm"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {lead.lead_score}
                    </div>

                    <div className="min-w-[120px]">
                      <p className="font-medium">{lead.full_name || "Anonymous"}</p>
                      <p className="text-[10px] text-muted">{lead.source || "-"}</p>
                    </div>

                    <div className="flex items-center gap-2 text-muted min-w-[80px]">
                      {lead.phone && <Phone size={12} className="text-emerald-400" />}
                      {lead.email && <Mail size={12} className="text-emerald-400" />}
                      {!lead.phone && !lead.email && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400">NO CONTACT</span>
                      )}
                      {lead.nationality && <><Globe size={12} /><span className="text-xs">{lead.nationality}</span></>}
                      {hasConversation && <MessageCircle size={12} className="text-[#89AACC]" />}
                    </div>

                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${STATUS_COLORS[lead.lead_status] || "bg-white/5 text-muted"}`}>
                      {lead.lead_status}
                    </span>

                    <span className="text-muted text-xs shrink-0 hidden sm:block">{lead.funnel_stage}</span>

                    <span className="text-muted text-xs shrink-0 ml-auto">
                      {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" "}
                      {new Date(lead.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>

                    {isExpanded ? <ChevronUp size={14} className="text-muted shrink-0" /> : <ChevronDown size={14} className="text-muted shrink-0" />}
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-stroke/30 px-6 py-4 space-y-4 bg-white/[0.01]">
                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {(lead.lead_status === "hot" || lead.lead_status === "very_hot") && (
                          <a
                            href={`https://wa.me/639958565865?text=${encodeURIComponent(`Hi, following up on a HOT lead (score ${lead.lead_score})${lead.full_name ? ` - ${lead.full_name}` : ""}. Check the dashboard for conversation details.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <ExternalLink size={12} /> Contact on WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => copyLeadDetails(lead)}
                          className="flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-muted hover:text-white transition-colors"
                        >
                          {copied === lead.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copied === lead.id ? "Copied!" : "Copy Details"}
                        </button>
                        <button
                          onClick={() => startEditContact(lead)}
                          className="flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-muted hover:text-white transition-colors"
                        >
                          <Plus size={12} /> Edit Contact Info
                        </button>
                      </div>

                      {/* Inline Contact Edit Form */}
                      {editingContact === lead.id && (
                        <div className="rounded-xl bg-white/5 border border-[#89AACC]/20 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-[#89AACC] uppercase tracking-wider">Edit Contact Details</label>
                            <button onClick={() => setEditingContact(null)} className="text-muted hover:text-white"><X size={14} /></button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              value={editForm.full_name}
                              onChange={(e) => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                              placeholder="Full name"
                              className="bg-black/20 border border-stroke rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted/50 outline-none focus:border-[#89AACC]/30"
                            />
                            <input
                              value={editForm.phone}
                              onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                              placeholder="Phone (+972... / 09...)"
                              className="bg-black/20 border border-stroke rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted/50 outline-none focus:border-[#89AACC]/30"
                            />
                            <input
                              value={editForm.email}
                              onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                              placeholder="Email"
                              className="bg-black/20 border border-stroke rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted/50 outline-none focus:border-[#89AACC]/30"
                            />
                          </div>
                          <button
                            onClick={() => saveContact(lead.id)}
                            disabled={saving}
                            className="flex items-center gap-1.5 rounded-lg bg-[#89AACC]/20 border border-[#89AACC]/30 px-4 py-2 text-xs font-bold text-[#89AACC] hover:bg-[#89AACC]/30 disabled:opacity-50 transition-colors"
                          >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            {saving ? "Saving..." : "Save Contact"}
                          </button>
                        </div>
                      )}

                      {/* Signals */}
                      {signals.length > 0 && (
                        <div>
                          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Qualification Signals</label>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {signals.map((signal, i) => (
                              <span key={i} className="rounded-full bg-[#89AACC]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#89AACC]">
                                {signal.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Takeover Panel (for chatbot conversations with session) */}
                      {sessionId ? (
                        <TakeoverPanel lead={lead} sessionId={sessionId} onUpdate={fetchLeads} />
                      ) : hasConversation ? (
                        /* Read-only conversation for non-chatbot leads */
                        <div>
                          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                            Conversation ({conversations.length} messages)
                          </label>
                          <div className="mt-2 space-y-2 max-h-[400px] overflow-y-auto">
                            {conversations.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                                  msg.role === "user"
                                    ? "bg-[#89AACC]/10 border border-[#89AACC]/20"
                                    : "bg-white/5 border border-stroke"
                                }`}>
                                  <span className="text-[9px] font-bold text-muted">{msg.role === "user" ? "VISITOR" : "DAVID"}</span>
                                  <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap mt-0.5">{msg.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-white/5 border border-stroke px-4 py-3">
                          <p className="text-xs text-muted">No conversation recorded for this lead.</p>
                        </div>
                      )}

                      {/* Lead details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                          <p className="text-[9px] text-muted">Score</p>
                          <p className="text-sm font-bold">{lead.lead_score}</p>
                        </div>
                        <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                          <p className="text-[9px] text-muted">Language</p>
                          <p className="text-sm font-bold">{lead.preferred_language === "he" ? "Hebrew" : lead.preferred_language || "-"}</p>
                        </div>
                        <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                          <p className="text-[9px] text-muted">First Contact</p>
                          <p className="text-sm font-bold">{new Date(lead.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                          <p className="text-[9px] text-muted">Last Activity</p>
                          <p className="text-sm font-bold">{new Date(lead.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <Users size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">No leads yet. They will appear here once visitors use the chatbot.</p>
          <p className="text-xs text-muted/50 mt-2">Sources: website chatbot, Meta Lead Ads, WhatsApp, Facebook groups</p>
        </div>
      )}
      {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} onAdded={fetchLeads} />}
    </section>
  );
}
