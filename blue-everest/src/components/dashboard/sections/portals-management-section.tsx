"use client";

import { useState, useEffect } from "react";
import {
  Settings2, Loader2, RefreshCw, Wifi, WifiOff,
  CheckCircle, XCircle, List, Power, PowerOff, X,
  PlugZap,
} from "lucide-react";
import { StatusBadge } from "../cards/status-badge";

interface Portal {
  id: string;
  name: string;
  slug: string;
  tier: number;
  portal_type: string;
  integration_method: string;
  is_active: boolean;
  listing_fee_usd: number | null;
  notes: string | null;
}

interface ConnectionTestResult {
  portal: string;
  slug: string;
  integrationMethod: string;
  configured: boolean;
  envVars: Record<string, boolean>;
  automationAvailable: boolean;
}

interface PortalListing {
  id: string;
  portal_id: string;
  property_id: string;
  status: string;
  external_url: string | null;
  created_at: string;
}

function TierBadge({ tier }: { tier: number }) {
  if (tier === 1) {
    return (
      <span className="bg-amber-500/20 text-amber-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
        T1
      </span>
    );
  }
  if (tier === 2) {
    return (
      <span className="bg-blue-500/20 text-blue-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
        T2
      </span>
    );
  }
  return (
    <span className="bg-zinc-500/20 text-zinc-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
      T{tier}
    </span>
  );
}

