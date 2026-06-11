"use client";

import type { CampaignStatus, PostStatus, PlatformStatus } from "@/lib/data/dashboard-types";

const CAMPAIGN_STYLES: Record<CampaignStatus, string> = {
  planned: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  paused: "border-red-500/30 bg-red-500/10 text-red-400",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  not_setup: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  phase2: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

const POST_STYLES: Record<PostStatus, string> = {
  draft: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  ready: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  published: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  paused: "border-red-500/30 bg-red-500/10 text-red-400",
};

const PLATFORM_STYLES: Record<PlatformStatus, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  partial: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  not_setup: "border-red-500/30 bg-red-500/10 text-red-400",
  installed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

const MARKET_STYLES = {
  IL: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  PH: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  BOTH: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

interface StatusBadgeProps {
  status: string;
  type?: "campaign" | "post" | "platform" | "market";
  label?: string;
}

export function StatusBadge({ status, type = "campaign", label }: StatusBadgeProps) {
  let style: string;
  switch (type) {
    case "post":
      style = POST_STYLES[status as PostStatus] || POST_STYLES.draft;
      break;
    case "platform":
      style = PLATFORM_STYLES[status as PlatformStatus] || PLATFORM_STYLES.not_setup;
      break;
    case "market":
      style = MARKET_STYLES[status as keyof typeof MARKET_STYLES] || MARKET_STYLES.BOTH;
      break;
    default:
      style = CAMPAIGN_STYLES[status as CampaignStatus] || CAMPAIGN_STYLES.planned;
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style}`}>
      {label || status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}
