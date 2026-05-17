import type { CommentItem, CommunityPost } from '@/src/types';

type ServerComment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

type ServerPost = {
  id: string;
  authorName: string;
  caption: string;
  location?: string;
  tags: string[];
  videoUrl: string;
  likes: number;
  comments: ServerComment[];
  createdAt: string;
};

async function requestJson<T>(baseUrl: string, path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function normalizeComment(comment: Partial<CommentItem> | Partial<ServerComment>): CommentItem {
  const communityComment = comment as Partial<CommentItem>;
  const serverComment = comment as Partial<ServerComment>;

  return {
    id: comment.id ?? `comment-${Date.now()}`,
    author: communityComment.author ?? `@${serverComment.authorName ?? 'community'}`,
    body: communityComment.body ?? serverComment.text ?? '',
    createdAt: comment.createdAt ?? new Date().toISOString(),
    likes: communityComment.likes ?? 0,
  };
}

function normalizePost(baseUrl: string, post: Partial<CommunityPost> | Partial<ServerPost>): CommunityPost {
  const communityPost = post as Partial<CommunityPost>;
  const serverPost = post as Partial<ServerPost>;
  const rawVideoUrl = communityPost.videoUrl ?? serverPost.videoUrl;
  const normalizedVideoUrl =
    typeof rawVideoUrl === 'string' && rawVideoUrl.startsWith('http')
      ? rawVideoUrl
      : rawVideoUrl
        ? `${baseUrl}${rawVideoUrl}`
        : undefined;
  const caption = communityPost.caption ?? serverPost.caption ?? '';
  const title = communityPost.title ?? caption.split('.').at(0) ?? 'Bege shout';
  const wakeTimeLabel =
    communityPost.wakeTimeLabel
      ? communityPost.wakeTimeLabel
      : new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(post.createdAt ?? Date.now()));

  return {
    id: post.id ?? `post-${Date.now()}`,
    author: communityPost.author ?? `@${serverPost.authorName ?? 'bege'}`,
    title,
    caption,
    wakeTimeLabel,
    createdAt: post.createdAt ?? new Date().toISOString(),
    tags: (post.tags ?? ['#bege-shout']).map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)),
    feedbackSummary:
      communityPost.feedbackSummary
        ? communityPost.feedbackSummary
        : `${serverPost.location ? `${serverPost.location} · ` : ''}Local prototype feed post`,
    likeCount: communityPost.likeCount ?? serverPost.likes ?? 0,
    comments: (post.comments ?? []).map(normalizeComment),
    durationSec: communityPost.durationSec ?? 0,
    source: communityPost.source ?? 'server',
    isLiked: communityPost.isLiked ?? false,
    isDownloaded: communityPost.isDownloaded ?? false,
    videoUrl: normalizedVideoUrl,
    downloadedUri: communityPost.downloadedUri,
    localUri: communityPost.localUri,
    localAssetKey: communityPost.localAssetKey,
  };
}

export async function fetchFeed(baseUrl: string) {
  const data = await requestJson<{ posts: ServerPost[] }>(baseUrl, '/api/feed/posts');
  return data.posts.map((post) => normalizePost(baseUrl, post));
}

export async function toggleLikeRequest(baseUrl: string, postId: string) {
  return requestJson<{ post: CommunityPost }>(baseUrl, `/api/feed/posts/${postId}/like`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function createCommentRequest(baseUrl: string, postId: string, author: string, body: string) {
  return requestJson<{ post: CommunityPost }>(baseUrl, `/api/feed/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ authorName: author.replace(/^@/, ''), text: body }),
  });
}

export async function uploadShoutRequest(
  baseUrl: string,
  payload: {
    videoUri: string;
    caption: string;
    author: string;
  },
) {
  const formData = new FormData();
  formData.append('video', {
    uri: payload.videoUri,
    name: `bege-shout-${Date.now()}.mp4`,
    type: 'video/mp4',
  } as never);
  formData.append('caption', payload.caption);
  formData.append('authorName', payload.author.replace(/^@/, ''));

  const response = await fetch(`${baseUrl}/api/shouts/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const data = (await response.json()) as { post: ServerPost };
  return normalizePost(baseUrl, data.post);
}
