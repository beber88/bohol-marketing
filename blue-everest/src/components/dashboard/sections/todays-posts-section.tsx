"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Send, Copy, Check, CheckCircle2, ExternalLink, Clock,
  ChevronDown, ChevronUp, Loader2, Globe, X, AlertCircle,
} from "lucide-react";
import { POSTS } from "@/lib/data/posts-data";
import type { Post, Distribution } from "@/lib/data/dashboard-types";

/* -- Helpers -------------------------------------------------------- */

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function marketLabel(m: string) {
  if (m === "IL") return "🇮🇱 Israel";
  if (m === "PH") return "🇵🇭 Philippines";
  return "🌍 International";
}

function platformIcon(platform: string) {
  if (platform.includes("Page")) return "📄";
  if (platform.includes("Group")) return "👥";
  if (platform.includes("Marketplace")) return "🏪";
  if (platform.includes("Ads") || platform.includes("Meta Ads")) return "📢";
  if (platform.includes("IG")) return "📸";
  if (platform.includes("LinkedIn")) return "💼";
  return "🔗";
}

/* -- Types ---------------------------------------------------------- */

interface TargetStatus {
  done: boolean;
  fb_post_id?: string;
  published_at?: string;
}

type DoneMap = Record<string, Record<string, TargetStatus>>;

/* -- Component ------------------------------------------------------ */

