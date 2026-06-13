// src/lib/connectors/lamudi.ts
// Lamudi Philippines XML feed connector.
// Generates RESO-style XML feeds for property syndication.

export interface LamudiFeedProperty {
  id: string;
  title: string;
  description: string;
  price: number; // PHP
  currency: string;
  bedrooms: number;
  bathrooms: number;
  floorArea: number; // sqm
  lotArea?: number;
  propertyType: string; // house, condo, lot, commercial
  listingType: string; // sale, rent
  city: string;
  region: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  agentName: string;
  agentPhone: string;
  agentEmail: string;
}

/**
 * Generate RESO-style XML feed for Lamudi.
 */
export function generateFeedXML(properties: LamudiFeedProperty[]): string {
  const items = properties.map((p) => {
    const images = p.images
      .map((url, i) => `      <image${i + 1}>${escapeXml(url)}</image${i + 1}>`)
      .join('\n');

    return `    <property>
      <id>${escapeXml(p.id)}</id>
      <title>${escapeXml(p.title)}</title>
      <description><![CDATA[${p.description}]]></description>
      <price>${p.price}</price>
      <currency>${p.currency}</currency>
      <bedrooms>${p.bedrooms}</bedrooms>
      <bathrooms>${p.bathrooms}</bathrooms>
      <floor_area>${p.floorArea}</floor_area>
      ${p.lotArea ? `<lot_area>${p.lotArea}</lot_area>` : ''}
      <property_type>${escapeXml(p.propertyType)}</property_type>
      <listing_type>${escapeXml(p.listingType)}</listing_type>
      <city>${escapeXml(p.city)}</city>
      <region>${escapeXml(p.region)}</region>
      ${p.address ? `<address>${escapeXml(p.address)}</address>` : ''}
      ${p.latitude ? `<geo_latitude>${p.latitude}</geo_latitude>` : ''}
      ${p.longitude ? `<geo_longitude>${p.longitude}</geo_longitude>` : ''}
${images}
      <agent_name>${escapeXml(p.agentName)}</agent_name>
      <agent_phone>${escapeXml(p.agentPhone)}</agent_phone>
      <agent_email>${escapeXml(p.agentEmail)}</agent_email>
    </property>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<properties>
  <last_updated>${new Date().toISOString()}</last_updated>
  <total_count>${properties.length}</total_count>
${items.join('\n')}
</properties>`;
}

/**
 * Push the XML feed to Lamudi's endpoint.
 */
export async function pushFeed(xml: string): Promise<{
  success: boolean;
  statusCode?: number;
  message?: string;
}> {
  const feedUrl = process.env.LAMUDI_FEED_URL;
  const apiKey = process.env.LAMUDI_API_KEY;

  if (!feedUrl) {
    return { success: false, message: 'LAMUDI_FEED_URL not configured' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/xml',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(feedUrl, {
      method: 'POST',
      headers,
      body: xml,
    });

    return {
      success: response.ok,
      statusCode: response.status,
      message: response.ok ? 'Feed pushed successfully' : await response.text(),
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Feed push failed',
    };
  }
}

/**
 * Check if Lamudi connector is configured.
 */
export function isConfigured(): boolean {
  return !!(process.env.LAMUDI_FEED_URL || process.env.LAMUDI_API_KEY);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
