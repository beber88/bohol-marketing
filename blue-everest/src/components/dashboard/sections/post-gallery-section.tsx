"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Edit3, ChevronDown, ChevronUp, X, Film, Check, Sparkles, MessageSquare, Loader2, StickyNote } from "lucide-react";
import { POSTS as INITIAL_POSTS } from "@/lib/data/posts-data";
import { useTranslation } from "@/lib/i18n";
import { StatusBadge } from "@/components/dashboard/cards/status-badge";
import type { Post, Market, Phase, PostStatus } from "@/lib/data/dashboard-types";

/* -- Filter option types -------------------------------------------- */

type MarketFilter = "ALL" | Market | "VIDEO";
type PhaseFilter = "ALL" | Phase;
type StatusFilter = "ALL" | PostStatus;

interface FilterOption<T> {
  value: T;
  label: string;
}

/* -- Available images for the editor ------------------------------- */

const AVAILABLE_IMAGES: Record<string, { label: string; images: string[] }> = {
  exterior: {
    label: "Exterior",
    images: [
      "/images/exterior/hero-aerial.webp",
      "/images/exterior/panglao-rear.webp",
      "/images/exterior/panglao-hero.webp",
      "/images/exterior/front-1.webp",
      "/images/exterior/front-2.webp",
      "/images/exterior/front-3.webp",
      "/images/exterior/front-4.webp",
      "/images/exterior/rear-1.webp",
      "/images/exterior/rear-2.webp",
      "/images/exterior/rear-3.webp",
      "/images/exterior/aerial-1.webp",
      "/images/exterior/aerial-2.webp",
      "/images/exterior/aerial-3.webp",
      "/images/exterior/pd1.webp",
      "/images/exterior/pd2.webp",
      "/images/exterior/pd3.webp",
      "/images/exterior/rd1.webp",
      "/images/exterior/rd2.webp",
      "/images/exterior/rd3.webp",
      "/images/exterior/m1.webp",
      "/images/exterior/m2.webp",
    ],
  },
  interior: {
    label: "Interior",
    images: [
      "/images/interior/gf-kitchen-1.webp",
      "/images/interior/gf-dining-1.webp",
      "/images/interior/gf-dining-1-night.webp",
      "/images/interior/gf-dining-2.webp",
      "/images/interior/gf-foyer-1.webp",
      "/images/interior/2f-guest-1.webp",
      "/images/interior/2f-guest-2-night.webp",
      "/images/interior/3f-master-s-1.webp",
      "/images/interior/3f-master-s-1-night.webp",
      "/images/interior/3f-ensuite-1a.webp",
    ],
  },
  aiGenerated: {
    label: "AI Generated",
    images: [
      "/images/ai-generated/aerial-complex-1.webp",
      "/images/ai-generated/aerial-complex-2.webp",
      "/images/ai-generated/pool-night.webp",
      "/images/ai-generated/rooftop-sunset-1.webp",
      "/images/ai-generated/rooftop-sunset-2.webp",
      "/images/ai-generated/interior-living-1.webp",
      "/images/ai-generated/interior-living-2.webp",
      "/images/ai-generated/underwater-diving.webp",
      "/images/ai-generated/comparison-telaviv-1.webp",
      "/images/ai-generated/comparison-telaviv-2.webp",
    ],
  },
};

/* -- Edit form state ----------------------------------------------- */

interface EditForm {
  postId: string;
  image: string;
  primaryText: string;
  headlines: string[];
  status: PostStatus;
  notes: string;
  imagePrompt: string;
}

/* -- AI Image Generation state ----------------------------------- */

interface GenerationState {
  loading: boolean;
  prompt: string;
  resultUrl: string | null;
  error: string | null;
}

/* -- Component ------------------------------------------------------ */

