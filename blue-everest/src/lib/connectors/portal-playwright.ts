// src/lib/connectors/portal-playwright.ts
// Generalized Playwright engine for portal automation.
// Manages browser sessions, dispatches to portal-specific scripts.
// Modeled after fb-autoposter's facebook.js pattern.

import type { PortalScript, PortalPropertyInput, SubmitResult, StatusResult, RefreshResult } from './portal-scripts/types';
import { fazwazScript } from './portal-scripts/fazwaz';
import { dotpropertyScript } from './portal-scripts/dotproperty';

// Registry of all available portal scripts
const PORTAL_SCRIPTS: Record<string, PortalScript> = {
  'fazwaz-ph': fazwazScript,
  'dotproperty-ph': dotpropertyScript,
};

/**
 * Get a portal script by slug.
 */
export function getPortalScript(portalSlug: string): PortalScript | undefined {
  return PORTAL_SCRIPTS[portalSlug];
}

/**
 * List all available portal scripts.
 */
export function listPortalScripts(): Array<{ slug: string; name: string }> {
  return Object.values(PORTAL_SCRIPTS).map((s) => ({
    slug: s.portalSlug,
    name: s.displayName,
  }));
}

/**
 * Execute a full listing submission flow for a portal.
 * This is the main entry point - handles login, form fill, and submit.
 *
 * NOTE: In production, this runs on a separate worker process (not inside Next.js).
 * The worker manages Playwright browser contexts with persistent sessions per portal.
 * This function is the interface contract - the actual browser orchestration
 * happens in the worker, which calls these scripts.
 */
export async function submitToPortal(
  portalSlug: string,
  property: PortalPropertyInput
): Promise<SubmitResult> {
  const script = PORTAL_SCRIPTS[portalSlug];
  if (!script) {
    return { success: false, error: `No automation script for portal: ${portalSlug}` };
  }

  // In production, this would dispatch to the worker via HTTP.
  // For now, return a structured response indicating the script is available.
  return {
    success: false,
    error: `Portal automation worker not connected. Script available for ${script.displayName}. Deploy the portal worker to enable automated submission.`,
  };
}

/**
 * Check listing status on a portal.
 */
export async function checkPortalListingStatus(
  portalSlug: string,
  listingId: string
): Promise<StatusResult> {
  const script = PORTAL_SCRIPTS[portalSlug];
  if (!script) {
    return { status: 'unknown', error: `No script for portal: ${portalSlug}` };
  }
  return { status: 'unknown', error: 'Portal worker not connected' };
}

/**
 * Refresh a listing on a portal.
 */
export async function refreshPortalListing(
  portalSlug: string,
  listingId: string
): Promise<RefreshResult> {
  const script = PORTAL_SCRIPTS[portalSlug];
  if (!script) {
    return { success: false, error: `No script for portal: ${portalSlug}` };
  }
  return { success: false, error: 'Portal worker not connected' };
}

/**
 * Check which portals have automation scripts available.
 */
export function getAutomationCapabilities(): Record<string, boolean> {
  return Object.fromEntries(
    Object.entries(PORTAL_SCRIPTS).map(([slug]) => [slug, true])
  );
}
