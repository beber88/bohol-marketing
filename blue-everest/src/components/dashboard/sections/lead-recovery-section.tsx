"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, Users, Heart, Bookmark, MessageSquare,
  MousePointer, ExternalLink, RefreshCw, Loader2, Target,
} from "lucide-react";

interface AdEngagement {
  ad_id: string;
  ad_name: string;
  market: "IL" | "PH";
  link_clicks: number;
  post_reactions: number;
  post_saves: number;
  comments: number;
  page_engagement: number;
  spend: string;
  ad_library_url: string;
  ad_post_url: string;
}

interface RecoverySummary {
  total_link_clicks: number;
  total_reactions: number;
  total_saves: number;
  total_comments: number;
  lost_period: string;
  reason: string;
  recovery_method: string;
}

const MARKET_BADGE: Record<string, string> = {
  IL: "bg-blue-500/20 text-blue-400",
  PH: "bg-green-500/20 text-green-400",
};

export function LeadRecoverySection() {
  const [engagements, setEngagements] = useState<AdEngagement[]>([]);
  const [summary, setSummary] = useState<RecoverySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [adsManagerUrl, setAdsManagerUrl] = useState("");
  const [fbPageUrl, setFbPageUrl] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/marketing/leads/recover")
      .then((r) => r.json())
      .then((d) => {
        setEngagements(d.engagements || []);
        setSummary(d.recovery_summary || null);
        setAdsManagerUrl(d.ads_manager_url || "");
        setFbPageUrl(d.facebook_page_url || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  if (!summary) return null;

  const totalEngaged = summary.total_reactions + summary.total_saves + summary.total_comments;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          Lost Leads Recovery
        </h2>
        <button onClick={fetchData} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Warning banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-sm text-amber-300 font-semibold mb-1">
          {summary.total_link_clicks.toLocaleString()} visitors lost due to broken form ({summary.lost_period})
        </p>
        <p className="text-xs text-amber-200/60">
          {summary.reason}
        </p>
        <p className="text-xs text-amber-200/60 mt-1">
          Recovery: {summary.recovery_method}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<MousePointer size={14} />} label="Lost Visitors" value={summary.total_link_clicks.toLocaleString()} color="text-red-400" />
        <StatCard icon={<Heart size={14} />} label="Reactions" value={summary.total_reactions.toLocaleString()} color="text-pink-400" />
        <StatCard icon={<Bookmark size={14} />} label="Saved Ad" value={summary.total_saves.toLocaleString()} color="text-purple-400" />
        <StatCard icon={<MessageSquare size={14} />} label="Comments" value={summary.total_comments.toLocaleString()} color="text-blue-400" />
      </div>

      {/* Per-ad engagement breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target size={14} className="text-muted" /> Engagement by Ad
        </h3>
        {engagements.map((e) => (
          <div key={e.ad_id} className="bg-surface rounded-xl border border-stroke p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{e.ad_name}</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${MARKET_BADGE[e.market]}`}>
                  {e.market}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {e.ad_library_url && (
                  <a
                    href={e.ad_library_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Ad Library <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
              <MiniStat label="Clicks" value={e.link_clicks.toLocaleString()} />
              <MiniStat label="Reactions" value={e.post_reactions.toLocaleString()} />
              <MiniStat label="Saves" value={e.post_saves.toLocaleString()} highlight={e.post_saves > 0} />
              <MiniStat label="Comments" value={e.comments.toLocaleString()} highlight={e.comments > 0} />
              <MiniStat label="Spend" value={`₱${parseFloat(e.spend || "0").toFixed(0)}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Action links */}
      <div className="bg-surface rounded-xl border border-stroke p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users size={14} className="text-[#89AACC]" /> Recovery Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href={adsManagerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-stroke hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors no-underline"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Target size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white m-0">Create Retarget Audience</p>
              <p className="text-[10px] text-muted m-0">Ads Manager → Audiences → Website Visitors 30d</p>
            </div>
            <ExternalLink size={12} className="text-muted ml-auto" />
          </a>

          <a
            href={fbPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-stroke hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors no-underline"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <MessageSquare size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white m-0">Check Page Messages</p>
              <p className="text-[10px] text-muted m-0">Reply to anyone who messaged the page</p>
            </div>
            <ExternalLink size={12} className="text-muted ml-auto" />
          </a>

          <a
            href="https://www.facebook.com/ads/library/?active_status=active&ad_type=housing&q=blue%20everest&country=ALL"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-stroke hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors no-underline"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Heart size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white m-0">View Active Ads</p>
              <p className="text-[10px] text-muted m-0">Ad Library — check comments and reactions</p>
            </div>
            <ExternalLink size={12} className="text-muted ml-auto" />
          </a>

          <a
            href="https://wa.me/639542555553"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-stroke hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-colors no-underline"
          >
            <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
              <Users size={16} className="text-[#25D366]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white m-0">Check WhatsApp Messages</p>
              <p className="text-[10px] text-muted m-0">Anyone who clicked WhatsApp from ads</p>
            </div>
            <ExternalLink size={12} className="text-muted ml-auto" />
          </a>
        </div>

        <p className="text-[10px] text-muted mt-2">
          {totalEngaged > 0
            ? `${totalEngaged} people engaged with your ads (reactions + saves + comments). Check the ad posts directly to find and reply to them.`
            : "Engagement data loading..."}
        </p>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-stroke p-3 text-center">
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>{icon}<span className="text-[10px]">{label}</span></div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg py-1 ${highlight ? "bg-amber-500/10" : "bg-white/3"}`}>
      <p className="text-[10px] text-muted">{label}</p>
      <p className={`text-xs font-semibold ${highlight ? "text-amber-400" : ""}`}>{value}</p>
    </div>
  );
}
