// POST: Test API connectivity for a portal

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    const { data: portal, error } = await supabase
      .from('portals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !portal) {
      return Response.json({ error: 'Portal not found' }, { status: 404 });
    }

    const slug = portal.slug as string;
    const results: Record<string, unknown> = {
      portal: portal.name,
      slug,
      integrationMethod: portal.integration_method,
    };

    switch (slug) {
      case 'lamudi-ph': {
        const { isConfigured } = await import('@/lib/connectors/lamudi');
        results.configured = isConfigured();
        results.envVars = { LAMUDI_FEED_URL: !!process.env.LAMUDI_FEED_URL, LAMUDI_API_KEY: !!process.env.LAMUDI_API_KEY };
        break;
      }
      case 'listglobally': {
        const { isConfigured } = await import('@/lib/connectors/listglobally');
        results.configured = isConfigured();
        results.envVars = { LISTGLOBALLY_API_KEY: !!process.env.LISTGLOBALLY_API_KEY, LISTGLOBALLY_AGENT_ID: !!process.env.LISTGLOBALLY_AGENT_ID };
        break;
      }
      case 'jamesedition': {
        const { isConfigured } = await import('@/lib/connectors/jamesedition');
        results.configured = isConfigured();
        results.envVars = { JAMESEDITION_API_KEY: !!process.env.JAMESEDITION_API_KEY, JAMESEDITION_DEALER_ID: !!process.env.JAMESEDITION_DEALER_ID };
        break;
      }
      case 'properstar': {
        const { isConfigured } = await import('@/lib/connectors/properstar');
        results.configured = isConfigured();
        results.envVars = { PROPERSTAR_FEED_URL: !!process.env.PROPERSTAR_FEED_URL };
        break;
      }
      case 'linkedin': {
        const { isConfigured } = await import('@/lib/connectors/linkedin-organic');
        results.configured = isConfigured();
        results.envVars = { LINKEDIN_ACCESS_TOKEN: !!process.env.LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN: !!process.env.LINKEDIN_PERSON_URN };
        break;
      }
      case 'youtube': {
        const { isConfigured } = await import('@/lib/connectors/youtube');
        results.configured = isConfigured();
        results.envVars = { YOUTUBE_ACCESS_TOKEN: !!process.env.YOUTUBE_ACCESS_TOKEN, YOUTUBE_CHANNEL_ID: !!process.env.YOUTUBE_CHANNEL_ID };
        break;
      }
      default: {
        if (portal.integration_method === 'playwright') {
          const { getPortalScript } = await import('@/lib/connectors/portal-playwright');
          const script = getPortalScript(slug);
          results.configured = !!script;
          results.automationAvailable = !!script;
        } else {
          results.configured = false;
          results.note = 'Manual portal - no API connection to test';
        }
      }
    }

    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
