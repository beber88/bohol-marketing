// src/lib/connectors/listglobally.ts
// ListGlobally REST API connector.
// Syndicates listings to 100+ portals worldwide with one integration.

const API_BASE = 'https://api.listglobally.com/v2';

export interface ListGloballyListing {
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  living_area: number;
  plot_area?: number;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  features?: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface ListGloballyResponse {
  id: string;
  status: string;
  portals_distributed: number;
  portal_statuses: Array<{ portal: string; status: string }>;
}

function getHeaders(): Record<string, string> {
  const apiKey = process.env.LISTGLOBALLY_API_KEY;
  if (!apiKey) throw new Error('LISTGLOBALLY_API_KEY not configured');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
}

/**
 * Create a new listing on ListGlobally for syndication.
 */
export async function createListing(
  listing: ListGloballyListing
): Promise<{ success: boolean; data?: ListGloballyResponse; error?: string }> {
  try {
    const agentId = process.env.LISTGLOBALLY_AGENT_ID;
    const response = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...listing, agent_id: agentId }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const data = (await response.json()) as ListGloballyResponse;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Update an existing listing.
 */
export async function updateListing(
  listingId: string,
  updates: Partial<ListGloballyListing>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/listings/${listingId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete a listing from ListGlobally (removes from all syndicated portals).
 */
export async function deleteListing(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/listings/${listingId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get the status of a listing across all syndicated portals.
 */
export async function getListingStatus(
  listingId: string
): Promise<{ success: boolean; data?: ListGloballyResponse; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/listings/${listingId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const data = (await response.json()) as ListGloballyResponse;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get list of available target portals.
 */
export async function getPortalList(): Promise<{
  success: boolean;
  portals?: Array<{ id: string; name: string; country: string }>;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/portals`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const portals = (await response.json()) as Array<{ id: string; name: string; country: string }>;
    return { success: true, portals };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Check if ListGlobally connector is configured.
 */
export function isConfigured(): boolean {
  return !!(process.env.LISTGLOBALLY_API_KEY && process.env.LISTGLOBALLY_AGENT_ID);
}
