"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  Check,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  UserRound,
  WifiOff,
} from "lucide-react";

type Channel = "all" | "website_chat" | "facebook_dm" | "facebook_comment" | "whatsapp" | "email" | "crm";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

type Thread = {
  id: string;
  leadId: string | null;
  sessionId: string | null;
  channel: Exclude<Channel, "all">;
  status: "open" | "waiting_human" | "agent_ready" | "follow_up" | "closed";
  agentMode: "auto" | "human_takeover";
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientOrigin: string | null;
  language: "he" | "en";
  leadScore: number;
  leadStatus: string;
  funnelStage: string | null;
  villaInterest: string | null;
  assignedTo: string | null;
  lastMessageAt: string;
  unread: boolean;
  messages: Message[];
  summary: string;
  nextBestAction: string;
  suggestedReply: string;
  signals: string[];
  canSendLive: boolean;
  provider: "meta_messenger" | "whatsapp_cloud" | "website_chat" | "log_only";
  blockers: string[];
};

type InboxResponse = {
  threads: Thread[];
  summary: {
    total: number;
    unread: number;
    hot: number;
    readyForAgent: number;
    byChannel: Record<string, number>;
  };
  providers: {
    metaMessenger: { configured: boolean };
    whatsAppCloud: { configured: boolean };
    supabaseServiceRoleConfigured: boolean;
    watiRequired: boolean;
  };
  policy: { outboundDefault: string };
};

const CHANNEL_LABELS: Record<Exclude<Channel, "all">, string> = {
  website_chat: "Website",
  facebook_dm: "Messenger",
  facebook_comment: "FB Comment",
  whatsapp: "WhatsApp",
  email: "Email",
  crm: "CRM",
};

const STATUS_LABELS: Record<Thread["status"], string> = {
  open: "Open",
  waiting_human: "Human",
  agent_ready: "David ready",
  follow_up: "Follow-up",
  closed: "Closed",
};

function channelIcon(channel: Thread["channel"]) {
  if (channel === "facebook_dm" || channel === "facebook_comment") return <MessageCircle size={14} />;
  if (channel === "whatsapp") return <Phone size={14} />;
  if (channel === "website_chat") return <MessageCircle size={14} />;
  return <UserRound size={14} />;
}

