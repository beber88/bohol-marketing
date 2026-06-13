import { createSupabaseAdmin } from '@/lib/connectors/supabase';
import { generatePartnerQR } from '@/lib/connectors/qr-generator';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { data: partner, error } = await supabase.from('partners').select('id, name, qr_code_id').eq('id', id).single();
    if (error || !partner) return Response.json({ error: 'Partner not found' }, { status: 404 });

    const qrResult = await generatePartnerQR({
      partnerId: partner.qr_code_id ?? partner.id,
      utmCampaign: `partner-${partner.name.toLowerCase().replace(/\s+/g, '-')}`,
    });

    // Update partner with QR code ID if not set
    if (!partner.qr_code_id) {
      await supabase.from('partners').update({ qr_code_id: partner.id }).eq('id', id);
    }

    return Response.json(qrResult);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
