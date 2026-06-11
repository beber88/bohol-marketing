"use client";

import { useState, useMemo } from "react";
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Globe, ExternalLink,
  CheckCircle2, Circle, AlertCircle, Film, DollarSign, Users, Play,
} from "lucide-react";
import { POSTS } from "@/lib/data/posts-data";
import type { Post, Market, Distribution } from "@/lib/data/dashboard-types";

/* ── Constants ─────────────────────────────────────────────── */

const MARKET_LABELS: Record<string, string> = {
  IL: "Israel", PH: "Philippines", KR: "Korea", CN: "China",
  SG: "Singapore", HK: "Hong Kong", US: "USA", EU: "Europe",
  UAE: "UAE", AU: "Australia", INTL: "International", BOTH: "Global",
};

const MARKET_DOT: Record<string, string> = {
  IL: "bg-blue-500", PH: "bg-emerald-500", KR: "bg-pink-500",
  CN: "bg-red-600", SG: "bg-red-500", HK: "bg-rose-500",
  US: "bg-indigo-500", EU: "bg-sky-500", UAE: "bg-teal-500",
  AU: "bg-yellow-500", INTL: "bg-purple-500", BOTH: "bg-amber-500",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type ViewMode = "day" | "week" | "month" | "year";

/* ── Helpers ───────────────────────────────────────────────── */

function getPostDate(post: Post): Date {
  if (post.calendarDate) return new Date(post.calendarDate + "T12:00:00");
  if (post.scheduledDay) {
    const d = new Date(2026, 5, post.scheduledDay); // June 2026
    return d;
  }
  return new Date(2026, 5, 15);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function sameWeek(date: Date, weekStart: Date): boolean {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return date >= weekStart && date < end;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/* ── Component ─────────────────────────────────────────────── */

export function PublishingCalendarSection() {
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const postsWithDates = useMemo(() =>
    POSTS.map((p) => ({ ...p, _date: getPostDate(p) })),
    []
  );

  // Stats
  const totalPosts = POSTS.length;
  const published = POSTS.filter((p) => p.status === "published").length;
  const ready = POSTS.filter((p) => p.status === "ready").length;
  const videos = POSTS.filter((p) => p.mediaType === "video" || p.mediaType === "reel").length;
  const paidDist = POSTS.reduce((n, p) => n + (p.distribution?.filter((d) => d.type === "paid").length || 0), 0);
  const freeDist = POSTS.reduce((n, p) => n + (p.distribution?.filter((d) => d.type !== "paid").length || 0), 0);

  /* ── Navigation ────────────────────────────────────────── */
  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setFullYear(d.getFullYear() + dir);
    setCurrentDate(d);
  };

  const headerLabel = () => {
    if (view === "day") return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (view === "week") {
      const ws = getWeekStart(currentDate);
      const we = new Date(ws); we.setDate(we.getDate() + 6);
      return `${ws.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${we.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (view === "month") return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    return `${currentDate.getFullYear()}`;
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Calendar size={18} className="text-[#89AACC]" /> Publishing Calendar
        </h2>
        <div className="flex gap-1">
          {(["day", "week", "month", "year"] as ViewMode[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all capitalize ${
                view === v ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white" : "border border-stroke text-muted hover:text-white"
              }`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <Stat label="Total Posts" value={totalPosts} />
        <Stat label="Published" value={published} color="text-green-400" />
        <Stat label="Ready" value={ready} color="text-amber-400" />
        <Stat label="Videos" value={videos} color="text-purple-400" />
        <Stat label="Paid Placements" value={paidDist} color="text-red-400" />
        <Stat label="Free Placements" value={freeDist} color="text-emerald-400" />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-surface rounded-xl border border-stroke px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white"><ChevronLeft size={18} /></button>
        <span className="font-display text-sm font-semibold">{headerLabel()}</span>
        <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white"><ChevronRight size={18} /></button>
      </div>

      {/* Calendar Views */}
      {view === "month" && <MonthView currentDate={currentDate} posts={postsWithDates} onSelectPost={setSelectedPost} onSelectDay={(d) => { setCurrentDate(d); setView("day"); }} />}
      {view === "week" && <WeekView currentDate={currentDate} posts={postsWithDates} onSelectPost={setSelectedPost} />}
      {view === "day" && <DayView currentDate={currentDate} posts={postsWithDates} onSelectPost={setSelectedPost} />}
      {view === "year" && <YearView currentDate={currentDate} posts={postsWithDates} onSelectMonth={(m) => { setCurrentDate(new Date(currentDate.getFullYear(), m, 1)); setView("month"); }} />}

      {/* Post Detail Modal */}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </section>
  );
}

/* ── Stat Card ─────────────────────────────────────────────── */
function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
      <p className={`font-display text-xl font-bold ${color || ""}`}>{value}</p>
      <p className="text-[9px] text-muted">{label}</p>
    </div>
  );
}

/* ── Month View ────────────────────────────────────────────── */
function MonthView({ currentDate, posts, onSelectPost, onSelectDay }: {
  currentDate: Date; posts: (Post & { _date: Date })[]; onSelectPost: (p: Post) => void; onSelectDay: (d: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-surface rounded-xl border border-stroke overflow-hidden">
      <div className="grid grid-cols-7 border-b border-stroke">
        {DAYS.map((d) => <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold text-muted">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-stroke/30 bg-white/[0.01]" />;
          const date = new Date(year, month, day);
          const dayPosts = posts.filter((p) => sameDay(p._date, date));
          const isToday = sameDay(date, new Date());
          return (
            <div key={day}
              onClick={() => onSelectDay(date)}
              className={`min-h-[80px] border-b border-r border-stroke/30 p-1.5 cursor-pointer hover:bg-white/[0.03] transition-colors ${isToday ? "bg-[#4E85BF]/10" : ""}`}
            >
              <span className={`text-xs font-semibold ${isToday ? "text-[#89AACC]" : "text-muted"}`}>{day}</span>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {dayPosts.slice(0, 4).map((p) => (
                  <button key={p.id} onClick={(e) => { e.stopPropagation(); onSelectPost(p); }}
                    className={`h-2 w-2 rounded-full ${MARKET_DOT[p.market] || "bg-white/30"}`}
                    title={`${p.id} (${MARKET_LABELS[p.market]})`}
                  />
                ))}
                {dayPosts.length > 4 && <span className="text-[8px] text-muted">+{dayPosts.length - 4}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Week View ─────────────────────────────────────────────── */
function WeekView({ currentDate, posts, onSelectPost }: {
  currentDate: Date; posts: (Post & { _date: Date })[]; onSelectPost: (p: Post) => void;
}) {
  const weekStart = getWeekStart(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="bg-surface rounded-xl border border-stroke overflow-hidden">
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          const dayPosts = posts.filter((p) => sameDay(p._date, date));
          const isToday = sameDay(date, new Date());
          return (
            <div key={i} className={`min-h-[200px] border-r border-stroke/30 ${isToday ? "bg-[#4E85BF]/5" : ""}`}>
              <div className="px-2 py-2 border-b border-stroke/30 text-center">
                <div className="text-[10px] text-muted">{DAYS[date.getDay()]}</div>
                <div className={`text-sm font-bold ${isToday ? "text-[#89AACC]" : ""}`}>{date.getDate()}</div>
              </div>
              <div className="p-1.5 space-y-1">
                {dayPosts.map((p) => (
                  <button key={p.id} onClick={() => onSelectPost(p)}
                    className="w-full text-left rounded-lg bg-white/[0.03] border border-stroke/30 p-1.5 hover:border-[#4E85BF]/30 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${MARKET_DOT[p.market] || "bg-white/30"}`} />
                      <span className="text-[9px] font-semibold truncate">{p.id}</span>
                    </div>
                    {(p.mediaType === "video" || p.mediaType === "reel") && (
                      <Film size={8} className="text-purple-400 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Day View ──────────────────────────────────────────────── */
function DayView({ currentDate, posts, onSelectPost }: {
  currentDate: Date; posts: (Post & { _date: Date })[]; onSelectPost: (p: Post) => void;
}) {
  const dayPosts = posts.filter((p) => sameDay(p._date, currentDate));

  return (
    <div className="space-y-3">
      {dayPosts.length === 0 && (
        <div className="bg-surface rounded-xl border border-stroke p-8 text-center">
          <Calendar size={32} className="mx-auto mb-3 text-muted/30" />
          <p className="text-muted">No posts scheduled for this day</p>
        </div>
      )}
      {dayPosts.map((post) => (
        <button key={post.id} onClick={() => onSelectPost(post)}
          className="w-full text-left bg-surface rounded-xl border border-stroke p-4 hover:border-[#4E85BF]/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-3 w-3 rounded-full ${MARKET_DOT[post.market]}`} />
            <span className="text-sm font-semibold">{post.id}</span>
            <span className="text-xs text-muted">{MARKET_LABELS[post.market]}</span>
            {post.scheduledTime && <span className="flex items-center gap-1 text-xs text-muted"><Clock size={10} />{post.scheduledTime}</span>}
            {(post.mediaType === "video" || post.mediaType === "reel") && (
              <span className="flex items-center gap-1 text-[10px] text-purple-400"><Film size={10} />{post.mediaType === "reel" ? "Reel" : "Video"}</span>
            )}
          </div>
          <p className="text-xs text-muted line-clamp-2">{post.primaryText.slice(0, 150)}...</p>
          {post.distribution && post.distribution.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                {post.distribution.filter((d) => d.type !== "paid").length} free
              </span>
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400">
                {post.distribution.filter((d) => d.type === "paid").length} paid
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Year View (heatmap) ───────────────────────────────────── */
function YearView({ currentDate, posts, onSelectMonth }: {
  currentDate: Date; posts: (Post & { _date: Date })[]; onSelectMonth: (m: number) => void;
}) {
  const year = currentDate.getFullYear();
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {MONTHS.map((month, i) => {
        const monthPosts = posts.filter((p) => p._date.getFullYear() === year && p._date.getMonth() === i);
        const intensity = Math.min(monthPosts.length / 10, 1);
        return (
          <button key={i} onClick={() => onSelectMonth(i)}
            className="bg-surface rounded-xl border border-stroke p-4 text-center hover:border-[#4E85BF]/30 transition-colors"
            style={{ backgroundColor: monthPosts.length > 0 ? `rgba(78, 133, 191, ${intensity * 0.3})` : undefined }}
          >
            <p className="text-xs font-semibold">{month}</p>
            <p className="text-2xl font-bold mt-1">{monthPosts.length}</p>
            <p className="text-[9px] text-muted">posts</p>
          </button>
        );
      })}
    </div>
  );
}

/* ── Post Detail Modal ─────────────────────────────────────── */
function PostDetailModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const dist = post.distribution || [];
  const freeDist = dist.filter((d) => d.type !== "paid");
  const paidDist = dist.filter((d) => d.type === "paid");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stroke bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${MARKET_DOT[post.market]}`} />
            <div>
              <h3 className="text-sm font-semibold">{post.id}</h3>
              <p className="text-xs text-muted">{MARKET_LABELS[post.market]} - {post.phase} - {post.platform}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white text-lg">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Post content preview */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Content</label>
            <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed" dir="auto">{post.primaryText.slice(0, 300)}...</p>
          </div>

          {/* Distribution - Free */}
          {freeDist.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Users size={10} /> Free / Organic ({freeDist.length} placements)
              </label>
              <div className="mt-2 space-y-1.5">
                {freeDist.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe size={12} className="text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{d.target}</p>
                        <p className="text-[10px] text-muted">{d.platform}{d.country ? ` - ${d.country}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {d.status && <span className="text-[9px] text-muted">{d.status}</span>}
                      {d.url && (
                        <a href={d.url} target="_blank" rel="noopener noreferrer"
                          className="text-[#89AACC] hover:text-white"><ExternalLink size={12} /></a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distribution - Paid */}
          {paidDist.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign size={10} /> Paid ({paidDist.length} placements)
              </label>
              <div className="mt-2 space-y-1.5">
                {paidDist.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <DollarSign size={12} className="text-red-400" />
                      <div>
                        <p className="text-xs font-medium">{d.target}</p>
                        <p className="text-[10px] text-muted">{d.platform}</p>
                      </div>
                    </div>
                    {d.budget && <span className="text-xs font-bold text-red-400">{d.budget}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {dist.length === 0 && (
            <div className="rounded-lg bg-white/[0.02] border border-stroke p-4 text-center">
              <p className="text-xs text-muted">No distribution plan configured yet</p>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-white/[0.02] border border-stroke p-2">
              <p className="text-[10px] text-muted">Language</p>
              <p className="text-xs font-bold uppercase">{post.language}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-stroke p-2">
              <p className="text-[10px] text-muted">Status</p>
              <p className="text-xs font-bold capitalize">{post.status}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-stroke p-2">
              <p className="text-[10px] text-muted">Type</p>
              <p className="text-xs font-bold capitalize">{post.mediaType || "image"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
