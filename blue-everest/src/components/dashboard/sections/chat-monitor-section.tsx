"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle, Users, PhoneForwarded, TrendingUp,
  Globe, Clock, ExternalLink, Loader2, RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  session_id: string;
  language: string;
  messages: Array<{ role: string; content: string }>;
  lead_signals: Record<string, unknown>;
  lead_score: number;
  lead_status: string;
  source: string;
  started_at: string;
  last_message_at: string;
}

export function ChatMonitorSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = () => {
    setLoading(true);
    fetch("/api/marketing/knowledge?contentType=conversation")
      .then(() => {
        // Conversations come from Supabase directly
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          return fetch(`${supabaseUrl}/rest/v1/conversations?order=last_message_at.desc&limit=50`, {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          });
        }
        return fetch("/api/marketing/agents?agentName=sales_chatbot");
      })
      .then((r) => r.json())
      .then((d) => {
        const convs = Array.isArray(d) ? d : d.conversations || d.runs || [];
        setConversations(convs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchConversations(); }, []);

  const totalConversations = conversations.length;
  const hotConversations = conversations.filter((c) => c.lead_status === "hot" || c.lead_status === "warm").length;
  const hebrewConversations = conversations.filter((c) => c.language === "he").length;

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
          <MessageCircle size={18} className="text-green-400" /> Chat Monitor
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchConversations} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <MessageCircle className="mx-auto mb-1.5 text-[#89AACC]" size={18} />
          <p className="font-display text-2xl font-bold">{totalConversations}</p>
          <p className="text-[10px] text-muted">Conversations</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <TrendingUp className="mx-auto mb-1.5 text-amber-400" size={18} />
          <p className="font-display text-2xl font-bold">{hotConversations}</p>
          <p className="text-[10px] text-muted">Hot/Warm Leads</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <PhoneForwarded className="mx-auto mb-1.5 text-green-400" size={18} />
          <p className="font-display text-2xl font-bold">{conversations.filter((c) => (c.lead_score || 0) >= 70).length}</p>
          <p className="text-[10px] text-muted">WhatsApp Handoffs</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Globe className="mx-auto mb-1.5 text-purple-400" size={18} />
          <p className="font-display text-2xl font-bold">{hebrewConversations}/{totalConversations - hebrewConversations}</p>
          <p className="text-[10px] text-muted">Hebrew / English</p>
        </div>
      </div>

      {/* Open Chat Link */}
      <div className="bg-gradient-to-r from-[#89AACC]/10 to-[#4E85BF]/10 rounded-2xl border border-[#4E85BF]/20 p-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold">Sales Chatbot - David</h3>
          <p className="text-sm text-muted mt-1">RAG-powered, Claude Sonnet 4, Hebrew + English, lead qualification</p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Open Chat <ExternalLink size={14} />
        </Link>
      </div>

      {/* Conversations Table */}
      {conversations.length > 0 ? (
        <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <div className="px-6 py-4 border-b border-stroke">
            <h3 className="text-sm font-semibold">Recent Conversations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke text-left text-xs text-muted">
                  <th className="px-6 py-3 font-medium">Session</th>
                  <th className="px-6 py-3 font-medium">Language</th>
                  <th className="px-6 py-3 font-medium">Messages</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Started</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((conv) => {
                  const msgs = Array.isArray(conv.messages) ? conv.messages : [];
                  return (
                    <tr key={conv.id} className="border-b border-stroke/50 hover:bg-white/[0.02]">
                      <td className="px-6 py-3 font-mono text-xs text-muted">{(conv.session_id || conv.id).slice(0, 8)}...</td>
                      <td className="px-6 py-3 flex items-center gap-1.5"><Globe size={12} className="text-muted" />{conv.language || "en"}</td>
                      <td className="px-6 py-3">{msgs.length}</td>
                      <td className="px-6 py-3 font-bold">{conv.lead_score || 0}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          conv.lead_status === "hot" ? "bg-red-500/20 text-red-400" :
                          conv.lead_status === "warm" ? "bg-amber-500/20 text-amber-400" :
                          "bg-white/5 text-muted"
                        }`}>{conv.lead_status || "cold"}</span>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted">
                        <Clock size={12} className="inline mr-1" />
                        {new Date(conv.started_at || conv.last_message_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <MessageCircle size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">No conversations yet. They will appear here once visitors use the chatbot.</p>
          <p className="text-xs text-muted/50 mt-2">Try it yourself: <a href="/chat" className="text-[#89AACC] underline">blue-everest.com/chat</a></p>
        </div>
      )}
    </section>
  );
}
