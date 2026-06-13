import { sendWhatsAppCloudText, whatsappCloudStatus } from '@/lib/connectors/whatsapp-cloud';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    ok: true,
    purpose: 'Send WhatsApp messages through the official Meta WhatsApp Cloud API.',
    status: whatsappCloudStatus(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const phone = String(body.phone ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!phone || !message) {
    return Response.json({ error: 'phone and message are required' }, { status: 400 });
  }

  const result = await sendWhatsAppCloudText(phone, message);
  return Response.json({ ok: result.ok, result }, { status: result.ok ? 200 : result.status });
}
