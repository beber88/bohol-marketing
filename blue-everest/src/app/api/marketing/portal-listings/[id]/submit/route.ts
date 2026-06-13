// POST: Submit a listing to its portal via the appropriate connector

import { createSupabaseAdmin } from '@/lib/connectors/supabase';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 503 });

    // Get listing with portal and property data
    const { data: listing, error } = await supabase
      .from('portal_listings')
      .select('*, portals(*), properties(*)')
      .eq('id', id)
      .single();

    if (error || !listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    const portal = listing.portals as Record<string, unknown>;
    const integrationMethod = portal.integration_method as string;
    const portalSlug = portal.slug as string;

    // Update status to submitting
    await supabase.from('portal_listings').update({ status: 'submitting' }).eq('id', id);

    let result: { success: boolean; externalId?: string; externalUrl?: string; error?: string };

    switch (integrationMethod) {
      case 'api_feed': {
        // Route to appropriate connector based on portal slug
        if (portalSlug === 'lamudi-ph') {
          const { pushFeed, generateFeedXML } = await import('@/lib/connectors/lamudi');
          const property = listing.properties as Record<string, unknown>;
          const xml = generateFeedXML([{
            id: listing.id,
            title: listing.adapted_title ?? (property.internal_name as string),
            description: listing.adapted_description ?? '',
            price: (property.price_php_cents as number) / 100,
            currency: 'PHP',
            bedrooms: property.bedrooms as number,
            bathrooms: property.bathrooms as number,
            floorArea: property.floor_area_sqm as number,
            lotArea: property.lot_area_sqm as number | undefined,
            propertyType: 'house',
            listingType: 'sale',
            city: property.city as string ?? 'Panglao',
            region: property.province as string ?? 'Bohol',
            address: property.address as string | undefined,
            latitude: property.latitude as number | undefined,
            longitude: property.longitude as number | undefined,
            images: listing.adapted_images ?? (property.image_urls as string[]) ?? [],
            agentName: 'Blue Everest Asset Group',
            agentPhone: '+639542555553',
            agentEmail: 'ceo@blue-everest.com',
          }]);
          const feedResult = await pushFeed(xml);
          result = { success: feedResult.success, error: feedResult.message };
        } else if (portalSlug === 'listglobally') {
          const { createListing } = await import('@/lib/connectors/listglobally');
          const property = listing.properties as Record<string, unknown>;
          const lgResult = await createListing({
            title: listing.adapted_title ?? (property.internal_name as string),
            description: listing.adapted_description ?? '',
            price: (property.price_php_cents as number) / 100,
            currency: 'PHP',
            property_type: 'villa',
            listing_type: 'sale',
            bedrooms: property.bedrooms as number,
            bathrooms: property.bathrooms as number,
            living_area: property.floor_area_sqm as number,
            plot_area: property.lot_area_sqm as number | undefined,
            address: property.address as string ?? '',
            city: property.city as string ?? 'Panglao',
            country: 'Philippines',
            latitude: property.latitude as number | undefined,
            longitude: property.longitude as number | undefined,
            images: listing.adapted_images ?? (property.image_urls as string[]) ?? [],
            contact_name: 'Blue Everest Asset Group',
            contact_phone: '+639542555553',
            contact_email: 'ceo@blue-everest.com',
          });
          result = { success: lgResult.success, externalId: lgResult.data?.id, error: lgResult.error };
        } else if (portalSlug === 'jamesedition') {
          const { submitListing } = await import('@/lib/connectors/jamesedition');
          const property = listing.properties as Record<string, unknown>;
          const jeResult = await submitListing({
            title: listing.adapted_title ?? (property.internal_name as string),
            description: listing.adapted_description ?? '',
            price: Math.round((property.price_php_cents as number) / 100 / 58),
            currency: 'USD',
            bedrooms: property.bedrooms as number,
            bathrooms: property.bathrooms as number,
            living_area_sqm: property.floor_area_sqm as number,
            lot_area_sqm: property.lot_area_sqm as number | undefined,
            location: `${property.city ?? 'Panglao'}, ${property.province ?? 'Bohol'}, Philippines`,
            country: 'Philippines',
            images: listing.adapted_images ?? (property.image_urls as string[]) ?? [],
            property_type: 'villa',
          });
          result = { success: jeResult.success, externalId: jeResult.data?.id, externalUrl: jeResult.data?.url, error: jeResult.error };
        } else {
          result = { success: false, error: `No connector for portal: ${portalSlug}` };
        }
        break;
      }

      case 'playwright': {
        const { submitToPortal } = await import('@/lib/connectors/portal-playwright');
        const property = listing.properties as Record<string, unknown>;
        const pwResult = await submitToPortal(portalSlug, {
          title: listing.adapted_title ?? (property.internal_name as string),
          description: listing.adapted_description ?? '',
          price: (property.price_php_cents as number) / 100,
          currency: 'PHP',
          bedrooms: property.bedrooms as number ?? 4,
          bathrooms: property.bathrooms as number ?? 4,
          floorArea: property.floor_area_sqm as number ?? 263.78,
          city: property.city as string ?? 'Panglao',
          province: property.province as string ?? 'Bohol',
          imagePaths: listing.adapted_images ?? (property.image_urls as string[]) ?? [],
          propertyType: 'villa',
          contactName: 'Blue Everest Asset Group',
          contactPhone: '+639542555553',
          contactEmail: 'ceo@blue-everest.com',
        });
        result = { success: pwResult.success, externalId: pwResult.listingId, externalUrl: pwResult.listingUrl, error: pwResult.error };
        break;
      }

      case 'manual': {
        await supabase.from('portal_listings').update({ status: 'manual_needed' }).eq('id', id);
        result = { success: true, error: 'Manual submission required. Listing content is ready for copy-paste.' };
        break;
      }

      default:
        result = { success: false, error: `Unknown integration method: ${integrationMethod}` };
    }

    // Update listing status
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status: result.success ? 'active' : 'error',
      last_error: result.error ?? null,
      submitted_at: now,
    };
    if (result.success) {
      updateData.published_at = now;
      updateData.status = integrationMethod === 'manual' ? 'manual_needed' : 'active';
    }
    if (result.externalId) updateData.external_listing_id = result.externalId;
    if (result.externalUrl) updateData.external_url = result.externalUrl;

    await supabase.from('portal_listings').update(updateData).eq('id', id);

    // Log the distribution action
    await supabase.from('portal_distribution_logs').insert({
      portal_listing_id: id,
      portal_id: portal.id as string,
      action: 'submit',
      status: result.success ? 'success' : 'error',
      error_message: result.error,
    });

    return Response.json({ success: result.success, result });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
