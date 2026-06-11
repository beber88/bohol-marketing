export type Market = "IL" | "PH" | "KR" | "CN" | "SG" | "HK" | "US" | "EU" | "UAE" | "AU" | "INTL" | "BOTH";
export type Phase = "awareness" | "consideration" | "conversion";
export type PostStatus = "draft" | "ready" | "published" | "paused";
export type CampaignStatus = "planned" | "active" | "paused" | "completed" | "not_setup" | "phase2";
export type LeadStatus = "new" | "contacted" | "qualified" | "site_visit" | "negotiation" | "reserved" | "contract" | "lost";
export type LeadSource = "website" | "meta_ad_il" | "meta_ad_ph" | "fb_group" | "google_ad" | "whatsapp" | "referral" | "organic";
export type PlatformStatus = "active" | "partial" | "not_setup" | "installed";

export interface Campaign {
  id: string;
  name: string;
  market: Market;
  channel: string;
  status: CampaignStatus;
  objective: string;
  specialCategory?: string;
  dailyBudgetUsd: number;
  totalBudgetUsd: number;
  targeting: string;
  placements: string;
  schedule: string;
  impressions: number;
  clicks: number;
  leads: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpl: number;
  notes: string;
}

export interface Post {
  id: string;
  market: Market;
  phase: Phase;
  platform: string;
  placement: string;
  language: string;
  image: string;
  video?: string;
  driveVideoId?: string;
  mediaType?: "image" | "video" | "reel";
  primaryText: string;
  headlines?: string[];
  cta?: string;
  targeting?: string;
  budget?: string;
  status: PostStatus;
  scheduledDay?: number;
  scheduledTime?: string;
  notes?: string;
  imagePrompt?: string;
  generatedImageUrl?: string;
  distribution?: Distribution[];
  calendarDate?: string;
}

export interface Distribution {
  platform: string;
  target: string;
  url?: string;
  type: "paid" | "free" | "organic";
  budget?: string;
  country?: string;
  status?: "scheduled" | "published" | "pending_join" | "draft";
}

export interface Lead {
  id: string;
  date: string;
  fullName: string;
  phone: string;
  email: string;
  country: string;
  source: LeadSource;
  campaign: string;
  villa: string;
  budgetConfirmed: boolean;
  status: LeadStatus;
  assignedTo: string;
  followUpDate: string;
  lastContact: string;
  notes: string;
}

export interface FunnelStage {
  label: string;
  il: number;
  ph: number;
  total: number;
}

export interface DailySpend {
  day: number;
  date: string;
  metaIl: number;
  metaPh: number;
  google: number;
  other: number;
  total: number;
  cumulative: number;
}

export interface PlatformInfo {
  name: string;
  id: string;
  status: PlatformStatus;
  url: string;
  actionNeeded?: string;
}

export interface DriveAsset {
  name: string;
  type: string;
  size?: string;
  url: string;
}

export interface ActionItem {
  title: string;
  titleHe?: string;
  description: string;
  descriptionHe?: string;
  type: "blocker" | "completed";
}

export interface KpiTarget {
  label: string;
  target: number;
  actual: number;
  unit: string;
  prefix?: string;
}

export interface CalendarPost {
  post: number;
  day: string;
  time: string;
  platform: string;
  market: Market;
  content: string;
  media: string;
}

export interface DashboardState {
  posts: Post[];
  leads: Lead[];
}
