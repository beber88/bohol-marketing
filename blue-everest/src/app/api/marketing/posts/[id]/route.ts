import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/connectors/supabase";

// PUT /api/marketing/posts/[id] - Update a post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image, primaryText, headlines, status, notes, imagePrompt, generatedImageUrl } = body;

  // Try Supabase first
  const supabase = createSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("content_pieces")
        .upsert({
          id,
          image_url: generatedImageUrl || image,
          body_text: primaryText,
          headlines: headlines || [],
          status: status || "draft",
          notes: notes || null,
          image_prompt: imagePrompt || null,
          generated_image_url: generatedImageUrl || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.warn("[posts/update] Supabase error, falling back to local:", error.message);
      } else {
        return NextResponse.json({ success: true, post: data });
      }
    } catch (err) {
      console.warn("[posts/update] Supabase unavailable, falling back to local");
    }
  }

  // Fallback: persist to a local JSON file for development
  const fs = await import("fs/promises");
  const path = await import("path");
  const filePath = path.resolve(process.cwd(), "data", "post-edits.json");

  let edits: Record<string, unknown> = {};
  try {
    const existing = await fs.readFile(filePath, "utf-8");
    edits = JSON.parse(existing);
  } catch {
    // File doesn't exist yet
  }

  edits[id] = {
    image: generatedImageUrl || image,
    primaryText,
    headlines,
    status,
    notes,
    imagePrompt,
    generatedImageUrl,
    updatedAt: new Date().toISOString(),
  };

  // Ensure data directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(edits, null, 2), "utf-8");

  return NextResponse.json({ success: true, storage: "local" });
}

// GET /api/marketing/posts/[id] - Get saved edits for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try Supabase
  const supabase = createSupabaseAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("content_pieces")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        return NextResponse.json({ post: data });
      }
    } catch {
      // Fall through to local
    }
  }

  // Fallback: local file
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.resolve(process.cwd(), "data", "post-edits.json");
    const content = await fs.readFile(filePath, "utf-8");
    const edits = JSON.parse(content);
    if (edits[id]) {
      return NextResponse.json({ post: edits[id] });
    }
  } catch {
    // No edits saved
  }

  return NextResponse.json({ post: null });
}
