"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  List,
  Loader2,
  Send,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";
import { StatusBadge } from "../cards/status-badge";
import { useTranslation } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/*  Bilingual labels                                                   */
/* ------------------------------------------------------------------ */

const LABELS = {
  he: {
    title: "מודעות פורטלים",
    subtitle: "ניהול מודעות נכסים בכל הפורטלים",
    distributeAll: "הפצה לכולם",
    selectProperty: "בחר נכס להפצה",
    allPortals: "כל הפורטלים",
    allProperties: "כל הנכסים",
    allStatuses: "כל הסטטוסים",
    total: 'סה"כ',
    active: "מפורסמות",
    pending: "ממתינות",
    errors: "שגיאות",
    property: "נכס",
    portal: "פורטל",
    status: "סטטוס",
    titleCol: "כותרת",
    views: "צפיות",
    inquiries: "פניות",
    leads: "לידים",
    updated: "עודכן",
    images: "תמונות הנכס",
    adaptedTitle: "כותרת מותאמת",
    adaptedDesc: "תיאור מותאם",
    notAdapted: 'טרם הותאם - לחץ "התאם" ליצירת תוכן',
    brandGuard: "שומר מותג",
    notChecked: "לא נבדק",
    passed: "עבר",
    failed: "נכשל",
    lastError: "שגיאה אחרונה",
    adapt: "התאם",
    submit: "פרסם",
    refresh: "רענן",
    viewOnPortal: "צפה בפורטל",
    copyContent: "העתק תוכן",
    copied: "הועתק!",
    openSubmitPage: "פתח דף פרסום",
    noListings: "אין מודעות שתואמות למסנן.",
    noListingsHint: "נסה לשנות את המסנן או הפץ נכס ליצירת מודעות.",
    distributing: "מפיץ...",
    distributionDone: "ההפצה הושלמה",
    cancel: "ביטול",
    close: "סגור",
    succeeded: "הצליחו",
    failedCount: "נכשלו",
    readyGroup: "מוכנות לפרסום",
    pendingGroup: "ממתינות לבדיקה",
    activeGroup: "מפורסמות",
    errorGroup: "שגיאות",
    created: "נוצר",
    submitted: "הוגש",
    published: "פורסם",
    loadError: "טעינת המודעות נכשלה",
    loadFailed: "טעינת הנתונים נכשלה",
    now: "עכשיו",
    minsAgo: (n: number) => `לפני ${n} דק'`,
    hoursAgo: (n: number) => `לפני ${n} שע'`,
    daysAgo: (n: number) => `לפני ${n} ימים`,
    tierPremium: "פרימיום",
    tierStandard: "רגיל",
    tierFree: "חינם",
    tierLevel: (n: number) => `רמה ${n}`,
    other: "אחר",
  },
  en: {
    title: "Portal Listings",
    subtitle: "Manage property listings across all portals",
    distributeAll: "Distribute All",
    selectProperty: "Select a property to distribute",
    allPortals: "All Portals",
    allProperties: "All Properties",
    allStatuses: "All Statuses",
    total: "Total",
    active: "Active",
    pending: "Pending",
    errors: "Errors",
    property: "Property",
    portal: "Portal",
    status: "Status",
    titleCol: "Title",
    views: "Views",
    inquiries: "Inquiries",
    leads: "Leads",
    updated: "Updated",
    images: "Property Images",
    adaptedTitle: "Adapted Title",
    adaptedDesc: "Adapted Description",
    notAdapted: "Not adapted yet - click Adapt to generate content",
    brandGuard: "Brand Guard",
    notChecked: "Not checked",
    passed: "Passed",
    failed: "Failed",
    lastError: "Last Error",
    adapt: "Adapt",
    submit: "Publish",
    refresh: "Refresh",
    viewOnPortal: "View on Portal",
    copyContent: "Copy Content",
    copied: "Copied!",
    openSubmitPage: "Open Submission Page",
    noListings: "No listings match the current filters.",
    noListingsHint: "Try changing the filter or distribute a property to create listings.",
    distributing: "Distributing...",
    distributionDone: "Distribution Complete",
    cancel: "Cancel",
    close: "Close",
    succeeded: "succeeded",
    failedCount: "failed",
    readyGroup: "Ready to Publish",
    pendingGroup: "Pending Review",
    activeGroup: "Published",
    errorGroup: "Errors",
    created: "Created",
    submitted: "Submitted",
    published: "Published",
    loadError: "Failed to load listings",
    loadFailed: "Failed to load data",
    now: "just now",
    minsAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
    tierPremium: "Premium",
    tierStandard: "Standard",
    tierFree: "Free",
    tierLevel: (n: number) => `Tier ${n}`,
    other: "Other",
  },
};

