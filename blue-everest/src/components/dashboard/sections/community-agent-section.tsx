"use client";

import { useState, useCallback, useMemo, startTransition } from "react";
import {
  Users, BookOpen, MessageSquare, TrendingUp, Target,
  Calendar, CheckCircle2, Clock, Eye, Heart, Edit3,
  MessageCircle, Share2, ChevronDown, ChevronUp, ExternalLink,
  X, Search, Send, Loader2, Copy, Check,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { COMMUNITY_POSTS, type CommunityPost, type CommunityCategory, type CommunityPostStatus } from "@/lib/data/community-posts-data";

/* -- Category config ------------------------------------------------ */

const CATEGORY_CONFIG = {
  EDUCATE: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: BookOpen, label: "Educate", labelHe: "למד" },
  SHOWCASE: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Eye, label: "Showcase", labelHe: "הצג" },
  CONNECT: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: MessageSquare, label: "Connect", labelHe: "חבר" },
  CONVERT: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Target, label: "Convert", labelHe: "המר" },
};

/* -- Edit form ------------------------------------------------------ */

interface EditForm {
  postId: number;
  hebrewCopy: string;
  englishCopy: string;
  image: string;
  status: CommunityPostStatus;
  notes: string;
}

/* -- Publish modal state -------------------------------------------- */

interface PublishState {
  post: CommunityPost | null;
  channels: { group: boolean; page: boolean };
  publishing: boolean;
  results: Record<string, { success: boolean; postId?: string; error?: string; fallback?: string }> | null;
}

/* -- Response tester state ------------------------------------------ */

interface ResponseTest {
  input: string;
  output: string;
  loading: boolean;
  mode: "comment" | "inbox";
}

/* -- Component ------------------------------------------------------ */

