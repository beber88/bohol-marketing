import type { SupabaseClient } from "@supabase/supabase-js";

export const PANGLAO_PROJECT_SLUG = "panglao-prime-villas";
export const PANGLAO_PROJECT_NAME = "Panglao Prime Villas";

export async function getOrCreatePanglaoProjectId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: existing, error: selectError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", PANGLAO_PROJECT_SLUG)
    .maybeSingle();

  if (selectError) {
    console.warn("[project] Could not fetch Panglao project:", selectError.message);
    return null;
  }

  if (existing?.id) return existing.id as string;

  const { data: created, error: insertError } = await supabase
    .from("projects")
    .insert({
      name: PANGLAO_PROJECT_NAME,
      slug: PANGLAO_PROJECT_SLUG,
      description:
        "Panglao Prime Villas marketing and sales lead system for Blue Everest Asset Group.",
      project_type: "villa_sales",
      status: "active",
      config: {
        website: "https://blue-everest.com/panglao-prime-villas",
        whatsapp_marketing: "+639542555553",
        whatsapp_office: "+639958565865",
      },
    })
    .select("id")
    .single();

  if (insertError) {
    console.warn("[project] Could not create Panglao project:", insertError.message);
    return null;
  }

  return (created?.id as string | undefined) ?? null;
}
