// src/lib/connectors/linkedin-organic.ts
// LinkedIn Marketing API v2 connector for organic posting and messaging.

const API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInPostContent {
  text: string;
  imageUrls?: string[];
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

export interface LinkedInPostResult {
  postId: string;
  url: string;
}

export interface LinkedInPostAnalytics {
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
}

function getHeaders(): Record<string, string> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) throw new Error('LINKEDIN_ACCESS_TOKEN not configured');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Restli-Protocol-Version': '2.0.0',
  };
}

function getPersonUrn(): string {
  const urn = process.env.LINKEDIN_PERSON_URN;
  if (!urn) throw new Error('LINKEDIN_PERSON_URN not configured');
  return urn;
}

/**
 * Create an organic post on LinkedIn (personal profile or company page).
 */
export async function createPost(
  content: LinkedInPostContent
): Promise<{ success: boolean; data?: LinkedInPostResult; error?: string }> {
  try {
    const personUrn = getPersonUrn();

    const body: Record<string, unknown> = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text,
          },
          shareMediaCategory: content.imageUrls?.length ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': content.visibility ?? 'PUBLIC',
      },
    };

    const response = await fetch(`${API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const postId = response.headers.get('x-restli-id') ?? '';
    return {
      success: true,
      data: {
        postId,
        url: `https://www.linkedin.com/feed/update/${postId}`,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get analytics for a LinkedIn post.
 */
export async function getPostAnalytics(
  postUrn: string
): Promise<{ success: boolean; data?: LinkedInPostAnalytics; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE}/socialActions/${encodeURIComponent(postUrn)}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const raw = (await response.json()) as Record<string, unknown>;
    return {
      success: true,
      data: {
        impressions: 0,
        clicks: 0,
        likes: (raw.likesSummary as Record<string, number>)?.totalLikes ?? 0,
        comments: (raw.commentsSummary as Record<string, number>)?.totalFirstLevelComments ?? 0,
        shares: 0,
        engagement_rate: 0,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send a LinkedIn InMail/message to a specific recipient.
 * Note: LinkedIn heavily rate-limits messaging. Max ~100/day for outreach.
 */
export async function sendMessage(
  recipientUrn: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const personUrn = getPersonUrn();

    const payload = {
      recipients: [recipientUrn],
      subject,
      body: {
        'com.linkedin.messaging.MessageBody': {
          text: body,
        },
      },
      sender: personUrn,
    };

    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export function isConfigured(): boolean {
  return !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_URN);
}