function timeAgo(value: string) {
  const date = new Date(value).getTime();
  if (!Number.isFinite(date)) return "now";
  const minutes = Math.max(0, Math.floor((Date.now() - date) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function statusClass(status: Thread["status"]) {
  if (status === "agent_ready") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "waiting_human") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  if (status === "follow_up") return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  if (status === "closed") return "border-white/10 bg-white/5 text-muted";
  return "border-[#4E85BF]/30 bg-[#4E85BF]/10 text-[#89AACC]";
}

function scoreClass(score: number) {
  if (score >= 90) return "text-red-300";
  if (score >= 70) return "text-amber-300";
  if (score >= 40) return "text-[#89AACC]";
  return "text-muted";
}

export function ConversationsInboxSection() {
  const [data, setData] = useState<InboxResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchInbox = async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "120" });
      if (channel !== "all") params.set("channel", channel);
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/marketing/conversations?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as InboxResponse;
      setData(json);
      setSelectedId((current) => current ?? json.threads?.[0]?.id ?? null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    const timer = window.setInterval(() => fetchInbox(true), 30000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  const threads = data?.threads ?? [];
  const selected = useMemo(
    () => threads.find((thread) => thread.id === selectedId) ?? threads[0] ?? null,
    [threads, selectedId]
  );

  useEffect(() => {
    if (selected) setReply(selected.suggestedReply);
  }, [selected?.id, selected?.suggestedReply]);

  const suggest = async () => {
    if (!selected) return;
    setNotice(null);
    const res = await fetch(`/api/marketing/conversations/${selected.id}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (json.suggestion?.message) setReply(json.suggestion.message);
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/marketing/conversations/${selected.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: reply.trim(),
          approved: true,
          operator: "dashboard",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Send failed");
      setNotice(json.liveSend ? "Reply sent live and saved to CRM." : "Reply saved to CRM. Live channel is not connected.");
      await fetchInbox(true);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Reply failed");
    } finally {
      setSending(false);
    }
  };

  const updateThread = async (patch: Record<string, unknown>) => {
    if (!selected) return;
    await fetch(`/api/marketing/conversations/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, operator: "dashboard" }),
    });
    await fetchInbox(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={30} />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-stroke bg-surface p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted">Threads</p>
          <p className="mt-1 font-display text-2xl font-semibold">{data?.summary.total ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-surface p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted">Need answer</p>
          <p className="mt-1 font-display text-2xl font-semibold text-emerald-300">{data?.summary.readyForAgent ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-surface p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted">Hot leads</p>
          <p className="mt-1 font-display text-2xl font-semibold text-amber-300">{data?.summary.hot ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stroke bg-surface p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted">WATI dependency</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Check size={15} /> Not required
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stroke bg-surface p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") fetchInbox();
            }}
            placeholder="Search client, phone, message..."
            className="h-9 w-full rounded-lg border border-stroke bg-bg pl-9 pr-3 text-sm outline-none focus:border-[#4E85BF]"
          />
        </div>
        {(["all", "website_chat", "facebook_dm", "whatsapp", "crm"] as Channel[]).map((item) => (
          <button
            key={item}
            onClick={() => setChannel(item)}
            className={`h-9 rounded-lg px-3 text-xs font-semibold transition-colors ${
              channel === item ? "bg-[#4E85BF] text-white" : "border border-stroke text-muted hover:text-white"
            }`}
          >
            {item === "all" ? "All" : CHANNEL_LABELS[item as Exclude<Channel, "all">]}
          </button>
        ))}
        <button
          onClick={() => fetchInbox(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-stroke px-3 text-xs font-semibold text-muted hover:text-white"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid min-h-[620px] gap-4 lg:grid-cols-[340px_1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-stroke bg-surface">
          <div className="border-b border-stroke px-4 py-3">
            <h3 className="text-sm font-semibold">Unified inbox</h3>
            <p className="text-xs text-muted">Website, Messenger, WhatsApp and CRM in one queue.</p>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedId(thread.id)}
                className={`w-full border-b border-stroke/70 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${
                  selected?.id === thread.id ? "bg-[#4E85BF]/10" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                    <span className={thread.unread ? "text-emerald-300" : "text-muted"}>{channelIcon(thread.channel)}</span>
                    <span className="truncate">{thread.clientName || thread.clientPhone || "Unknown lead"}</span>
                  </span>
                  <span className="text-[10px] text-muted">{timeAgo(thread.lastMessageAt)}</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(thread.status)}`}>
                    {STATUS_LABELS[thread.status]}
                  </span>
                  <span className="rounded-full border border-stroke px-2 py-0.5 text-[10px] text-muted">
                    {CHANNEL_LABELS[thread.channel]}
                  </span>
                  <span className={`ml-auto text-xs font-bold ${scoreClass(thread.leadScore)}`}>{thread.leadScore}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                  {thread.messages[thread.messages.length - 1]?.content || thread.summary}
                </p>
              </button>
            ))}
            {threads.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-muted">
                No conversations found for this filter.
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-stroke bg-surface">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-stroke px-5 py-4">
                <div>
                  <h3 className="font-display text-lg font-semibold">{selected.clientName || selected.clientPhone || "Unknown lead"}</h3>
                  <p className="text-xs text-muted">
                    {CHANNEL_LABELS[selected.channel]} - {selected.language.toUpperCase()} - {selected.leadStatus}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateThread({ agentMode: "human_takeover" })}
                    className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10"
                  >
                    Human takeover
                  </button>
                  <button
                    onClick={() => updateThread({ agentMode: "auto" })}
                    className="rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                  >
                    Return to David
                  </button>
                </div>
              </div>

              <div className="max-h-[350px] space-y-3 overflow-y-auto px-5 py-4">
                {selected.messages.map((message, index) => (
                  <div key={`${message.timestamp ?? index}-${index}`} className={`flex ${message.role === "assistant" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] rounded-lg border px-4 py-3 ${
                        message.role === "assistant"
                          ? "border-[#4E85BF]/30 bg-[#4E85BF]/10"
                          : "border-stroke bg-bg"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold text-muted">
                        {message.role === "assistant" ? <Bot size={12} /> : <UserRound size={12} />}
                        {message.role === "assistant" ? "David / Team" : selected.clientName || "Client"}
                        <span>{message.timestamp ? new Date(message.timestamp).toLocaleString() : ""}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed" dir={selected.language === "he" ? "rtl" : "ltr"}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stroke p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#89AACC]">
                    <Sparkles size={14} /> David suggested reply
                  </p>
                  <button onClick={suggest} className="text-xs font-semibold text-muted hover:text-white">
                    Regenerate
                  </button>
                </div>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={7}
                  className="w-full resize-none rounded-lg border border-stroke bg-bg px-3 py-3 text-sm leading-relaxed outline-none focus:border-[#4E85BF]"
                  dir="auto"
                />
                {notice && (
                  <p className={`mt-2 text-xs ${notice.includes("failed") || notice.includes("required") ? "text-amber-300" : "text-emerald-300"}`}>
                    {notice}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d73aa] disabled:opacity-40"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Approve and send/log
                  </button>
                  <span className="text-xs text-muted">
                    {selected.canSendLive ? "Live provider ready." : "No live provider. CRM log only."}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted">Select a conversation.</div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-stroke bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold">Lead profile</h3>
            {selected ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-muted">Phone</span><span className="text-right">{selected.clientPhone || "Missing"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted">Email</span><span className="text-right">{selected.clientEmail || "Missing"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted">Country</span><span>{selected.clientOrigin || "Unknown"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted">Villa</span><span>{selected.villaInterest || "Unknown"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted">Funnel</span><span>{selected.funnelStage || "new"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted">Agent mode</span><span>{selected.agentMode}</span></div>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-stroke bg-surface p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Clock size={15} /> Next best action
            </h3>
            <p className="text-sm leading-relaxed text-muted">{selected?.nextBestAction ?? "No active conversation selected."}</p>
          </div>

          <div className="rounded-lg border border-stroke bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">Signals</h3>
            <div className="flex flex-wrap gap-1.5">
              {(selected?.signals ?? []).length > 0 ? (
                selected?.signals.map((signal) => (
                  <span key={signal} className="rounded-full bg-[#89AACC]/10 px-2 py-1 text-[10px] text-[#89AACC]">
                    {signal.replaceAll("_", " ")}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted">No signals yet.</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-surface p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <WifiOff size={15} /> Provider status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted">Messenger</span><span className={data?.providers.metaMessenger.configured ? "text-emerald-300" : "text-amber-300"}>{data?.providers.metaMessenger.configured ? "Ready" : "Missing token"}</span></div>
              <div className="flex justify-between"><span className="text-muted">WhatsApp Cloud</span><span className={data?.providers.whatsAppCloud.configured ? "text-emerald-300" : "text-amber-300"}>{data?.providers.whatsAppCloud.configured ? "Ready" : "Not connected"}</span></div>
              <div className="flex justify-between"><span className="text-muted">WATI</span><span className="text-emerald-300">Optional</span></div>
            </div>
            {selected?.blockers.length ? (
              <div className="mt-3 space-y-2">
                {selected.blockers.map((blocker) => (
                  <p key={blocker} className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-200">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" /> {blocker}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
