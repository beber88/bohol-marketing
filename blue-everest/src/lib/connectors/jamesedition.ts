// src/lib/connectors/jamesedition.ts
// JamesEdition luxury portal REST API connector.

const API_BASE = 'https://www.jamesedition.com/api/v1';

export interface JamesEditionListing {
  title: string;
  description: string;
  price: number; // USD
  currency: string;
  bedrooms: number;
  bathrooms: number;
  living_area_sqm: number;
  lot_area_sqm?: number;
  location: string;
  country: string;
  latitude?: number;
  longitude?: number;
  images: string[]; // Must be high-res, min 1200px wide
  amenities?: string[];
  features?: Record<string, unknown>;
  property_type: string;
}

export interface JamesEditionResponse {
  id: string;
  status: string;
  url?: string;
  views?: number;
  inquiries?: number;
}

function getHeaders(): Record<string, string> {
  const apiKey = process.env.JAMESEDITION_API_KEY;
  if (!apiKey) throw new Error('JAMESEDITION_API_KEY not configured');
  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  };
}

/**
 * Submit a new listing to JamesEdition.
 */
export async function submitListing(
  listing: JamesEditionListing
): Promise<{ success: boolean; data?: JamesEditionResponse; error?: string }> {
  try {
    const dealerId = process.env.JAMESEDITION_DEALER_ID;
    const response = await fetch(`${API_BASE}/dealers/${dealerId}/listings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(listing),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const data = (await response.json()) as JamesEditionResponse;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Update an existing listing on JamesEdition.
 */
export async function updateListing(
  listingId: string,
  updates: Partial<JamesEditionListing>
): Promise<{ success: boolean; error?: string }> {
  try {
    const dealerId = process.env.JAMESEDITION_DEALER_ID;
    const response = await fetch(`${API_BASE}/dealers/${dealerId}/listings/${listingId}`, {
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
 * Get listing performance metrics from JamesEdition.
 */
export async function getListingPerformance(
  listingId: string
): Promise<{ success: boolean; data?: JamesEditionResponse; error?: string }> {
  try {
    const dealerId = process.env.JAMESEDITION_DEALER_ID;
    const response = await fetch(`${API_BASE}/dealers/${dealerId}/listings/${listingId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const data = (await response.json()) as JamesEditionResponse;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export function isConfigured(): boolean {
  return !!(process.env.JAMESEDITION_API_KEY && process.env.JAMESEDITION_DEALER_ID);
}
