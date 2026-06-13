import {
  buildSalesOsResponse,
  getSalesOsProfile,
  type SalesOsChannel,
  type SalesOsLanguage,
  type SalesOsMessage,
} from '@/lib/sales-os/blue-everest-agent';

export const dynamic = 'force-dynamic';

function normalizeHistory(value: unknown): SalesOsMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        role: (row.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: String(row.content ?? ''),
        timestamp: typeof row.timestamp === 'string' ? row.timestamp : undefined,
      };
    })
    .filter((message) => message.content.trim());
}

export async function GET() {
  return Response.json({
    ok: true,
    ...getSalesOsProfile(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const message = String(body.message ?? '').trim();
  if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

  const response = buildSalesOsResponse({
    message,
    history: normalizeHistory(body.history),
    channel: (body.channel as SalesOsChannel | undefined) ?? 'crm',
    preferredLanguage: (body.preferredLanguage as SalesOsLanguage | undefined) ?? null,
    leadName: typeof body.leadName === 'string' ? body.leadName : null,
  });

  return Response.json({
    ok: true,
    response,
  });
}
