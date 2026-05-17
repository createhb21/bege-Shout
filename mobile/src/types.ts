export type LocaleCode = 'en' | 'ko';
export type PermissionState = 'granted' | 'denied' | 'undetermined';
export type AssetKey = 'pillow-peptalk-1' | 'pillow-peptalk-2' | 'pillow-peptalk-3';
export type CommunitySource = 'server' | 'fallback' | 'local-upload';
export type ChallengeStatus = 'scheduled' | 'success' | 'missed';
export type NotificationKind = 'alarm' | 'challenge' | 'community' | 'system';

export interface AppSettings {
  locale: LocaleCode;
  apiBaseUrl: string;
  displayName: string;
  communityHandle: string;
  autoSaveToLibrary: boolean;
  defaultShareToCommunity: boolean;
}

export interface AppPermissions {
  camera: PermissionState;
  microphone: PermissionState;
  mediaLibrary: PermissionState;
  notifications: PermissionState;
}

export interface CommentItem {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  likes: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  caption: string;
  wakeTimeLabel: string;
  createdAt: string;
  tags: string[];
  feedbackSummary: string;
  likeCount: number;
  comments: CommentItem[];
  durationSec: number;
  source: CommunitySource;
  isLiked: boolean;
  isDownloaded: boolean;
  videoUrl?: string;
  downloadedUri?: string;
  localUri?: string;
  localAssetKey?: AssetKey;
}

export interface ShoutRecord {
  id: string;
  note: string;
  wakeAt: string;
  createdAt: string;
  videoUri: string;
  saveToLibrary: boolean;
  savedToLibrary: boolean;
  shareToCommunity: boolean;
  sharedToCommunity: boolean;
  challengeId: string;
  alarmNotificationId?: string;
}

export interface ChallengeRecord {
  id: string;
  shoutId: string;
  wakeAt: string;
  status: ChallengeStatus;
  windowMinutes: number;
  notificationId?: string;
  checkedInAt?: string;
  proofNote?: string;
}

export interface InboxItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  relatedChallengeId?: string;
}

export interface PersistedAppState {
  settings: AppSettings;
  recordings: ShoutRecord[];
  challenges: ChallengeRecord[];
  feed: CommunityPost[];
  inbox: InboxItem[];
}

export interface CreateShoutInput {
  videoUri: string;
  note: string;
  wakeAt: string;
  shareToCommunity: boolean;
  saveToLibrary: boolean;
}
