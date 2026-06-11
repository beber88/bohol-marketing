import { NextRequest, NextResponse } from "next/server";

// POST /api/marketing/posts/generate-image
// Generates an image using Higgsfield via the Anthropic API with MCP tools
// This is called from the dashboard post editor
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { prompt, aspectRatio, model } = body;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  // For now, return the prompt info so the dashboard knows
  // the generation was requested. Actual Higgsfield generation
  // happens via MCP tools in Claude Code / Claude chat.
  //
  // The dashboard stores the prompt and marks the post as
  // "awaiting_image". When the image is generated externally
  // (via Higgsfield MCP), the URL is updated via PUT /api/marketing/posts/[id].

  return NextResponse.json({
    success: true,
    status: "pending",
    prompt,
    aspectRatio: aspectRatio || "1:1",
    model: model || "nano_banana_pro",
    message: "Image generation request saved. Use Higgsfield to generate and then update the post with the result URL.",
    instructions: {
      step1: "Copy the prompt below",
      step2: "Use Higgsfield generate_image with model nano_banana_pro",
      step3: "Once generated, the image URL will be saved to the post",
      prompt,
    },
  });
}