export function CommunityAgentSection() {
  const { t } = useTranslation();

  const [posts, setPosts] = useState<CommunityPost[]>([...COMMUNITY_POSTS]);
  const [catFilter, setCatFilter] = useState<"all" | CommunityCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CommunityPostStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [tab, setTab] = useState<"posts" | "calendar" | "respond">("posts");
  const [responseTest, setResponseTest] = useState<ResponseTest>({ input: "", output: "", loading: false, mode: "comment" });
  const [publishState, setPublishState] = useState<PublishState>({ post: null, channels: { group: true, page: false }, publishing: false, results: null });

  /* -- Filtering ------------------------------------------------- */

  const filtered = useMemo(() => posts.filter((p) => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.titleEn.toLowerCase().includes(q) && !String(p.id).includes(q)) return false;
    }
    return true;
  }), [posts, catFilter, statusFilter, searchQuery]);

  const displayed = useMemo(() => showAll ? filtered : filtered.slice(0, 12), [filtered, showAll]);
  const now = new Date();

  /* -- Stats ----------------------------------------------------- */

  const published = posts.filter((p) => p.status === "published").length;
  const ready = posts.filter((p) => p.status === "ready").length;
  const totalReactions = posts.reduce((s, p) => s + p.reactions, 0);
  const totalComments = posts.reduce((s, p) => s + p.comments, 0);

  const upcoming = posts
    .filter((p) => p.status === "ready" && new Date(p.scheduled) >= now)
    .sort((a, b) => new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime())
    .slice(0, 5);

  const categoryBreakdown = (["EDUCATE", "SHOWCASE", "CONNECT", "CONVERT"] as const).map((cat) => {
    const cp = posts.filter((p) => p.category === cat);
    const pub = cp.filter((p) => p.status === "published").length;
    return { category: cat, total: cp.length, published: pub, pct: Math.round((cp.length / posts.length) * 100) };
  });

  /* -- Edit handlers --------------------------------------------- */

  const openEdit = useCallback((post: CommunityPost) => {
    setEditForm({
      postId: post.id,
      hebrewCopy: post.hebrewCopy,
      englishCopy: post.englishCopy,
      image: post.image,
      status: post.status,
      notes: post.notes,
    });
  }, []);

  const saveEdit = useCallback(() => {
    if (!editForm) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editForm.postId
          ? { ...p, hebrewCopy: editForm.hebrewCopy, englishCopy: editForm.englishCopy, image: editForm.image, status: editForm.status, notes: editForm.notes }
          : p
      )
    );
    setEditForm(null);
  }, [editForm]);

  /* -- Copy to clipboard ----------------------------------------- */

  const copyPost = useCallback((post: CommunityPost) => {
    const text = `${post.hebrewCopy}\n\n---\n\n${post.englishCopy}`;
    navigator.clipboard.writeText(text);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  /* -- Publish handlers ------------------------------------------- */
  // Meta deprecated publish_to_groups API. Group posts are MANUAL ONLY.
  // Flow: Copy text -> Open group -> Paste -> Upload image -> Mark as published.

  const copyAndOpenGroup = useCallback((post: CommunityPost) => {
    const message = `${post.hebrewCopy}\n\n---\n\n${post.englishCopy}`;
    navigator.clipboard.writeText(message);
    // Open the image in a new tab so user can right-click > Save or drag it
    window.open(post.image, "_blank");
    // Small delay then open the group so both tabs open
    setTimeout(() => {
      window.open("https://www.facebook.com/groups/investment.ph.il/", "_blank");
    }, 300);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 3000);
  }, []);

  const markAsPublished = useCallback((postId: number) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, status: "published" as CommunityPostStatus } : p));
    setPublishState({ post: null, channels: { group: true, page: false }, publishing: false, results: null });
    // Update server-side status
    fetch("/api/marketing/community-agent/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, channels: ["group"], markOnly: true }),
    }).catch(() => {});
  }, []);

  /* -- Response tester ------------------------------------------- */

  const testResponse = useCallback(async () => {
    if (!responseTest.input.trim()) return;
    setResponseTest((prev) => ({ ...prev, loading: true, output: "" }));
    try {
      const res = await fetch("/api/marketing/community-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: responseTest.input, history: [], mode: responseTest.mode }),
      });
      const data = await res.json();
      setResponseTest((prev) => ({ ...prev, loading: false, output: data.reply || "No response" }));
    } catch {
      setResponseTest((prev) => ({ ...prev, loading: false, output: "Error connecting to agent" }));
    }
  }, [responseTest.input, responseTest.mode]);

  /* -- Calendar data --------------------------------------------- */

  const calendarWeeks: { weekLabel: string; posts: CommunityPost[] }[] = [];
  const sortedByDate = [...posts].sort((a, b) => new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime());
  let currentWeek = "";
  for (const p of sortedByDate) {
    const d = new Date(p.scheduled);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const wk = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (wk !== currentWeek) {
      currentWeek = wk;
      calendarWeeks.push({ weekLabel: `Week of ${wk}`, posts: [] });
    }
    calendarWeeks[calendarWeeks.length - 1].posts.push(p);
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Users size={18} className="text-violet-400" />
            {t.dashboard.sections.communityAgent}
          </h2>
          <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-400">
            {posts.length} Posts
          </span>
        </div>
        <a
          href="https://www.facebook.com/groups/investment.ph.il/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <ExternalLink size={14} />
          Open Group
        </a>
      </div>

      {/* Mission Card */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-[#4E85BF]/5 p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Users size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1">Israeli RE Community Agent</h3>
            <p className="text-xs text-muted leading-relaxed">
              Authority-building content for the Israeli Facebook group. {posts.length} bilingual posts
              (Hebrew + English). Trained for comment replies, inbox responses, and lead qualification.
              Consults other agents (David, CMO, Analytics) for complex questions.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] text-muted flex items-center gap-1"><Calendar size={10} /> Jun 1 - Aug 28, 2026</span>
              <span className="text-[10px] text-muted flex items-center gap-1"><Clock size={10} /> 4/week, Sun-Thu</span>
              <span className="text-[10px] text-muted flex items-center gap-1"><MessageCircle size={10} /> 8-10 PM Israel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <CheckCircle2 className="mx-auto mb-1.5 text-emerald-400" size={18} />
          <p className="font-display text-2xl font-bold">{published}<span className="text-sm text-muted font-normal">/{posts.length}</span></p>
          <p className="text-[10px] text-muted">Published</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Clock className="mx-auto mb-1.5 text-amber-400" size={18} />
          <p className="font-display text-2xl font-bold">{ready}</p>
          <p className="text-[10px] text-muted">Ready to Post</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <Heart className="mx-auto mb-1.5 text-rose-400" size={18} />
          <p className="font-display text-2xl font-bold">{totalReactions}</p>
          <p className="text-[10px] text-muted">Total Reactions</p>
        </div>
        <div className="bg-surface rounded-xl border border-stroke p-4 text-center">
          <MessageCircle className="mx-auto mb-1.5 text-[#89AACC]" size={18} />
          <p className="font-display text-2xl font-bold">{totalComments}</p>
          <p className="text-[10px] text-muted">Total Comments</p>
        </div>
      </div>

      {/* Content Mix */}
      <div className="bg-surface rounded-2xl border border-stroke p-5">
        <h3 className="text-sm font-semibold mb-4">Content Mix (40/30/20/10)</h3>
        <div className="space-y-3">
          {categoryBreakdown.map(({ category, total, published: pub, pct }) => {
            const config = CATEGORY_CONFIG[category];
            const CatIcon = config.icon;
            return (
              <div key={category} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-28 shrink-0">
                  <CatIcon size={14} className={config.color} />
                  <span className="text-xs font-medium">{config.label}</span>
                </div>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${
                    category === "EDUCATE" ? "from-blue-500/60 to-blue-400/40" :
                    category === "SHOWCASE" ? "from-emerald-500/60 to-emerald-400/40" :
                    category === "CONNECT" ? "from-amber-500/60 to-amber-400/40" :
                    "from-rose-500/60 to-rose-400/40"
                  }`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted w-24 text-right">{pub}/{total} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-stroke pb-0">
        {(["posts", "calendar", "respond"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              tab === t ? "border-violet-400 text-violet-400" : "border-transparent text-muted hover:text-text-primary"
            }`}
          >
            {t === "posts" ? "Posts" : t === "calendar" ? "Calendar" : "Response Tester"}
          </button>
        ))}
      </div>

      {/* ═══════════════ TAB: POSTS ═══════════════ */}
      {tab === "posts" && (
        <>
          {/* Filters + Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-surface pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-muted focus:border-violet-500/50 focus:outline-none"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as typeof catFilter)}
              className="rounded-lg border border-stroke bg-surface px-3 py-2 text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="EDUCATE">Educate (20)</option>
              <option value="SHOWCASE">Showcase (15)</option>
              <option value="CONNECT">Connect (10)</option>
              <option value="CONVERT">Convert (5)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-stroke bg-surface px-3 py-2 text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="ready">Ready</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <span className="text-xs text-muted ml-auto">{filtered.length} posts</span>
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {displayed.map((post) => {
              const config = CATEGORY_CONFIG[post.category];
              const CatIcon = config.icon;
              const date = new Date(post.scheduled);
              const isPast = date < now;
              const isExpanded = expandedId === post.id;

              return (
                <div key={post.id} className={`bg-surface rounded-xl border transition-colors ${isExpanded ? "border-violet-500/30" : "border-stroke hover:border-[#4E85BF]/20"}`}>
                  {/* Card header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => startTransition(() => setExpandedId(isExpanded ? null : post.id))}
                  >
                    {/* Image thumb */}
                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-white/5">
                      <img src={post.image} alt="" className="h-full w-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`h-5 w-5 rounded ${config.bg} flex items-center justify-center`}>
                          <CatIcon size={10} className={config.color} />
                        </span>
                        <span className="text-[10px] text-muted font-mono">#{post.id}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          post.status === "published" ? "bg-emerald-500/20 text-emerald-400" :
                          isPast ? "bg-amber-500/20 text-amber-400" :
                          "bg-white/5 text-muted"
                        }`}>
                          {post.status === "published" ? "Published" : isPast ? "Overdue" : "Scheduled"}
                        </span>
                      </div>
                      <p className="text-xs font-medium truncate" dir="rtl">{post.title}</p>
                      <p className="text-[10px] text-muted">{date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} - {post.titleEn}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyPost(post); }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === post.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(post); }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text-primary transition-colors"
                        title="Edit post"
                      >
                        <Edit3 size={14} />
                      </button>
                      {isExpanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-stroke px-4 pb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {/* Hebrew copy */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Hebrew</span>
                            <div className="flex-1 h-px bg-stroke" />
                          </div>
                          <div
                            dir="rtl"
                            className="text-xs leading-relaxed text-text-primary/80 whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-1 scrollbar-thin"
                          >
                            {post.hebrewCopy || "Copy not loaded yet"}
                          </div>
                        </div>

                        {/* English copy */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-[#89AACC] uppercase tracking-wider">English</span>
                            <div className="flex-1 h-px bg-stroke" />
                          </div>
                          <div className="text-xs leading-relaxed text-text-primary/80 whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                            {post.englishCopy || "Copy not loaded yet"}
                          </div>
                        </div>
                      </div>

                      {/* Post image full */}
                      <div className="mt-4 rounded-lg overflow-hidden">
                        <img src={post.image} alt="" className="w-full h-auto max-h-64 object-cover rounded-lg" />
                      </div>

                      {/* Publish actions */}
                      {post.status !== "published" && (
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-stroke">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyAndOpenGroup(post); }}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                          >
                            {copiedId === post.id ? <Check size={12} /> : <Copy size={12} />}
                            {copiedId === post.id ? "Copied! Paste in group" : "Copy & Open Group"}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); markAsPublished(post.id); }}
                            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                          >
                            <CheckCircle2 size={12} /> Mark Published
                          </button>
                        </div>
                      )}

                      {/* Engagement stats - editable for published posts */}
                      {post.status === "published" && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stroke">
                          <label className="flex items-center gap-1.5 text-xs text-muted">
                            <Heart size={12} />
                            <input
                              type="number"
                              min={0}
                              value={post.reactions}
                              onChange={(e) => { e.stopPropagation(); setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, reactions: Number(e.target.value) || 0 } : p)); }}
                              className="w-12 bg-transparent border-b border-stroke text-center text-xs text-text-primary focus:border-violet-500 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-muted">
                            <MessageCircle size={12} />
                            <input
                              type="number"
                              min={0}
                              value={post.comments}
                              onChange={(e) => { e.stopPropagation(); setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, comments: Number(e.target.value) || 0 } : p)); }}
                              className="w-12 bg-transparent border-b border-stroke text-center text-xs text-text-primary focus:border-violet-500 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-muted">
                            <Share2 size={12} />
                            <input
                              type="number"
                              min={0}
                              value={post.shares}
                              onChange={(e) => { e.stopPropagation(); setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, shares: Number(e.target.value) || 0 } : p)); }}
                              className="w-12 bg-transparent border-b border-stroke text-center text-xs text-text-primary focus:border-violet-500 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </label>
                          <span className="text-[9px] text-muted ml-auto">Click numbers to update</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show More */}
          {filtered.length > 12 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 mx-auto text-xs text-muted hover:text-text-primary transition-colors"
            >
              {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showAll ? "Show Less" : `Show All ${filtered.length} Posts`}
            </button>
          )}
        </>
      )}

      {/* ═══════════════ TAB: CALENDAR ═══════════════ */}
      {tab === "calendar" && (
        <div className="space-y-4">
          {calendarWeeks.map((week) => (
            <div key={week.weekLabel} className="bg-surface rounded-xl border border-stroke overflow-hidden">
              <div className="px-4 py-3 border-b border-stroke bg-white/[0.02]">
                <h4 className="text-xs font-semibold">{week.weekLabel}</h4>
              </div>
              <div className="divide-y divide-stroke/50">
                {week.posts.map((post) => {
                  const config = CATEGORY_CONFIG[post.category];
                  const CatIcon = config.icon;
                  const d = new Date(post.scheduled);
                  return (
                    <div key={post.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02]">
                      <span className="text-[10px] text-muted w-12 shrink-0 font-mono">
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <span className="text-[10px] text-muted w-14 shrink-0">
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className={`h-5 w-5 rounded ${config.bg} flex items-center justify-center shrink-0`}>
                        <CatIcon size={10} className={config.color} />
                      </span>
                      <span className="text-xs font-mono text-muted w-8 shrink-0">#{post.id}</span>
                      <span className="text-xs truncate flex-1" dir="rtl">{post.title}</span>
                      <span className={`rounded-full ${config.bg} ${config.border} border px-2 py-0.5 text-[8px] font-bold ${config.color} shrink-0`}>
                        {config.label}
                      </span>
                      <button
                        onClick={() => { setTab("posts"); setExpandedId(post.id); }}
                        className="text-[10px] text-violet-400 hover:underline shrink-0"
                      >
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════ TAB: RESPONSE TESTER ═══════════════ */}
      {tab === "respond" && (
        <div className="space-y-4">
          <div className="bg-surface rounded-2xl border border-stroke p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare size={14} className="text-violet-400" /> Test Community Agent Responses
            </h3>
            <p className="text-xs text-muted mb-4">
              Type a question as if you are a group member. The agent will respond using its trained knowledge base,
              intent detection, and lead qualification system.
            </p>

            {/* Mode toggle */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-muted">Mode:</span>
              <button
                onClick={() => setResponseTest((prev) => ({ ...prev, mode: "comment" }))}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${responseTest.mode === "comment" ? "bg-violet-500/20 text-violet-400" : "text-muted"}`}
              >
                Comment Reply
              </button>
              <button
                onClick={() => setResponseTest((prev) => ({ ...prev, mode: "inbox" }))}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${responseTest.mode === "inbox" ? "bg-violet-500/20 text-violet-400" : "text-muted"}`}
              >
                Inbox/DM Reply
              </button>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={responseTest.mode === "comment" ? "כמה עולה וילה בפנגלאו?" : "Hi, interested in investment in Panglao..."}
                value={responseTest.input}
                onChange={(e) => setResponseTest((prev) => ({ ...prev, input: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && testResponse()}
                className="flex-1 rounded-lg border border-stroke bg-bg px-3 py-2.5 text-xs text-text-primary placeholder:text-muted focus:border-violet-500/50 focus:outline-none"
              />
              <button
                onClick={testResponse}
                disabled={responseTest.loading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-[#4E85BF] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {responseTest.loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Test
              </button>
            </div>

            {/* Output */}
            {responseTest.output && (
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={12} className="text-violet-400" />
                  <span className="text-[10px] font-bold text-violet-400">Community Agent Response</span>
                  <span className="text-[10px] text-muted">({responseTest.mode})</span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{responseTest.output}</p>
              </div>
            )}
          </div>

          {/* Quick test examples */}
          <div className="bg-surface rounded-2xl border border-stroke p-5">
            <h4 className="text-xs font-semibold mb-3">Quick Test Examples</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                "כמה עולה וילה?",
                "What's the ROI?",
                "האם זרים יכולים לקנות?",
                "Why not Greece?",
                "מה לגבי טייפונים?",
                "How do I start?",
                "What about Airbnb occupancy?",
                "מס רווחי הון?",
                "Tell me about Bohol",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setResponseTest((prev) => ({ ...prev, input: q })); }}
                  className="rounded-lg border border-stroke px-3 py-2 text-[10px] text-muted hover:text-text-primary hover:border-violet-500/30 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Targets */}
      <div className="bg-surface rounded-2xl border border-stroke p-5">
        <h3 className="text-sm font-semibold mb-4">3-Month Targets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Group Growth", target: "+200", current: "0", icon: Users },
            { label: "Avg Engagement", target: "10+", current: "0", icon: Heart },
            { label: "DM Inquiries", target: "20", current: "0", icon: MessageSquare },
            { label: "Qualified Leads", target: "5", current: "0", icon: Target },
            { label: "Saves/Shares", target: "50", current: "0", icon: Share2 },
          ].map(({ label, target, current, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon size={14} className="mx-auto mb-1.5 text-muted" />
              <p className="text-lg font-bold">{current}<span className="text-xs text-muted font-normal">/{target}</span></p>
              <p className="text-[9px] text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════ EDIT MODAL ═══════════════ */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg border border-stroke rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stroke sticky top-0 bg-bg z-10">
              <h3 className="text-sm font-semibold">Edit Post #{editForm.postId}</h3>
              <button onClick={() => setEditForm(null)} className="p-1 hover:bg-white/5 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status */}
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as CommunityPostStatus })}
                  className="rounded-lg border border-stroke bg-surface px-3 py-2 text-xs text-white w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                  <option value="published">Published</option>
                </select>
              </div>
              {/* Hebrew */}
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Hebrew Copy</label>
                <textarea
                  dir="rtl"
                  value={editForm.hebrewCopy}
                  onChange={(e) => setEditForm({ ...editForm, hebrewCopy: e.target.value })}
                  rows={12}
                  className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-xs text-text-primary resize-y focus:border-violet-500/50 focus:outline-none"
                />
              </div>
              {/* English */}
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">English Copy</label>
                <textarea
                  value={editForm.englishCopy}
                  onChange={(e) => setEditForm({ ...editForm, englishCopy: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-xs text-text-primary resize-y focus:border-violet-500/50 focus:outline-none"
                />
              </div>
              {/* Notes */}
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-xs text-text-primary resize-y focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-stroke sticky bottom-0 bg-bg">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 rounded-lg text-xs text-muted hover:text-white">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-[#4E85BF] text-xs font-semibold text-white hover:opacity-90">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ PUBLISH MODAL ═══════════════ */}
      {publishState.post && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg border border-stroke rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-stroke">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Send size={14} className="text-emerald-400" />
                Post #{publishState.post.id} - Publish to Group
              </h3>
              <button onClick={() => setPublishState({ post: null, channels: { group: true, page: false }, publishing: false, results: null })} className="p-1 hover:bg-white/5 rounded-lg"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Post preview */}
              <div className="flex items-start gap-3 rounded-lg border border-stroke p-3">
                <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden">
                  <img src={publishState.post.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-medium" dir="rtl">{publishState.post.title}</p>
                  <p className="text-[10px] text-muted mt-0.5">{publishState.post.titleEn}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <p className="text-xs font-semibold text-emerald-400">3 steps - takes 15 seconds:</p>
                <div className="space-y-2 text-xs text-text-primary">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Click green button - text copied, image + group open in new tabs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>In the image tab: right-click &gt; Save Image. Then in the group tab: paste text + upload the saved image</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Come back here and click &quot;Mark Published&quot;</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-5 border-t border-stroke">
              <button
                onClick={() => setPublishState({ post: null, channels: { group: true, page: false }, publishing: false, results: null })}
                className="px-4 py-2 rounded-lg text-xs text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (publishState.post) markAsPublished(publishState.post.id); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10"
                >
                  <CheckCircle2 size={12} /> Mark Published
                </button>
                <button
                  onClick={() => { if (publishState.post) copyAndOpenGroup(publishState.post); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-xs font-semibold text-white hover:opacity-90"
                >
                  <Copy size={12} /> Copy & Open Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
