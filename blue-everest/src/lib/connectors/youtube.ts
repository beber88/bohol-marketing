// src/lib/connectors/youtube.ts
// YouTube Data API v3 connector for video management and analytics.

const API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId?: string; // Default: 22 (People & Blogs)
  privacyStatus?: 'public' | 'private' | 'unlisted';
  defaultLanguage?: string;
}

export interface YouTubeVideoResult {
  videoId: string;
  url: string;
  title: string;
  status: string;
}

export interface YouTubeAnalytics {
  views: number;
  likes: number;
  comments: number;
  averageViewDuration: number;
  subscribersGained: number;
}

function getAccessToken(): string {
  const token = process.env.YOUTUBE_ACCESS_TOKEN;
  if (!token) throw new Error('YOUTUBE_ACCESS_TOKEN not configured. Use YOUTUBE_REFRESH_TOKEN to obtain one.');
  return token;
}

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${getAccessToken()}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Update video metadata (title, description, tags) for an existing video.
 */
export async function updateVideoMetadata(
  videoId: string,
  metadata: YouTubeVideoMetadata
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/videos?part=snippet`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        id: videoId,
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: metadata.categoryId ?? '22',
          defaultLanguage: metadata.defaultLanguage ?? 'en',
        },
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get analytics for a specific video.
 */
export async function getVideoAnalytics(
  videoId: string
): Promise<{ success: boolean; data?: YouTubeAnalytics; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE}/videos?part=statistics&id=${videoId}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const result = (await response.json()) as {
      items?: Array<{
        statistics: {
          viewCount: string;
          likeCount: string;
          commentCount: string;
        };
      }>;
    };

    const stats = result.items?.[0]?.statistics;
    if (!stats) {
      return { success: false, error: 'Video not found' };
    }

    return {
      success: true,
      data: {
        views: parseInt(stats.viewCount, 10),
        likes: parseInt(stats.likeCount, 10),
        comments: parseInt(stats.commentCount, 10),
        averageViewDuration: 0,
        subscribersGained: 0,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get channel-level statistics.
 */
export async function getChannelStats(): Promise<{
  success: boolean;
  data?: { subscribers: number; totalViews: number; videoCount: number };
  error?: string;
}> {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return { success: false, error: 'YOUTUBE_CHANNEL_ID not configured' };
    }

    const response = await fetch(
      `${API_BASE}/channels?part=statistics&id=${channelId}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const result = (await response.json()) as {
      items?: Array<{
        statistics: {
          subscriberCount: string;
          viewCount: string;
          videoCount: string;
        };
      }>;
    };

    const stats = result.items?.[0]?.statistics;
    if (!stats) {
      return { success: false, error: 'Channel not found' };
    }

    return {
      success: true,
      data: {
        subscribers: parseInt(stats.subscriberCount, 10),
        totalViews: parseInt(stats.viewCount, 10),
        videoCount: parseInt(stats.videoCount, 10),
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * List recent videos from the channel.
 */
export async function listVideos(maxResults = 10): Promise<{
  success: boolean;
  videos?: YouTubeVideoResult[];
  error?: string;
}> {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return { success: false, error: 'YOUTUBE_CHANNEL_ID not configured' };
    }

    const response = await fetch(
      `${API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
    }

    const result = (await response.json()) as {
      items?: Array<{
        id: { videoId: string };
        snippet: { title: string; publishedAt: string };
      }>;
    };

    const videos = (result.items ?? []).map((item) => ({
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
      status: 'published',
    }));

    return { success: true, videos };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export function isConfigured(): boolean {
  return !!(process.env.YOUTUBE_ACCESS_TOKEN || process.env.YOUTUBE_REFRESH_TOKEN);
}
