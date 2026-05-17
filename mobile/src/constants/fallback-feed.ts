import { Platform } from 'react-native';

import type { CommunityPost, AssetKey } from '@/src/types';

export const LOCAL_VIDEO_ASSETS: Record<AssetKey, number> = {
  'pillow-peptalk-1': require('@/assets/videos/pillow-peptalk-1.mp4'),
  'pillow-peptalk-2': require('@/assets/videos/pillow-peptalk-2.mp4'),
  'pillow-peptalk-3': require('@/assets/videos/pillow-peptalk-3.mp4'),
};

export const DEFAULT_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://127.0.0.1:4000';

export function buildFallbackFeed(): CommunityPost[] {
  return [
    {
      id: 'fallback-1',
      author: '@rise.with.mina',
      title: '6:30 AM investor call promise',
      caption: 'Tonight I promised the pillow I would stand up before sunrise. Tomorrow me better listen.',
      wakeTimeLabel: '06:30',
      createdAt: new Date().toISOString(),
      tags: ['#pillow-oath', '#focus'],
      feedbackSummary: 'Soft voice, strong commitment, sleepy but determined.',
      likeCount: 128,
      comments: [
        {
          id: 'fallback-comment-1',
          author: '@sleepcoach',
          body: 'The calm tone makes this challenge feel very real.',
          createdAt: new Date().toISOString(),
          likes: 12,
        },
      ],
      durationSec: 4,
      source: 'fallback',
      isLiked: false,
      isDownloaded: false,
      localAssetKey: 'pillow-peptalk-1',
    },
    {
      id: 'fallback-2',
      author: '@dawn.runner',
      title: '5:45 AM training wake-up vow',
      caption: 'Pillow, if I snooze, please haunt me. Race day is close.',
      wakeTimeLabel: '05:45',
      createdAt: new Date().toISOString(),
      tags: ['#morningrun', '#challenge'],
      feedbackSummary: 'Funny delivery, lots of energy, reels-friendly pacing.',
      likeCount: 204,
      comments: [
        {
          id: 'fallback-comment-2',
          author: '@runnerfriend',
          body: 'This one absolutely deserves a wake-up success badge.',
          createdAt: new Date().toISOString(),
          likes: 19,
        },
      ],
      durationSec: 4,
      source: 'fallback',
      isLiked: false,
      isDownloaded: false,
      localAssetKey: 'pillow-peptalk-2',
    },
    {
      id: 'fallback-3',
      author: '@studio.nightowl',
      title: '8:00 AM client review challenge',
      caption: 'I am negotiating with the pillow so tomorrow I can present without zombie eyes.',
      wakeTimeLabel: '08:00',
      createdAt: new Date().toISOString(),
      tags: ['#designlife', '#bege-shout'],
      feedbackSummary: 'Feels like a playful productivity ritual worth sharing.',
      likeCount: 89,
      comments: [
        {
          id: 'fallback-comment-3',
          author: '@uxpal',
          body: 'A solid example of a challenge post that still feels intimate.',
          createdAt: new Date().toISOString(),
          likes: 7,
        },
      ],
      durationSec: 4,
      source: 'fallback',
      isLiked: false,
      isDownloaded: false,
      localAssetKey: 'pillow-peptalk-3',
    },
  ];
}

export function resolveVideoSource(post: Pick<CommunityPost, 'downloadedUri' | 'localUri' | 'videoUrl' | 'localAssetKey'>) {
  if (post.downloadedUri) {
    return { uri: post.downloadedUri };
  }

  if (post.localUri) {
    return { uri: post.localUri };
  }

  if (post.videoUrl) {
    return { uri: post.videoUrl };
  }

  if (post.localAssetKey) {
    return LOCAL_VIDEO_ASSETS[post.localAssetKey];
  }

  return LOCAL_VIDEO_ASSETS['pillow-peptalk-1'];
}
