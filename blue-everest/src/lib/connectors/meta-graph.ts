// src/lib/connectors/meta-graph.ts
// Meta Graph API helper for sending messages, replying to comments, and fetching profiles.

const META_API_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export function getPageToken(): string | null {
  return (
    process.env.META_PAGE_ACCESS_TOKEN ??
    process.env.META_ACCESS_TOKEN ??
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN ??
    null
  );
}

export function hasMetaPageToken(): boolean {
  return Boolean(getPageToken());
}

// -------------------------------------------------------------------------
// Messenger conversation history
// -------------------------------------------------------------------------

export interface MetaConversationMessage {
  id: string;
  message: string;
  createdTime: string;
  from?: { id: string; name?: string };
  to?: { data?: Array<{ id: string; name?: string }> };
}

export interface MetaConversation {
  id: string;
  updatedTime?: string;
  participants: Array<{ id: string; name?: string; email?: string }>;
  messages: MetaConversationMessage[];
}

type GraphPaging = {
  paging?: {
    next?: string;
  };
};

async function graphGet<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[meta-graph] GET failed: ${res.status} ${body.slice(0, 500)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn('[meta-graph] GET exception:', err);
    return null;
  }
}

/**
 * Fetch Messenger conversations and recent messages from the connected Page.
 * This is read-only and is used to backfill the CRM from existing Messenger inbox history.
 */
export async function fetchPageConversations(options: {
  limit?: number;
  messageLimit?: number;
  after?: string | null;
} = {}): Promise<{ conversations: MetaConversation[]; next?: string; tokenConfigured: boolean }> {
  const token = getPageToken();
  if (!token) {
    return { conversations: [], tokenConfigured: false };
  }

  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  const messageLimit = Math.min(Math.max(options.messageLimit ?? 30, 1), 100);
  const fields = [
    'id',
    'updated_time',
    'participants.limit(10){id,name,email}',
    `messages.limit(${messageLimit}){id,message,from,to,created_time}`,
  ].join(',');

  const params = new URLSearchParams({
    fields,
    limit: String(limit),
    access_token: token,
  });
  if (options.after) params.set('after', options.after);

  const url = `${BASE_URL}/me/conversations?${params.toString()}`;
  const payload = await graphGet<{
    data?: Array<Record<string, unknown>>;
  } & GraphPaging>(url);

  if (!payload) return { conversations: [], tokenConfigured: true };

  const conversations = (payload.data ?? []).map((row) => {
    const participants = row.participants as { data?: Array<{ id: string; name?: string; email?: string }> } | undefined;
    const messages = row.messages as { data?: Array<Record<string, unknown>> } | undefined;

    return {
      id: String(row.id ?? ''),
      updatedTime: typeof row.updated_time === 'string' ? row.updated_time : undefined,
      participants: participants?.data ?? [],
      messages: (messages?.data ?? []).map((message) => ({
        id: String(message.id ?? ''),
        message: String(message.message ?? ''),
        createdTime: String(message.created_time ?? ''),
        from: message.from as { id: string; name?: string } | undefined,
        to: message.to as { data?: Array<{ id: string; name?: string }> } | undefined,
      })),
    };
  });

  return {
    conversations,
    next: payload.paging?.next,
    tokenConfigured: true,
  };
}

// -------------------------------------------------------------------------
// User profile
// -------------------------------------------------------------------------

export interface MetaUserProfile {
  name: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Fetch a user's basic profile by their page-scoped ID (PSID).
 * Returns null if the token is missing or the API call fails.
 */
export async function getUserProfile(
  userId: string
): Promise<MetaUserProfile | null> {
  const token = getPageToken();
  if (!token) return null;

  try {
    const url = `${BASE_URL}/${userId}?fields=first_name,last_name,name&access_token=${token}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(
        `[meta-graph] getUserProfile(${userId}) failed: ${res.status}`
      );
      return null;
    }

    const data = (await res.json()) as Record<string, string>;
    return {
      name:
        data.name ??
        [data.first_name, data.last_name].filter(Boolean).join(' ') ??
        'Facebook User',
      firstName: data.first_name,
      lastName: data.last_name,
    };
  } catch (err) {
    console.warn('[meta-graph] getUserProfile exception:', err);
    return null;
  }
}

// -------------------------------------------------------------------------
// Send Messenger message
// -------------------------------------------------------------------------

/**
 * Send a text message to a user via Messenger (Page Send API).
 * `recipientId` is the page-scoped user ID (PSID).
 */
export async function sendMessengerMessage(
  recipientId: string,
  text: string
): Promise<boolean> {
  const token = getPageToken();
  if (!token) {
    console.warn('[meta-graph] Cannot send message: no page token');
    return false;
  }

  try {
    const url = `${BASE_URL}/me/messages?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: text.slice(0, 2000) },
        messaging_type: 'RESPONSE',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(
        `[meta-graph] sendMessengerMessage failed: ${res.status} ${body}`
      );
    }

    return res.ok;
  } catch (err) {
    console.warn('[meta-graph] sendMessengerMessage exception:', err);
    return false;
  }
}

// -------------------------------------------------------------------------
// Reply to comment
// -------------------------------------------------------------------------

/**
 * Post a public reply to a comment on a page post.
 */
export async function replyToComment(
  commentId: string,
  text: string
): Promise<boolean> {
  const token = getPageToken();
  if (!token) return false;

  try {
    const url = `${BASE_URL}/${commentId}/comments?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text.slice(0, 8000) }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(
        `[meta-graph] replyToComment failed: ${res.status} ${body}`
      );
    }

    return res.ok;
  } catch (err) {
    console.warn('[meta-graph] replyToComment exception:', err);
    return false;
  }
}

/**
 * Send a private Messenger reply to a user who commented on a post.
 * Only works within 7 days of the comment and once per comment.
 */
export async function sendPrivateReply(
  commentId: string,
  text: string
): Promise<boolean> {
  const token = getPageToken();
  if (!token) return false;

  try {
    const url = `${BASE_URL}/${commentId}/private_replies?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text.slice(0, 2000) }),
    });

    if (!res.ok) {
      const body = await res.text();
      // 368 = "The action attempted has been deemed abusive" (already replied privately)
      // This is expected if we already sent a private reply to this comment
      if (!body.includes('368')) {
        console.warn(
          `[meta-graph] sendPrivateReply failed: ${res.status} ${body}`
        );
      }
    }

    return res.ok;
  } catch (err) {
    console.warn('[meta-graph] sendPrivateReply exception:', err);
    return false;
  }
}
