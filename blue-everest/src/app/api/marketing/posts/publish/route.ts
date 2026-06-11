// POST /api/marketing/posts/publish
// Auto-publishes a post to the Blue Everest Facebook Page via Graph API

import { quickValidate } from "@/lib/agents/brand-guard";

const PAGE_ID = "1091251924067685";

function detectLanguage(message: string): "en" | "he" | "tl" {
  const compactLength = message.replace(/\s/g, "").length || 1;
  const heCount = (message.match(/[\u0590-\u05FF]/g) || []).length;
  if (heCount / compactLength > 0.15) return "he";
  return "en";
}

function inferMarket(message: string): "IL" | "PH" | "INTL" {
  if (/[\u0590-\u05FF]/.test(message)) {
    return "IL";
  }
  if (/BDO|\bPHP\b|פיליפ/i.test(message)) return "PH";
  return "INTL";
}

export async function POST(request: Request) {
  const body = await request.json();
  const { postId, message, imageUrl, market, language, forcePublish } = body as {
    postId: string;
    message: string;
    imageUrl?: string;
    market?: "IL" | "PH" | "INTL";
    language?: "en" | "he" | "tl";
    forcePublish?: boolean;
  };

  if (!message?.trim()) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const detectedLanguage = language ?? detectLanguage(message);
  const detectedMarket = market ?? inferMarket(message);

  // HARD RULE: Hebrew content NEVER goes to the business page.
  // Hebrew posts go to Facebook Groups (manual) and Meta Ads only.
  if (detectedLanguage === "he") {
    return Response.json({
      postId,
      success: false,
      error: "Hebrew content cannot be published to the business page. Hebrew posts go to Facebook Groups and Meta Ads only.",
      market: detectedMarket,
      language: detectedLanguage,
      route: "groups_and_ads_only",
    }, { status: 422 });
  }

  const brandCheck = quickValidate(message, detectedLanguage, detectedMarket);
  const blocks = brandCheck.violations.length > 0 || !brandCheck.passed;

  if (blocks && !forcePublish) {
    return Response.json(
      {
        postId,
        success: false,
        error: "Brand Guard blocked publish",
        market: detectedMarket,
        language: detectedLanguage,
        brandCheck,
      },
      { status: 422 }
    );
  }

  const userToken =
    process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!userToken) {
    return Response.json({ error: "No Meta access token configured" }, { status: 500 });
  }

  // Get page-specific token
  let pageToken = userToken;
  try {
    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${userToken}`
    );
    const accountsData = await accountsRes.json();
    const page = accountsData.data?.find((p: { id: string }) => p.id === PAGE_ID);
    if (page?.access_token) {
      pageToken = page.access_token;
    }
  } catch {
    // Use user token as fallback
  }

  try {
    let fbPostId: string | null = null;

    // Always include the website link so clicking the post opens the site
    const siteUrl = "https://blue-everest.com/panglao-prime-villas";
    const messageWithLink = `${message}\n\n${siteUrl}`;

    // Resolve relative image paths (e.g. /images/exterior/hero.webp) to absolute URLs
    let resolvedImageUrl = imageUrl;
    if (resolvedImageUrl && !resolvedImageUrl.startsWith("http")) {
      const origin = new URL(request.url).origin;
      resolvedImageUrl = `${origin}${resolvedImageUrl.startsWith("/") ? "" : "/"}${resolvedImageUrl}`;
    }

    if (resolvedImageUrl) {
      // Post with image + link
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${PAGE_ID}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: resolvedImageUrl,
            message: messageWithLink,
            access_token: pageToken,
          }),
        }
      );
      const data = await res.json();
      if (data.id) {
        fbPostId = data.id;
      } else {
        return Response.json({
          postId,
          success: false,
          error: data.error?.message || "Failed to publish with image",
        });
      }
    } else {
      // Text + link post (link preview will appear)
      const formData = new FormData();
      formData.append("message", messageWithLink);
      formData.append("link", siteUrl);
      formData.append("access_token", pageToken);

      const res = await fetch(
        `https://graph.facebook.com/v21.0/${PAGE_ID}/feed`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.id) {
        fbPostId = data.id;
      } else {
        return Response.json({
          postId,
          success: false,
          error: data.error?.message || "Failed to publish",
        });
      }
    }

    return Response.json({
      postId,
      success: true,
      fb_post_id: fbPostId,
      published_at: new Date().toISOString(),
      brandCheck,
    });
  } catch (err) {
    return Response.json({
      postId,
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    });
  }
}
