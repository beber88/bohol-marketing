// src/lib/connectors/properstar.ts
// Properstar XML feed connector for global property aggregation.

export interface PropertystarProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string; // house, apartment, villa, land
  surface: number; // sqm
  rooms: number;
  bathrooms: number;
  latitude: number;
  longitude: number;
  pictures: string[];
  country: string;
  city: string;
  agencyId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
}

/**
 * Generate Properstar-format XML feed.
 */
export function generatePropertystarXML(properties: PropertystarProperty[]): string {
  const items = properties.map((p) => {
    const pictures = p.pictures
      .map((url) => `        <picture>${escapeXml(url)}</picture>`)
      .join('\n');

    return `    <listing>
      <id>${escapeXml(p.id)}</id>
      <title>${escapeXml(p.title)}</title>
      <description><![CDATA[${p.description}]]></description>
      <price currency="${p.currency}">${p.price}</price>
      <type>${escapeXml(p.type)}</type>
      <surface unit="sqm">${p.surface}</surface>
      <rooms>${p.rooms}</rooms>
      <bathrooms>${p.bathrooms}</bathrooms>
      <location>
        <country>${escapeXml(p.country)}</country>
        <city>${escapeXml(p.city)}</city>
        <latitude>${p.latitude}</latitude>
        <longitude>${p.longitude}</longitude>
      </location>
      <pictures>
${pictures}
      </pictures>
      <agency>
        <id>${escapeXml(p.agencyId)}</id>
        <agent>${escapeXml(p.agentName)}</agent>
        <phone>${escapeXml(p.agentPhone)}</phone>
        <email>${escapeXml(p.agentEmail)}</email>
      </agency>
    </listing>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <metadata>
    <generated>${new Date().toISOString()}</generated>
    <count>${properties.length}</count>
  </metadata>
  <listings>
${items.join('\n')}
  </listings>
</feed>`;
}

/**
 * Upload the feed to Properstar's endpoint.
 */
export async function uploadFeed(xml: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const feedUrl = process.env.PROPERSTAR_FEED_URL;
  const agencyId = process.env.PROPERSTAR_AGENCY_ID;

  if (!feedUrl) {
    return { success: false, message: 'PROPERSTAR_FEED_URL not configured' };
  }

  try {
    const response = await fetch(feedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        ...(agencyId ? { 'X-Agency-Id': agencyId } : {}),
      },
      body: xml,
    });

    return {
      success: response.ok,
      message: response.ok ? 'Feed uploaded' : await response.text(),
    };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Upload failed' };
  }
}

export function isConfigured(): boolean {
  return !!(process.env.PROPERSTAR_FEED_URL);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