type Labels = typeof LABELS.en;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PortalListing {
  id: string;
  property_id: string;
  portal_id: string;
  adapted_title: string | null;
  adapted_description: string | null;
  adapted_fields: Record<string, unknown>;
  status: string;
  brand_guard_passed: boolean | null;
  brand_guard_result: Record<string, unknown> | null;
  external_listing_id: string | null;
  external_url: string | null;
  views: number;
  inquiries: number;
  leads_generated: number;
  submitted_at: string | null;
  published_at: string | null;
  last_refreshed_at: string | null;
  expires_at: string | null;
  last_error: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  properties: { internal_name: string; slug: string; image_urls?: string[] } | null;
  portals: { name: string; slug: string; tier: number; submit_url?: string; website_url?: string } | null;
}

interface Property {
  id: string;
  internal_name: string;
}

interface Portal {
  id: string;
  name: string;
  slug: string;
}

interface DistributeLog {
  portal: string;
  slug: string;
  status: string;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Status group definitions                                           */
/* ------------------------------------------------------------------ */

interface StatusGroup {
  key: string;
  label: string;
  match: (listing: PortalListing) => boolean;
  color: string;
}

function buildStatusGroups(L: Labels): StatusGroup[] {
  return [
    {
      key: "ready",
      label: L.readyGroup,
      match: (l) => l.status === "brand_guard_passed",
      color: "text-blue-400",
    },
    {
      key: "pending",
      label: L.pendingGroup,
      match: (l) => l.status === "pending_review" || l.status === "draft" || l.status === "submitting",
      color: "text-amber-400",
    },
    {
      key: "active",
      label: L.activeGroup,
      match: (l) => l.status === "active",
      color: "text-emerald-400",
    },
    {
      key: "error",
      label: L.errorGroup,
      match: (l) => l.status === "error" || l.status === "rejected",
      color: "text-red-400",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TIER_COLORS: Record<number, string> = {
  1: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  2: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  3: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

function tierBadge(tier: number, L: Labels) {
  const style = TIER_COLORS[tier] || TIER_COLORS[2];
  const labelMap: Record<number, string> = {
    1: L.tierPremium,
    2: L.tierStandard,
    3: L.tierFree,
  };
  const label = labelMap[tier] || L.tierLevel(tier);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${style}`}
    >
      {label}
    </span>
  );
}

function relativeTime(dateStr: string | null, L: Labels): string {
  if (!dateStr) return "-";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return L.now;
  if (mins < 60) return L.minsAgo(mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return L.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  return L.daysAgo(days);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PortalsListingsSection() {
  const { locale } = useTranslation();
  const L: Labels = LABELS[locale === "he" ? "he" : "en"];

  /* --- data state --- */
  const [listings, setListings] = useState<PortalListing[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --- filter state --- */
  const [filterPortal, setFilterPortal] = useState("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  /* --- interaction state --- */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  /* --- SSE distribution state --- */
  const [distributing, setDistributing] = useState<{
    active: boolean;
    total: number;
    done: number;
    logs: DistributeLog[];
    propertyName?: string;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Data loading                                                     */
  /* ---------------------------------------------------------------- */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listingsRes, propertiesRes, portalsRes] = await Promise.all([
        fetch("/api/marketing/portal-listings"),
        fetch("/api/marketing/properties"),
        fetch("/api/marketing/portals"),
      ]);

      if (!listingsRes.ok) throw new Error("load_error");

      const [listingsData, propertiesData, portalsData] = await Promise.all([
        listingsRes.json(),
        propertiesRes.json(),
        portalsRes.json(),
      ]);

      setListings(listingsData.listings || []);
      const loadedProperties: Property[] = propertiesData.properties || [];
      setProperties(loadedProperties);
      setPortals(portalsData.portals || []);

      // Auto-select first property if none selected (enables Distribute button)
      if (loadedProperties.length > 0) {
        setFilterProperty((prev) => (prev === "all" ? loadedProperties[0].id : prev));
      }
    } catch (err) {
      setError(err instanceof Error && err.message === "load_error" ? "load_error" : "load_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------------------------------------------------------------- */
  /*  Filtered listings                                                */
  /* ---------------------------------------------------------------- */

  const filtered = listings.filter((l) => {
    if (filterPortal !== "all" && l.portal_id !== filterPortal) return false;
    if (filterProperty !== "all" && l.property_id !== filterProperty) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    return true;
  });

  /* ---------------------------------------------------------------- */
  /*  Grouped listings by status                                       */
  /* ---------------------------------------------------------------- */

  const statusGroups = buildStatusGroups(L);

  function groupListings(items: PortalListing[]) {
    const grouped: { group: StatusGroup; items: PortalListing[] }[] = [];
    const assigned = new Set<string>();

    for (const group of statusGroups) {
      const matching = items.filter((l) => group.match(l) && !assigned.has(l.id));
      if (matching.length > 0) {
        matching.forEach((l) => assigned.add(l.id));
        grouped.push({ group, items: matching });
      }
    }

    // Catch-all for statuses not in any group
    const remaining = items.filter((l) => !assigned.has(l.id));
    if (remaining.length > 0) {
      grouped.push({
        group: { key: "other", label: L.other, match: () => true, color: "text-muted" },
        items: remaining,
      });
    }

    return grouped;
  }

  const groupedListings = groupListings(filtered);

  /* ---------------------------------------------------------------- */
  /*  Stats                                                            */
  /* ---------------------------------------------------------------- */

  const totalCount = filtered.length;
  const activeCount = filtered.filter((l) => l.status === "active").length;
  const pendingCount = filtered.filter(
    (l) =>
      l.status === "draft" ||
      l.status === "pending_review" ||
      l.status === "brand_guard_passed" ||
      l.status === "submitting",
  ).length;
  const errorCount = filtered.filter(
    (l) => l.status === "error" || l.status === "rejected",
  ).length;

  /* ---------------------------------------------------------------- */
  /*  Action handlers                                                  */
  /* ---------------------------------------------------------------- */

  const handleAdapt = async (listing: PortalListing) => {
    setActionLoading((prev) => ({ ...prev, [listing.id]: "adapt" }));
    try {
      await fetch("/api/marketing/portal-listings/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: listing.property_id,
          portal_id: listing.portal_id,
        }),
      });
      await loadData();
    } finally {
      setActionLoading((prev) => {
        const n = { ...prev };
        delete n[listing.id];
        return n;
      });
    }
  };

  const handleSubmit = async (listingId: string) => {
    setActionLoading((prev) => ({ ...prev, [listingId]: "submit" }));
    try {
      await fetch(`/api/marketing/portal-listings/${listingId}/submit`, {
        method: "POST",
      });
      await loadData();
    } finally {
      setActionLoading((prev) => {
        const n = { ...prev };
        delete n[listingId];
        return n;
      });
    }
  };

  const handleRefresh = async (listingId: string) => {
    setActionLoading((prev) => ({ ...prev, [listingId]: "refresh" }));
    try {
      await fetch(`/api/marketing/portal-listings/${listingId}/refresh`, {
        method: "POST",
      });
      await loadData();
    } finally {
      setActionLoading((prev) => {
        const n = { ...prev };
        delete n[listingId];
        return n;
      });
    }
  };

  const handleCopy = async (listing: PortalListing) => {
    const text = [listing.adapted_title, "", listing.adapted_description].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(listing.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts; silently ignore
    }
  };

  /* ---------------------------------------------------------------- */
  /*  SSE distribution (POST with ReadableStream)                      */
  /* ---------------------------------------------------------------- */

  const handleDistribute = async () => {
    if (!filterProperty || filterProperty === "all") return;

    const controller = new AbortController();
    abortRef.current = controller;

    setDistributing({
      active: true,
      total: 0,
      done: 0,
      logs: [],
      propertyName: properties.find((p) => p.id === filterProperty)?.internal_name,
    });

    try {
      const res = await fetch("/api/marketing/portal-listings/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: filterProperty }),
        signal: controller.signal,
      });

      if (!res.body) {
        setDistributing((prev) => (prev ? { ...prev, active: false } : null));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop()!;

        for (const chunk of chunks) {
          const match = chunk.match(/^event: (\w+)\ndata: ([\s\S]+)$/);
          if (!match) continue;
          const [, event, data] = match;
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue;
          }

          setDistributing((prev) => {
            if (!prev) return prev;
            switch (event) {
              case "start":
                return { ...prev, total: (parsed.total as number) || 0 };
              case "progress":
                return {
                  ...prev,
                  done: prev.done + 1,
                  logs: [...prev.logs, parsed as unknown as DistributeLog],
                };
              case "error":
                return {
                  ...prev,
                  logs: [
                    ...prev.logs,
                    { ...(parsed as unknown as DistributeLog), status: "error" },
                  ],
                };
              case "done":
                return { ...prev, active: false };
              default:
                return prev;
            }
          });
        }
      }

      // Stream ended without explicit "done" event
      setDistributing((prev) => (prev ? { ...prev, active: false } : null));
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setDistributing((prev) => (prev ? { ...prev, active: false } : null));
      }
    }
  };

  const handleCancelDistribute = () => {
    abortRef.current?.abort();
    setDistributing((prev) => (prev ? { ...prev, active: false } : null));
  };

  const handleCloseDistribute = () => {
    setDistributing(null);
    loadData();
  };

  /* ---------------------------------------------------------------- */
  /*  Unique statuses for filter dropdown                              */
  /* ---------------------------------------------------------------- */

  const uniqueStatuses = Array.from(new Set(listings.map((l) => l.status)));

  /* ---------------------------------------------------------------- */
  /*  Date formatting helper                                           */
  /* ---------------------------------------------------------------- */

  const dateFmt = locale === "he" ? "he-IL" : "en-US";

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (loading && listings.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-muted" size={32} />
        </div>
      </section>
    );
  }

  return (
    <section dir={locale === "he" ? "rtl" : "ltr"} className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
            <List size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-text-primary">
              {L.title}
            </h2>
            <p className="text-xs text-muted">{L.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Distribute All button */}
          <button
            onClick={handleDistribute}
            disabled={
              filterProperty === "all" ||
              !filterProperty ||
              distributing?.active
            }
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title={
              filterProperty === "all" ? L.selectProperty : L.distributeAll
            }
          >
            <span className="flex items-center gap-1.5">
              <Send size={14} />
              {L.distributeAll}
            </span>
          </button>

          {/* Filter: Portal */}
          <select
            value={filterPortal}
            onChange={(e) => setFilterPortal(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="all">{L.allPortals}</option>
            {portals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Filter: Property */}
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="all">{L.allProperties}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.internal_name}
              </option>
            ))}
          </select>

          {/* Filter: Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="all">{L.allStatuses}</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ---- Error banner ---- */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">
              {L.lastError}
            </p>
            <p className="text-xs text-red-300/70 mt-1">
              {error === "load_error" ? L.loadError : L.loadFailed}
            </p>
          </div>
        </div>
      )}

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={L.total} value={totalCount} color="text-text-primary" />
        <StatCard label={L.active} value={activeCount} color="text-emerald-400" />
        <StatCard label={L.pending} value={pendingCount} color="text-amber-400" />
        <StatCard label={L.errors} value={errorCount} color="text-red-400" />
      </div>

      {/* ---- Grouped listings ---- */}
      {filtered.length > 0 ? (
        <div className="space-y-6">
          {groupedListings.map(({ group, items }) => (
            <div key={group.key}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm font-display font-semibold ${group.color}`}>
                  {group.label}
                </span>
                <span className="text-xs text-muted">({items.length})</span>
                <div className="flex-1 h-px bg-stroke/50" />
              </div>

              {/* Listings table for group */}
              <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid md:grid-cols-[0.4fr_1.2fr_1fr_0.9fr_1.6fr_0.6fr_0.6fr_0.6fr_0.8fr] gap-2 px-5 py-3 border-b border-stroke">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider" />
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {L.property}
                  </span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {L.portal}
                  </span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {L.status}
                  </span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {L.titleCol}
                  </span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider text-left">
                    {L.views}
                  </span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider text-left">
                    {L.inquiries}
                  </span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider text-left">
                    {L.leads}
                  </span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider text-left">
                    {L.updated}
                  </span>
                </div>

                {/* Table rows */}
                {items.map((listing) => {
                  const isExpanded = expandedId === listing.id;
                  const currentAction = actionLoading[listing.id];
                  const thumbUrl = listing.properties?.image_urls?.[0];

                  return (
                    <div key={listing.id}>
                      {/* Main row */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                        className="w-full border-t border-stroke hover:bg-surface/50 cursor-pointer transition-colors"
                      >
                        {/* Desktop row */}
                        <div className="hidden md:grid md:grid-cols-[0.4fr_1.2fr_1fr_0.9fr_1.6fr_0.6fr_0.6fr_0.6fr_0.8fr] gap-2 items-center px-5 py-3 text-right">
                          {/* Thumbnail */}
                          <span className="flex items-center justify-center">
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-stroke"
                              />
                            ) : (
                              <span className="w-10 h-10 rounded-lg bg-white/5 border border-stroke flex items-center justify-center">
                                <ImageIcon size={16} className="text-muted/40" />
                              </span>
                            )}
                          </span>

                          {/* Property */}
                          <span className="text-sm font-medium text-text-primary truncate">
                            {listing.properties?.internal_name || "-"}
                          </span>

                          {/* Portal + tier */}
                          <span className="flex items-center gap-2">
                            <span className="text-sm text-text-primary truncate">
                              {listing.portals?.name || "-"}
                            </span>
                            {listing.portals && tierBadge(listing.portals.tier, L)}
                          </span>

                          {/* Status */}
                          <span>
                            <StatusBadge status={listing.status} type="listing" />
                          </span>

                          {/* Title */}
                          <span className="text-xs text-muted truncate">
                            {listing.adapted_title || L.notAdapted}
                          </span>

                          {/* Views */}
                          <span className="text-xs text-muted text-left tabular-nums">
                            {listing.views.toLocaleString()}
                          </span>

                          {/* Inquiries */}
                          <span className="text-xs text-muted text-left tabular-nums">
                            {listing.inquiries.toLocaleString()}
                          </span>

                          {/* Leads */}
                          <span className="text-xs text-muted text-left tabular-nums">
                            {listing.leads_generated.toLocaleString()}
                          </span>

                          {/* Updated */}
                          <span className="flex items-center justify-start gap-1">
                            <span className="text-xs text-muted">
                              {relativeTime(listing.updated_at || listing.published_at || listing.created_at, L)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={14} className="text-muted shrink-0" />
                            ) : (
                              <ChevronDown size={14} className="text-muted shrink-0" />
                            )}
                          </span>
                        </div>

                        {/* Mobile row */}
                        <div className="md:hidden flex flex-col gap-1.5 px-5 py-3 text-right">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {thumbUrl ? (
                                <img
                                  src={thumbUrl}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover border border-stroke shrink-0"
                                />
                              ) : (
                                <span className="w-8 h-8 rounded-lg bg-white/5 border border-stroke flex items-center justify-center shrink-0">
                                  <ImageIcon size={12} className="text-muted/40" />
                                </span>
                              )}
                              <span className="text-sm font-medium text-text-primary">
                                {listing.properties?.internal_name || "-"}
                              </span>
                            </div>
                            <StatusBadge status={listing.status} type="listing" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted">
                              {listing.portals?.name || "-"}
                            </span>
                            {listing.portals && tierBadge(listing.portals.tier, L)}
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-muted">
                            <span>{listing.views} {L.views}</span>
                            <span>{listing.inquiries} {L.inquiries}</span>
                            <span>{listing.leads_generated} {L.leads}</span>
                          </div>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t border-stroke/30 px-5 py-4 space-y-4 bg-white/[0.01]">
                          {/* Property images gallery */}
                          {listing.properties?.image_urls && listing.properties.image_urls.length > 0 && (
                            <div>
                              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                                {L.images}
                              </label>
                              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                {(listing.properties.image_urls as string[]).slice(0, 6).map((url: string, i: number) => (
                                  <img
                                    key={i}
                                    src={url}
                                    alt=""
                                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-stroke"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Adapted title */}
                          <div>
                            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                              {L.adaptedTitle}
                            </label>
                            <p className="mt-1 text-sm text-text-primary">
                              {listing.adapted_title || (
                                <span className="italic text-muted">{L.notAdapted}</span>
                              )}
                            </p>
                          </div>

                          {/* Adapted description */}
                          <div>
                            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                              {L.adaptedDesc}
                            </label>
                            <p className="mt-1 text-xs text-muted leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                              {listing.adapted_description || (
                                <span className="italic">{L.notAdapted}</span>
                              )}
                            </p>
                          </div>

                          {/* Brand guard result */}
                          <div>
                            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                              {L.brandGuard}
                            </label>
                            <div className="mt-1">
                              {listing.brand_guard_passed === null ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400">
                                  {L.notChecked}
                                </span>
                              ) : listing.brand_guard_passed ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                  <CheckCircle size={12} />
                                  {L.passed}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
                                  <XCircle size={12} />
                                  {L.failed}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Last error */}
                          {listing.last_error && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-start gap-2">
                              <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-semibold text-red-400 uppercase">
                                  {L.lastError}
                                </p>
                                <p className="text-xs text-red-300 mt-0.5">
                                  {listing.last_error}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                              <p className="text-[9px] text-muted">{L.created}</p>
                              <p className="text-xs font-medium text-text-primary">
                                {new Date(listing.created_at).toLocaleDateString(dateFmt)}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                              <p className="text-[9px] text-muted">{L.submitted}</p>
                              <p className="text-xs font-medium text-text-primary">
                                {listing.submitted_at
                                  ? new Date(listing.submitted_at).toLocaleDateString(dateFmt)
                                  : "-"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                              <p className="text-[9px] text-muted">{L.published}</p>
                              <p className="text-xs font-medium text-text-primary">
                                {listing.published_at
                                  ? new Date(listing.published_at).toLocaleDateString(dateFmt)
                                  : "-"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                              <p className="text-[9px] text-muted">{L.portal}</p>
                              <p className="text-xs font-medium text-text-primary">
                                {listing.portals?.slug || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-2">
                            {/* Adapt */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdapt(listing);
                              }}
                              disabled={!!currentAction}
                              className="rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6fa3] disabled:opacity-40 transition-colors flex items-center gap-1.5"
                            >
                              {currentAction === "adapt" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Sparkles size={14} />
                              )}
                              {L.adapt}
                            </button>

                            {/* Submit */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubmit(listing.id);
                              }}
                              disabled={
                                !!currentAction ||
                                !listing.adapted_title ||
                                listing.brand_guard_passed === false
                              }
                              className="rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6fa3] disabled:opacity-40 transition-colors flex items-center gap-1.5"
                            >
                              {currentAction === "submit" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              {L.submit}
                            </button>

                            {/* Copy Content */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(listing);
                              }}
                              disabled={!listing.adapted_title && !listing.adapted_description}
                              className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface disabled:opacity-40 transition-colors flex items-center gap-1.5"
                            >
                              {copied === listing.id ? (
                                <Check size={14} className="text-emerald-400" />
                              ) : (
                                <Copy size={14} />
                              )}
                              {copied === listing.id ? L.copied : L.copyContent}
                            </button>

                            {/* Refresh */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRefresh(listing.id);
                              }}
                              disabled={!!currentAction}
                              className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface transition-colors flex items-center gap-1.5"
                            >
                              {currentAction === "refresh" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <RefreshCw size={14} />
                              )}
                              {L.refresh}
                            </button>

                            {/* View on Portal */}
                            {listing.external_url && (
                              <a
                                href={listing.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface transition-colors flex items-center gap-1.5"
                              >
                                <ExternalLink size={14} />
                                {L.viewOnPortal}
                              </a>
                            )}

                            {/* Open Submission Page */}
                            {(listing.portals?.submit_url || listing.portals?.website_url) && (
                              <a
                                href={listing.portals.submit_url || listing.portals.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
                              >
                                <ExternalLink size={14} />
                                {L.openSubmitPage}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-stroke bg-surface p-12 text-center">
          <List size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">{L.noListings}</p>
          <p className="text-xs text-muted/50 mt-2">{L.noListingsHint}</p>
        </div>
      )}

      {/* ---- Distribution overlay (fixed bottom panel) ---- */}
      {distributing && (
        <div dir={locale === "he" ? "rtl" : "ltr"} className="fixed bottom-0 left-0 right-0 z-50 border-t border-stroke bg-[#0d0d1a]/95 backdrop-blur-sm shadow-2xl">
          <div className="mx-auto max-w-5xl px-6 py-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send
                  size={16}
                  className={
                    distributing.active ? "text-blue-400 animate-pulse" : "text-emerald-400"
                  }
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {distributing.active ? L.distributing : L.distributionDone}
                  </p>
                  <p className="text-xs text-muted">
                    {distributing.propertyName
                      ? `${L.property}: ${distributing.propertyName}`
                      : ""}
                    {distributing.total > 0 &&
                      ` - ${distributing.done} / ${distributing.total}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {distributing.active ? (
                  <button
                    onClick={handleCancelDistribute}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    {L.cancel}
                  </button>
                ) : (
                  <button
                    onClick={handleCloseDistribute}
                    className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    {L.close}
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {distributing.total > 0 && (
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    distributing.active ? "bg-blue-500" : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (distributing.done / distributing.total) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            )}

            {/* Log entries */}
            {distributing.logs.length > 0 && (
              <div className="max-h-[180px] overflow-y-auto space-y-1">
                {distributing.logs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs"
                  >
                    {log.status === "ok" || log.status === "success" ? (
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    ) : log.status === "error" ? (
                      <XCircle size={14} className="text-red-400 shrink-0" />
                    ) : (
                      <Loader2 size={14} className="text-muted animate-spin shrink-0" />
                    )}
                    <span className="font-medium text-text-primary">{log.portal}</span>
                    <span className="text-muted">({log.slug})</span>
                    {log.error && (
                      <span className="text-red-400 mr-auto truncate max-w-[300px]">
                        {log.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary on completion */}
            {!distributing.active && distributing.logs.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-muted pt-1 border-t border-stroke/30">
                <span>
                  <span className="text-emerald-400 font-semibold">
                    {distributing.logs.filter(
                      (l) => l.status === "ok" || l.status === "success",
                    ).length}
                  </span>{" "}
                  {L.succeeded}
                </span>
                <span>
                  <span className="text-red-400 font-semibold">
                    {distributing.logs.filter((l) => l.status === "error").length}
                  </span>{" "}
                  {L.failedCount}
                </span>
                <span>
                  {distributing.done} / {distributing.total} {L.total}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-stroke bg-surface p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