export function PostGallerySection() {
  const { t } = useTranslation();

  const [posts, setPosts] = useState<Post[]>([...INITIAL_POSTS]);
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("ALL");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [imageCategory, setImageCategory] = useState("exterior");

  /* -- Filter options (translated) ------------------------------- */

  const marketOptions: FilterOption<MarketFilter>[] = [
    { value: "ALL", label: t.dashboard.posts.allMarkets },
    { value: "IL", label: "Israel" },
    { value: "PH", label: "Philippines" },
    { value: "KR", label: "Korea" },
    { value: "CN", label: "China" },
    { value: "SG", label: "Singapore" },
    { value: "HK", label: "Hong Kong" },
    { value: "US", label: "USA" },
    { value: "EU", label: "Europe" },
    { value: "UAE", label: "UAE/Gulf" },
    { value: "AU", label: "Australia" },
    { value: "INTL", label: "International" },
    { value: "VIDEO", label: "Videos/Reels" },
  ];

  const phaseOptions: FilterOption<PhaseFilter>[] = [
    { value: "ALL", label: t.dashboard.posts.allPhases },
    { value: "awareness", label: t.dashboard.common.awareness },
    { value: "consideration", label: t.dashboard.common.consideration },
    { value: "conversion", label: t.dashboard.common.conversion },
  ];

  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: "ALL", label: t.dashboard.posts.allStatuses },
    { value: "draft", label: t.dashboard.posts.draft },
    { value: "ready", label: t.dashboard.posts.ready },
    { value: "published", label: t.dashboard.posts.published },
    { value: "paused", label: t.dashboard.posts.paused },
  ];

  /* -- Filtering logic ------------------------------------------- */

  const filtered = posts.filter((p) => {
    if (marketFilter === "VIDEO") {
      if (p.mediaType !== "video" && p.mediaType !== "reel") return false;
    } else if (marketFilter !== "ALL" && p.market !== marketFilter) {
      return false;
    }
    if (phaseFilter !== "ALL" && p.phase !== phaseFilter) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  /* -- Expand / collapse toggle ---------------------------------- */

  function toggleExpand(id: string) {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* -- Edit handlers -------------------------------------------- */

  const [saving, setSaving] = useState(false);
  const [genState, setGenState] = useState<GenerationState>({
    loading: false, prompt: "", resultUrl: null, error: null,
  });
  const [regenPostId, setRegenPostId] = useState<string | null>(null);
  const [regenPrompt, setRegenPrompt] = useState("");

  const openEdit = useCallback((post: Post) => {
    setEditForm({
      postId: post.id,
      image: post.image,
      primaryText: post.primaryText,
      headlines: [...(post.headlines || [])],
      status: post.status,
      notes: post.notes || "",
      imagePrompt: post.imagePrompt || "",
    });
    setImageCategory("exterior");
    setGenState({ loading: false, prompt: "", resultUrl: null, error: null });
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editForm) return;
    setSaving(true);

    // 1. Update local state immediately
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editForm.postId
          ? {
              ...p,
              image: editForm.image,
              primaryText: editForm.primaryText,
              headlines: editForm.headlines,
              status: editForm.status,
              notes: editForm.notes || undefined,
              imagePrompt: editForm.imagePrompt || undefined,
            }
          : p
      )
    );

    // 2. Persist to API
    try {
      await fetch(`/api/marketing/posts/${editForm.postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: editForm.image,
          primaryText: editForm.primaryText,
          headlines: editForm.headlines,
          status: editForm.status,
          notes: editForm.notes,
          imagePrompt: editForm.imagePrompt,
        }),
      });
    } catch (err) {
      console.error("Failed to persist post edit:", err);
    }

    setSaving(false);
    setEditForm(null);
  }, [editForm]);

  const generateImage = useCallback(async () => {
    if (!genState.prompt.trim()) return;
    setGenState((s) => ({ ...s, loading: true, error: null, resultUrl: null }));

    try {
      const res = await fetch("/api/marketing/posts/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: genState.prompt, aspectRatio: "1:1" }),
      });
      const data = await res.json();
      if (data.success) {
        setGenState((s) => ({ ...s, loading: false, resultUrl: data.resultUrl || null }));
        if (editForm) {
          setEditForm({ ...editForm, imagePrompt: genState.prompt });
        }
      } else {
        setGenState((s) => ({ ...s, loading: false, error: data.error || "Generation failed" }));
      }
    } catch {
      setGenState((s) => ({ ...s, loading: false, error: "Network error" }));
    }
  }, [genState.prompt, editForm]);

  const cancelEdit = useCallback(() => setEditForm(null), []);

  /* -- Market badge color ---------------------------------------- */

  function marketBadgeClass(market: Market): string {
    const colors: Record<string, string> = {
      IL: "bg-blue-500/80 text-white",
      PH: "bg-emerald-500/80 text-white",
      KR: "bg-pink-500/80 text-white",
      CN: "bg-red-600/80 text-white",
      SG: "bg-red-500/80 text-white",
      HK: "bg-rose-500/80 text-white",
      US: "bg-indigo-500/80 text-white",
      EU: "bg-sky-500/80 text-white",
      UAE: "bg-teal-500/80 text-white",
      AU: "bg-yellow-500/80 text-white",
      INTL: "bg-purple-500/80 text-white",
      BOTH: "bg-amber-500/80 text-white",
    };
    return colors[market] || "bg-white/20 text-white";
  }

  function marketLabel(market: Market): string {
    const labels: Record<string, string> = {
      IL: "Israel", PH: "Philippines", KR: "Korea", CN: "China",
      SG: "Singapore", HK: "Hong Kong", US: "USA", EU: "Europe",
      UAE: "UAE", AU: "Australia", INTL: "International", BOTH: "Global",
    };
    return labels[market] || market;
  }

  function phaseLabel(phase: Phase): string {
    switch (phase) {
      case "awareness":
        return t.dashboard.common.awareness;
      case "consideration":
        return t.dashboard.common.consideration;
      case "conversion":
        return t.dashboard.common.conversion;
    }
  }

  /* -- Render ---------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* -- Filter Bar ------------------------------------------- */}
      <div className="space-y-3">
        <FilterRow
          options={marketOptions}
          active={marketFilter}
          onChange={setMarketFilter}
        />
        <FilterRow
          options={phaseOptions}
          active={phaseFilter}
          onChange={setPhaseFilter}
        />
        <FilterRow
          options={statusOptions}
          active={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* -- Post count ------------------------------------------- */}
      <p className="text-sm text-muted">
        Showing {filtered.length} of {posts.length} posts
      </p>

      {/* -- Post Grid -------------------------------------------- */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((post) => {
          const isExpanded = expandedPosts.has(post.id);
          const needsTruncation = post.primaryText.length > 120;
          const displayText =
            needsTruncation && !isExpanded
              ? post.primaryText.slice(0, 120) + "..."
              : post.primaryText;
          const isVideo = post.mediaType === "video" || post.mediaType === "reel";
          const hasDriveVideo = !!post.driveVideoId;

          return (
            <div
              key={post.id}
              className="group overflow-hidden rounded-xl border border-stroke transition-all duration-300 hover:border-[#4E85BF]/40"
            >
              {/* -- Media area ------------------------------- */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-black">
                {isVideo && hasDriveVideo ? (
                  <iframe
                    src={`https://drive.google.com/file/d/${post.driveVideoId}/preview`}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : isVideo && post.video ? (
                  <video
                    poster={post.image}
                    controls
                    preload="none"
                    className="h-full w-full object-cover"
                  >
                    <source src={post.video} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={post.image}
                    alt={post.id}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                )}

                {/* Dark gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Overlay badges (top-left) */}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${marketBadgeClass(post.market)}`}
                  >
                    {marketLabel(post.market)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {phaseLabel(post.phase)}
                  </span>
                </div>

                {/* Video/Reel badge (top-right) */}
                {isVideo && (
                  <div className="absolute right-3 top-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm ${
                      post.mediaType === "reel" ? "bg-pink-600/80" : "bg-purple-600/80"
                    }`}>
                      <Film size={10} />
                      {post.mediaType === "reel" ? "Reel" : "Video"}
                    </span>
                  </div>
                )}
              </div>

              {/* -- Card body --------------------------------- */}
              <div className="space-y-3 border border-t-0 border-stroke bg-surface p-4 rounded-b-xl">
                {/* Platform + language */}
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{post.platform}</span>
                  <span className="text-stroke">|</span>
                  <span className="uppercase">{post.language}</span>
                </div>

                {/* Primary text */}
                <div>
                  <div
                    className="text-sm leading-relaxed text-text-primary"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {displayText}
                  </div>
                  {needsTruncation && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#89AACC] transition-colors hover:text-[#4E85BF]"
                    >
                      {isExpanded ? (
                        <>
                          {t.dashboard.posts.showLess}
                          <ChevronUp size={12} />
                        </>
                      ) : (
                        <>
                          {t.dashboard.posts.showMore}
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Headlines */}
                {post.headlines && post.headlines.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.headlines.map((headline, i) => (
                      <span
                        key={i}
                        className="inline-block rounded-md border border-stroke bg-bg px-2 py-0.5 text-[11px] text-muted"
                      >
                        {headline}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes indicator */}
                {post.notes && (
                  <div className="flex items-start gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5">
                    <StickyNote size={12} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-300 line-clamp-2">{post.notes}</p>
                  </div>
                )}

                {/* Bottom row: status badge + action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <StatusBadge status={post.status} type="post" />
                  <div className="flex items-center gap-1.5">
                    {/* Regenerate image button */}
                    <button
                      onClick={() => { setRegenPostId(post.id); setRegenPrompt(""); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke bg-bg text-muted transition-all hover:border-purple-500/40 hover:text-purple-400"
                      title="Regenerate image with AI"
                    >
                      <Sparkles size={14} />
                    </button>
                    {/* Edit button */}
                    <button
                      onClick={() => openEdit(post)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke bg-bg text-muted transition-all hover:border-[#4E85BF]/40 hover:text-[#89AACC]"
                      title={t.dashboard.posts.editPost}
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -- Quick Regenerate Dialog ------------------------------ */}
      {regenPostId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setRegenPostId(null); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-stroke bg-surface shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <h3 className="text-lg font-semibold text-text-primary">Regenerate Image</h3>
            </div>
            <p className="text-xs text-muted">Describe the image you want for this post. The request will be sent to Higgsfield AI.</p>
            <textarea
              value={regenPrompt}
              onChange={(e) => setRegenPrompt(e.target.value)}
              placeholder="e.g. 'Luxury villa exterior at golden hour, pool in foreground, Panglao beach visible, drone perspective, 4K quality'"
              rows={4}
              className="w-full rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRegenPostId(null)}
                className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!regenPrompt.trim()) return;
                  // Save the prompt as a note + imagePrompt on the post
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === regenPostId
                        ? { ...p, imagePrompt: regenPrompt, notes: `[Image regeneration requested] ${regenPrompt}` }
                        : p
                    )
                  );
                  try {
                    await fetch(`/api/marketing/posts/${regenPostId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ imagePrompt: regenPrompt, notes: `[Image regeneration requested] ${regenPrompt}` }),
                    });
                    await fetch("/api/marketing/posts/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt: regenPrompt, postId: regenPostId }),
                    });
                  } catch (err) {
                    console.error("Regenerate request failed:", err);
                  }
                  setRegenPostId(null);
                }}
                disabled={!regenPrompt.trim()}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
              >
                <Sparkles size={14} /> Request Generation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -- Edit Modal ------------------------------------------- */}
      {editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stroke bg-surface shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Edit Post</h3>
                <p className="text-xs text-muted">{editForm.postId}</p>
              </div>
              <button
                onClick={cancelEdit}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke text-muted transition-colors hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Current image preview */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">Current Image</label>
                <div className="relative h-40 w-full overflow-hidden rounded-lg border border-stroke">
                  <Image
                    src={editForm.image}
                    alt="Current"
                    fill
                    className="object-cover"
                    sizes="600px"
                  />
                </div>
              </div>

              {/* Image selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">Select Image</label>
                {/* Category tabs */}
                <div className="mb-3 flex gap-2">
                  {Object.entries(AVAILABLE_IMAGES).map(([key, group]) => (
                    <button
                      key={key}
                      onClick={() => setImageCategory(key)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        imageCategory === key
                          ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white"
                          : "border border-stroke text-muted hover:text-text-primary"
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
                {/* Image grid */}
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {AVAILABLE_IMAGES[imageCategory]?.images.map((img) => {
                    const isSelected = editForm.image === img;
                    return (
                      <button
                        key={img}
                        onClick={() => setEditForm({ ...editForm, image: img })}
                        className={`group/img relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-[#4E85BF] ring-2 ring-[#4E85BF]/30"
                            : "border-stroke hover:border-[#89AACC]/50"
                        }`}
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#4E85BF]/30">
                            <Check size={20} className="text-white drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary text */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">Post Copy</label>
                <textarea
                  value={editForm.primaryText}
                  onChange={(e) => setEditForm({ ...editForm, primaryText: e.target.value })}
                  rows={8}
                  className="w-full rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-[#4E85BF] focus:outline-none focus:ring-1 focus:ring-[#4E85BF]/30"
                  dir="auto"
                />
              </div>

              {/* Headlines */}
              {editForm.headlines.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">Headlines</label>
                  <div className="space-y-2">
                    {editForm.headlines.map((hl, i) => (
                      <input
                        key={i}
                        value={hl}
                        onChange={(e) => {
                          const next = [...editForm.headlines];
                          next[i] = e.target.value;
                          setEditForm({ ...editForm, headlines: next });
                        }}
                        className="w-full rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary focus:border-[#4E85BF] focus:outline-none focus:ring-1 focus:ring-[#4E85BF]/30"
                        dir="auto"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as PostStatus })}
                  className="w-full rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary focus:border-[#4E85BF] focus:outline-none focus:ring-1 focus:ring-[#4E85BF]/30"
                >
                  <option value="draft">{t.dashboard.posts.draft}</option>
                  <option value="ready">{t.dashboard.posts.ready}</option>
                  <option value="published">{t.dashboard.posts.published}</option>
                  <option value="paused">{t.dashboard.posts.paused}</option>
                </select>
              </div>

              {/* AI Image Generation */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  <label className="text-sm font-medium text-text-primary">Generate New Image (AI)</label>
                </div>
                <textarea
                  value={genState.prompt}
                  onChange={(e) => setGenState((s) => ({ ...s, prompt: e.target.value }))}
                  placeholder="Describe the image you want... e.g. 'Aerial view of luxury villa at sunset with infinity pool, Panglao beach in background, cinematic lighting'"
                  rows={3}
                  className="w-full rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={generateImage}
                    disabled={genState.loading || !genState.prompt.trim()}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                  >
                    {genState.loading ? (
                      <><Loader2 size={14} className="animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles size={14} /> Generate</>
                    )}
                  </button>
                  {genState.resultUrl && (
                    <button
                      onClick={() => setEditForm({ ...editForm, image: genState.resultUrl! })}
                      className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400 transition-all hover:bg-green-500/20"
                    >
                      <Check size={14} /> Use Generated Image
                    </button>
                  )}
                </div>
                {genState.error && (
                  <p className="text-xs text-red-400">{genState.error}</p>
                )}
                {genState.loading && (
                  <p className="text-xs text-muted">Generating with Higgsfield AI... this may take 10-20 seconds.</p>
                )}
              </div>

              {/* Notes / Feedback */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-amber-400" />
                  <label className="text-sm font-medium text-text-primary">Notes / Feedback</label>
                </div>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Leave notes about this post... e.g. 'Image too dark, need a brighter version' or 'Copy approved by Bar'"
                  rows={3}
                  className="w-full rounded-lg border border-stroke bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-muted/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  dir="auto"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-stroke px-6 py-4">
              <button
                onClick={cancelEdit}
                className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#4E85BF]/20 transition-all hover:shadow-lg hover:shadow-[#4E85BF]/30 disabled:opacity-50"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Filter Row (reusable pill buttons) ----------------------------- */

function FilterRow<T extends string>({
  options,
  active,
  onChange,
}: {
  options: FilterOption<T>[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white shadow-md shadow-[#4E85BF]/20"
                : "border border-stroke bg-surface text-muted hover:border-[#4E85BF]/30 hover:text-text-primary"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}