export function TodaysPostsSection() {
  const today = getToday();
  const todaysPosts = useMemo(() => POSTS.filter((p) => p.calendarDate === today), [today]);

  const [doneMap, setDoneMap] = useState<DoneMap>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const markDone = useCallback((postId: string, targetKey: string, extra?: Partial<TargetStatus>) => {
    setDoneMap((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [targetKey]: { done: true, published_at: new Date().toISOString(), ...extra },
      },
    }));
  }, []);

  const isDone = (postId: string, targetKey: string) => doneMap[postId]?.[targetKey]?.done ?? false;

  /* -- Copy & Open flow (same as community agent) ---------------- */
  const copyAndOpen = useCallback((post: Post, dist: Distribution) => {
    navigator.clipboard.writeText(post.primaryText);
    // Open image in new tab
    if (post.image) {
      window.open(post.image, "_blank");
    }
    // Open target URL
    setTimeout(() => {
      if (dist.url) {
        window.open(dist.url, "_blank");
      }
    }, 300);
    const key = `${post.id}__${dist.target}`;
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  }, []);

  /* -- Auto-publish to page -------------------------------------- */
  const autoPublishToPage = useCallback(async (post: Post) => {
    setPublishing(post.id);
    setPublishError(null);

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    const imageUrl = post.image?.startsWith("http") ? post.image : `${siteUrl}${post.image}`;

    try {
      const res = await fetch("/api/marketing/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          message: post.primaryText,
          imageUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        markDone(post.id, "FB Page", { fb_post_id: data.fb_post_id });
      } else {
        setPublishError(data.error || "Publish failed");
      }
    } catch {
      setPublishError("Network error");
    }
    setPublishing(null);
  }, [markDone]);

  /* -- Stats ----------------------------------------------------- */
  const totalTargets = todaysPosts.reduce((sum, p) => sum + (p.distribution?.length || 0), 0);
  const completedTargets = todaysPosts.reduce((sum, p) => {
    return sum + (p.distribution?.filter((d) => isDone(p.id, d.target)).length || 0);
  }, 0);

  if (todaysPosts.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Today&apos;s Posts</h2>
        <div className="rounded-xl border border-stroke bg-card p-8 text-center">
          <Clock size={32} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-muted">No posts scheduled for today ({today})</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Today&apos;s Posts - {today}</h2>
          <p className="text-xs text-muted">{todaysPosts.length} posts, {totalTargets} distribution targets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${totalTargets > 0 ? (completedTargets / totalTargets) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-mono text-emerald-400">{completedTargets}/{totalTargets}</span>
        </div>
      </div>

      {/* Error banner */}
      {publishError && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          <AlertCircle size={14} />
          <span>{publishError}</span>
          <button onClick={() => setPublishError(null)} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      {/* Post cards */}
      {todaysPosts.map((post) => {
        const isExpanded = expandedId === post.id;
        const distributions = post.distribution || [];
        const postDone = distributions.filter((d) => isDone(post.id, d.target)).length;
        const postTotal = distributions.length;

        return (
          <div key={post.id} className="rounded-xl border border-stroke bg-card overflow-hidden">
            {/* Post header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : post.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5"
            >
              <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden">
                <img src={post.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">{marketLabel(post.market)}</span>
                  <span className="text-[10px] text-muted">{post.scheduledTime}</span>
                  {post.budget && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">{post.budget}</span>}
                </div>
                <p className="text-xs font-medium mt-1 truncate" dir={post.language === "he" ? "rtl" : "ltr"}>
                  {post.primaryText.slice(0, 80)}...
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-emerald-400">{postDone}/{postTotal}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {/* Expanded: distribution targets */}
            {isExpanded && (
              <div className="border-t border-stroke">
                {/* Full text preview */}
                <div className="p-4 border-b border-stroke bg-white/[0.02] max-h-48 overflow-y-auto">
                  <p className="text-xs whitespace-pre-wrap leading-relaxed" dir={post.language === "he" ? "rtl" : "ltr"}>
                    {post.primaryText}
                  </p>
                </div>

                {/* Distribution targets */}
                <div className="p-4 space-y-2">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-3">Distribution targets:</p>
                  {distributions.map((dist, idx) => {
                    const targetKey = dist.target;
                    const done = isDone(post.id, targetKey);
                    const copyKey = `${post.id}__${targetKey}`;
                    const isCopied = copiedKey === copyKey;
                    const isPageTarget = dist.platform === "FB Page";
                    const isGroupTarget = dist.platform === "FB Group";
                    const isPaid = dist.type === "paid";
                    const isPendingJoin = dist.status === "pending_join";
                    const isPublishing = publishing === post.id && isPageTarget;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          done ? "border-emerald-500/30 bg-emerald-500/5" : "border-stroke"
                        }`}
                      >
                        {/* Status icon */}
                        {done ? (
                          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                        ) : isPaid ? (
                          <Globe size={16} className="shrink-0 text-amber-400" />
                        ) : (
                          <Clock size={16} className="shrink-0 text-muted" />
                        )}

                        {/* Target info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{platformIcon(dist.platform)}</span>
                            <span className="text-xs font-medium truncate">{dist.target}</span>
                          </div>
                          <p className="text-[10px] text-muted">{dist.platform} - {dist.type}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {done ? (
                            <span className="text-[10px] text-emerald-400 font-medium">Done</span>
                          ) : isPaid ? (
                            <span className="text-[10px] text-amber-400 font-medium">Running</span>
                          ) : isPageTarget ? (
                            <>
                              <button
                                onClick={() => autoPublishToPage(post)}
                                disabled={isPublishing}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-[10px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                              >
                                {isPublishing ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                {isPublishing ? "Publishing..." : "Auto-Publish"}
                              </button>
                            </>
                          ) : isGroupTarget && isPendingJoin ? (
                            <>
                              <button
                                onClick={() => dist.url && window.open(dist.url, "_blank")}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-[10px] font-medium text-amber-400 hover:bg-amber-500/10"
                              >
                                <ExternalLink size={10} /> Join
                              </button>
                              <button
                                onClick={() => copyAndOpen(post, dist)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-violet-500/30 text-[10px] font-medium text-violet-400 hover:bg-violet-500/10"
                              >
                                {isCopied ? <Check size={10} /> : <Copy size={10} />}
                                {isCopied ? "Copied!" : "Copy & Open"}
                              </button>
                            </>
                          ) : isGroupTarget ? (
                            <>
                              <button
                                onClick={() => copyAndOpen(post, dist)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 text-[10px] font-semibold text-white hover:opacity-90"
                              >
                                {isCopied ? <Check size={10} /> : <Copy size={10} />}
                                {isCopied ? "Copied!" : "Copy & Open"}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => dist.url && window.open(dist.url, "_blank")}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stroke text-[10px] font-medium text-muted hover:text-text-primary"
                            >
                              <ExternalLink size={10} /> Open
                            </button>
                          )}

                          {/* Mark done button (for non-auto, non-paid) */}
                          {!done && !isPaid && (
                            <button
                              onClick={() => markDone(post.id, targetKey)}
                              className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              title="Mark as done"
                            >
                              <CheckCircle2 size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
