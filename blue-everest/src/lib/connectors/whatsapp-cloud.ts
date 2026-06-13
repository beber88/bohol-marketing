import { getServerEnv } from '@/lib/server-env';

const META_API_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

function getAccessToken() {
  return (
    getServerEnv('WHATSAPP_CLOUD_ACCESS_TOKEN') ||
    getServerEnv('WHATSAPP_ACCESS_TOKEN') ||
    getServerEnv('META_PAGE_ACCESS_TOKEN') ||
    getServerEnv('META_ACCESS_TOKEN') ||
    null
  );
}

function getPhoneNumberId() {
  return (
    getServerEnv('WHATSAPP_PHONE_NUMBER_ID') ||
    getServerEnv('WHATSAPP_BUSINESS_PHONE_NUMBER_ID') ||
    getServerEnv('META_WHATSAPP_PHONE_NUMBER_ID') ||
    null
  );
}

export function whatsappCloudStatus() {
  return {
    accessTokenConfigured: Boolean(getAccessToken()),
    phoneNumberIdConfigured: Boolean(getPhoneNumberId()),
    configured: Boolean(getAccessToken() && getPhoneNumberId()),
  };
}

export function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/[^0-9]/g, '');
}

export async function sendWhatsAppCloudText(
  phone: string,
  text: string
): Promise<{ ok: boolean; status: number; body?: unknown; error?: string }> {
  const token = getAccessToken();
  const phoneNumberId = getPhoneNumberId();

  if (!token || !phoneNumberId) {
    return {
      ok: false,
      status: 503,
      error: 'WhatsApp Cloud API is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.',
    };
  }

  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizeWhatsAppPhone(phone),
      type: 'text',
      text: {
        preview_url: false,
        body: text.slice(0, 4000),
      },
    }),
  });

  const raw = await res.text();
  let body: unknown = raw;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }

  return {
    ok: res.ok,
    status: res.status,
    body,
    error: res.ok ? undefined : raw.slice(0, 1000),
  };
}
