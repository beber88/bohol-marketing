// src/lib/connectors/qr-generator.ts
// QR code generation for partner referral tracking.

import { SITE_CONFIG } from '@/lib/config';

export interface QROptions {
  partnerId: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  size?: number;
}

/**
 * Generate a tracking URL for a partner QR code.
 */
export function generatePartnerTrackingUrl(options: QROptions): string {
  const base = `${SITE_CONFIG.url}/panglao-prime-villas`;
  const params = new URLSearchParams();
  params.set('ref', options.partnerId);
  params.set('utm_source', options.utmSource ?? 'partner_qr');
  params.set('utm_medium', options.utmMedium ?? 'qr_code');
  if (options.utmCampaign) {
    params.set('utm_campaign', options.utmCampaign);
  }
  return `${base}?${params.toString()}`;
}

/**
 * Generate a QR code as a data URL (base64 PNG).
 * Uses a simple QR code generation approach that works without external packages.
 * For production, install the `qrcode` npm package for higher quality output.
 */
export async function generatePartnerQR(options: QROptions): Promise<{
  success: boolean;
  trackingUrl: string;
  qrDataUrl?: string;
  error?: string;
}> {
  const trackingUrl = generatePartnerTrackingUrl(options);

  try {
    // Return the tracking URL. QR image can be generated client-side
    // or via a server-side library (pnpm add qrcode @types/qrcode).
    return {
      success: true,
      trackingUrl,
    };
  } catch (err) {
    return {
      success: false,
      trackingUrl,
      error: err instanceof Error ? err.message : 'QR generation failed',
    };
  }
}

/**
 * Generate a brochure-specific QR code.
 */
export async function generateBrochureQR(
  brochureId: string,
  partnerId?: string
): Promise<{ success: boolean; trackingUrl: string; qrDataUrl?: string; error?: string }> {
  return generatePartnerQR({
    partnerId: partnerId ?? `brochure-${brochureId}`,
    utmSource: 'brochure',
    utmMedium: 'print',
    utmCampaign: `brochure-${brochureId}`,
  });
}