const METHOD_STYLES: Record<string, string> = {
  api_feed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  playwright: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  manual: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  connector: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

const METHOD_LABELS: Record<string, string> = {
  api_feed: "API Feed",
  playwright: "Playwright",
  manual: "Manual",
  connector: "Connector",
};

export function PortalsManagementSection() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortalId, setSelectedPortalId] = useState<string | null>(null);

  // Filters
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");

  // Detail panel state
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [listings, setListings] = useState<PortalListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const fetchPortals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/portals", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPortals(Array.isArray(data.portals) ? data.portals : []);
      }
    } catch {
      /* keep defaults */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPortals();
  }, []);

  // Fetch listings when a portal is selected
  useEffect(() => {
    if (!selectedPortalId) {
      setListings([]);
      setTestResult(null);
      return;
    }

    setListingsLoading(true);
    fetch(`/api/marketing/portal-listings?portalId=${selectedPortalId}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ listings: [] })))
      .then((d) => setListings(Array.isArray(d.listings) ? d.listings : []))
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, [selectedPortalId]);

  const selectedPortal = portals.find((p) => p.id === selectedPortalId) ?? null;

  const testConnection = async () => {
    if (!selectedPortalId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(
        `/api/marketing/portals/${selectedPortalId}/test-connection`,
        { method: "POST" }
      );
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch {
      /* ignore */
    }
    setTesting(false);
  };

  const toggleActive = async () => {
    if (!selectedPortal) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/marketing/portals/${selectedPortal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !selectedPortal.is_active }),
      });
      if (res.ok) {
        await fetchPortals();
      }
    } catch {
      /* ignore */
    }
    setToggling(false);
  };

  // Apply filters
  const filtered = portals.filter((p) => {
    if (filterTier !== "all" && p.tier !== Number(filterTier)) return false;
    if (filterType !== "all" && p.portal_type !== filterType) return false;
    if (filterMethod !== "all" && p.integration_method !== filterMethod) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Settings2 size={18} className="text-[#89AACC]" /> Portal Management
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="all">All Tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3+</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="all">All Types</option>
            <option value="property_portal">Property Portal</option>
            <option value="aggregator">Aggregator</option>
            <option value="social">Social</option>
            <option value="ads">Ads</option>
            <option value="video">Video</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="all">All Methods</option>
            <option value="api_feed">API Feed</option>
            <option value="playwright">Playwright</option>
            <option value="manual">Manual</option>
            <option value="connector">Connector</option>
          </select>

          <button
            onClick={fetchPortals}
            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Portal Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((portal) => {
            const isSelected = selectedPortalId === portal.id;
            const methodStyle =
              METHOD_STYLES[portal.integration_method] ?? METHOD_STYLES.manual;

            return (
              <button
                key={portal.id}
                onClick={() =>
                  setSelectedPortalId(isSelected ? null : portal.id)
                }
                className={`rounded-2xl border bg-surface p-5 text-left transition-colors ${
                  isSelected
                    ? "border-[#4E85BF]/50 ring-1 ring-[#4E85BF]/30"
                    : "border-stroke hover:border-[#4E85BF]/25"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold truncate">
                    {portal.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        portal.is_active ? "bg-emerald-400" : "bg-zinc-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <TierBadge tier={portal.tier} />
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${methodStyle}`}
                  >
                    {METHOD_LABELS[portal.integration_method] ??
                      portal.integration_method}
                  </span>
                </div>

                {portal.listing_fee_usd != null && portal.listing_fee_usd > 0 && (
                  <p className="text-[10px] text-muted mb-1">
                    Fee: ${portal.listing_fee_usd}/listing
                  </p>
                )}

                {portal.notes && (
                  <p className="text-[10px] text-muted truncate">{portal.notes}</p>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <WifiOff size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted">
            No portals match the current filters.
          </p>
        </div>
      )}

      {/* Detail Panel */}
      {selectedPortal && (
        <div className="rounded-2xl border border-stroke bg-surface p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi size={18} className="text-[#89AACC]" />
              <h3 className="font-display text-lg font-semibold">
                {selectedPortal.name}
              </h3>
              <StatusBadge
                status={selectedPortal.is_active ? "configured" : "inactive"}
                type="portal"
              />
            </div>
            <button
              onClick={() => setSelectedPortalId(null)}
              className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface"
            >
              <X size={14} />
            </button>
          </div>

          {/* Portal Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
              <p className="text-[9px] text-muted uppercase">Slug</p>
              <p className="text-xs font-bold mt-0.5">{selectedPortal.slug}</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
              <p className="text-[9px] text-muted uppercase">Tier</p>
              <p className="text-xs font-bold mt-0.5 flex items-center gap-1.5">
                <TierBadge tier={selectedPortal.tier} />
              </p>
            </div>
            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
              <p className="text-[9px] text-muted uppercase">Type</p>
              <p className="text-xs font-bold mt-0.5">
                {selectedPortal.portal_type.replace(/_/g, " ")}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
              <p className="text-[9px] text-muted uppercase">Method</p>
              <p className="text-xs font-bold mt-0.5">
                {METHOD_LABELS[selectedPortal.integration_method] ??
                  selectedPortal.integration_method}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
              <p className="text-[9px] text-muted uppercase">Fee</p>
              <p className="text-xs font-bold mt-0.5">
                {selectedPortal.listing_fee_usd != null &&
                selectedPortal.listing_fee_usd > 0
                  ? `$${selectedPortal.listing_fee_usd}`
                  : "Free"}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
              <p className="text-[9px] text-muted uppercase">Listings</p>
              <p className="text-xs font-bold mt-0.5 flex items-center gap-1">
                <List size={12} className="text-muted" />
                {listingsLoading ? (
                  <Loader2 size={12} className="animate-spin text-muted" />
                ) : (
                  listings.length
                )}
              </p>
            </div>
          </div>

          {/* Notes */}
          {selectedPortal.notes && (
            <div className="rounded-lg bg-white/5 border border-stroke px-4 py-3">
              <p className="text-[9px] text-muted uppercase mb-1">Notes</p>
              <p className="text-xs text-text-primary leading-relaxed">
                {selectedPortal.notes}
              </p>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={testConnection}
              disabled={testing}
              className="rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6fa3] disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {testing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <PlugZap size={14} />
              )}
              {testing ? "Testing..." : "Test Connection"}
            </button>

            <button
              onClick={toggleActive}
              disabled={toggling}
              className={`rounded-lg border px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${
                selectedPortal.is_active
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              {toggling ? (
                <Loader2 size={14} className="animate-spin" />
              ) : selectedPortal.is_active ? (
                <PowerOff size={14} />
              ) : (
                <Power size={14} />
              )}
              {selectedPortal.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>

          {/* Connection Test Result */}
          {testResult && (
            <div className="rounded-xl border border-stroke bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <PlugZap size={14} className="text-[#89AACC]" />
                  Connection Status
                </h4>
                <StatusBadge
                  status={testResult.configured ? "configured" : "not_configured"}
                  type="portal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(testResult.envVars).map(([key, present]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-stroke bg-white/[0.02] px-3 py-2"
                  >
                    <span className="text-xs text-muted font-mono truncate">
                      {key}
                    </span>
                    {present ? (
                      <CheckCircle
                        size={14}
                        className="text-emerald-400 shrink-0"
                      />
                    ) : (
                      <XCircle size={14} className="text-red-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted">
                <span>
                  Integration:{" "}
                  <span className="font-semibold text-text-primary">
                    {testResult.integrationMethod}
                  </span>
                </span>
                <span>
                  Automation:{" "}
                  <span
                    className={`font-semibold ${
                      testResult.automationAvailable
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {testResult.automationAvailable
                      ? "Available"
                      : "Not available"}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Listings Table */}
          {listings.length > 0 && (
            <div className="rounded-xl border border-stroke overflow-hidden">
              <div className="px-4 py-3 border-b border-stroke">
                <h4 className="text-sm font-semibold">
                  Listings ({listings.length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stroke text-left text-xs text-muted">
                      <th className="px-4 py-2">Property</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr
                        key={listing.id}
                        className="border-b border-stroke/50 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-2 text-xs">
                          {listing.property_id}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge
                            status={listing.status}
                            type="listing"
                          />
                        </td>
                        <td className="px-4 py-2 text-xs text-muted">
                          {new Date(listing.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
