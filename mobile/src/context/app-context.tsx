import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Directory, File, Paths } from 'expo-file-system';
import { getLocales } from 'expo-localization';

import i18n from '@/src/i18n';
import { buildFallbackFeed, DEFAULT_API_BASE_URL } from '@/src/constants/fallback-feed';
import { createCommentRequest, fetchFeed, toggleLikeRequest, uploadShoutRequest } from '@/src/lib/api';
import { buildDefaultWakeDate, buildId, computeSuccessRate, formatTimeOnly, isWithinChallengeWindow, reconcileChallenge } from '@/src/lib/format';
import { scheduleWakeNotification } from '@/src/lib/notifications';
import { loadPersistedState, savePersistedState } from '@/src/lib/storage';
import type {
  AppPermissions,
  AppSettings,
  ChallengeRecord,
  CommunityPost,
  CreateShoutInput,
  InboxItem,
  LocaleCode,
  PersistedAppState,
  ShoutRecord,
} from '@/src/types';

const defaultLocale: LocaleCode = getLocales()[0]?.languageCode === 'ko' ? 'ko' : 'en';

const defaultSettings: AppSettings = {
  locale: defaultLocale,
  apiBaseUrl: DEFAULT_API_BASE_URL,
  displayName: defaultLocale === 'ko' ? '내일의 나' : 'Tomorrow Me',
  communityHandle: '@pillowhero',
  autoSaveToLibrary: true,
  defaultShareToCommunity: false,
};

const defaultPermissions: AppPermissions = {
  camera: 'undetermined',
  microphone: 'undetermined',
  mediaLibrary: 'undetermined',
  notifications: 'undetermined',
};

type AppContextValue = {
  hydrated: boolean;
  serverMode: 'server' | 'fallback';
  isRefreshingFeed: boolean;
  settings: AppSettings;
  permissions: AppPermissions;
  recordings: ShoutRecord[];
  challenges: ChallengeRecord[];
  feed: CommunityPost[];
  inbox: InboxItem[];
  unreadCount: number;
  successRate: number;
  requestAllPermissions: () => Promise<void>;
  syncPermissions: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateLocale: (locale: LocaleCode) => void;
  saveShout: (input: CreateShoutInput) => Promise<void>;
  refreshFeed: () => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, body: string) => Promise<void>;
  downloadPost: (postId: string) => Promise<void>;
  checkInChallenge: (challengeId: string, proofNote?: string) => void;
  markNotificationRead: (notificationId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function buildLocalUploadPost(settings: AppSettings, input: CreateShoutInput): CommunityPost {
  return {
    id: buildId('local-upload'),
    author: settings.communityHandle,
    title: `Wake-up promise · ${formatTimeOnly(input.wakeAt, settings.locale)}`,
    caption: input.note,
    wakeTimeLabel: formatTimeOnly(input.wakeAt, settings.locale),
    createdAt: new Date().toISOString(),
    tags: ['#bege-shout', '#local-upload'],
    feedbackSummary: 'Saved locally until the prototype server is available.',
    likeCount: 0,
    comments: [],
    durationSec: 0,
    source: 'local-upload',
    isLiked: false,
    isDownloaded: true,
    localUri: input.videoUri,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [serverMode, setServerMode] = useState<'server' | 'fallback'>('fallback');
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [permissions, setPermissions] = useState<AppPermissions>(defaultPermissions);
  const [recordings, setRecordings] = useState<ShoutRecord[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);
  const [feed, setFeed] = useState<CommunityPost[]>(buildFallbackFeed());
  const [inbox, setInbox] = useState<InboxItem[]>([]);

  const addInboxItem = useCallback((item: InboxItem) => {
    setInbox((current) => [item, ...current].slice(0, 60));
  }, []);

  const syncPermissions = useCallback(async () => {
    const [cameraPermission, microphonePermission, mediaLibraryPermission, notificationsPermission] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      Camera.getMicrophonePermissionsAsync(),
      MediaLibrary.getPermissionsAsync(),
      Notifications.getPermissionsAsync(),
    ]);

    setPermissions({
      camera: cameraPermission.status,
      microphone: microphonePermission.status,
      mediaLibrary: mediaLibraryPermission.status,
      notifications: notificationsPermission.status,
    });
  }, []);

  const requestAllPermissions = useCallback(async () => {
    await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Camera.requestMicrophonePermissionsAsync(),
      MediaLibrary.requestPermissionsAsync(),
      Notifications.requestPermissionsAsync(),
    ]);
    await syncPermissions();
  }, [syncPermissions]);

  const refreshFeed = useCallback(async () => {
    setIsRefreshingFeed(true);
    try {
      const posts = await fetchFeed(settings.apiBaseUrl);
      setFeed((current) =>
        posts.map((post) => {
          const existing = current.find((item) => item.id === post.id);
          return {
            ...post,
            isLiked: existing?.isLiked ?? post.isLiked,
            isDownloaded: existing?.isDownloaded ?? post.isDownloaded,
            downloadedUri: existing?.downloadedUri ?? post.downloadedUri,
          };
        }),
      );
      setServerMode('server');
    } catch {
      setFeed((current) => {
        const fallback = buildFallbackFeed();
        return fallback.map((post) => {
          const existing = current.find((item) => item.id === post.id);
          return {
            ...post,
            isLiked: existing?.isLiked ?? false,
            isDownloaded: existing?.isDownloaded ?? false,
            downloadedUri: existing?.downloadedUri,
          };
        });
      });
      setServerMode('fallback');
    } finally {
      setIsRefreshingFeed(false);
    }
  }, [settings.apiBaseUrl]);

  useEffect(() => {
    const hydrate = async () => {
      const state = await loadPersistedState();
      if (state) {
        setSettings({ ...defaultSettings, ...state.settings });
        setRecordings(state.recordings);
        setChallenges(state.challenges.map(reconcileChallenge));
        setFeed(state.feed.length ? state.feed : buildFallbackFeed());
        setInbox(state.inbox);
      }
      await syncPermissions();
      setHydrated(true);
    };

    void hydrate();
  }, [syncPermissions]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void i18n.changeLanguage(settings.locale);
  }, [hydrated, settings.locale]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void refreshFeed();
  }, [hydrated, refreshFeed]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const persisted: PersistedAppState = {
      settings,
      recordings,
      challenges,
      feed,
      inbox,
    };

    void savePersistedState(persisted);
  }, [hydrated, settings, recordings, challenges, feed, inbox]);

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      addInboxItem({
        id: buildId('notification'),
        kind: 'alarm',
        title: notification.request.content.title ?? 'Bege Shout',
        body: notification.request.content.body ?? '',
        createdAt: new Date().toISOString(),
        read: false,
      });
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      addInboxItem({
        id: buildId('notification-response'),
        kind: 'challenge',
        title: response.notification.request.content.title ?? 'Wake challenge opened',
        body: response.notification.request.content.body ?? '',
        createdAt: new Date().toISOString(),
        read: false,
      });
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [addInboxItem]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const updateLocale = useCallback((locale: LocaleCode) => {
    setSettings((current) => ({ ...current, locale }));
  }, []);

  const saveShout = useCallback(
    async (input: CreateShoutInput) => {
      let savedToLibrary = false;
      if (input.saveToLibrary) {
        try {
          await MediaLibrary.saveToLibraryAsync(input.videoUri);
          savedToLibrary = true;
        } catch {
          savedToLibrary = false;
        }
      }

      const notificationId = await scheduleWakeNotification(input.wakeAt, input.note);
      const challengeId = buildId('challenge');
      const shoutId = buildId('shout');
      const challenge: ChallengeRecord = {
        id: challengeId,
        shoutId,
        wakeAt: input.wakeAt,
        status: 'scheduled',
        windowMinutes: 10,
        notificationId: notificationId ?? undefined,
      };
      const recording: ShoutRecord = {
        id: shoutId,
        note: input.note,
        wakeAt: input.wakeAt,
        createdAt: new Date().toISOString(),
        videoUri: input.videoUri,
        saveToLibrary: input.saveToLibrary,
        savedToLibrary,
        shareToCommunity: input.shareToCommunity,
        sharedToCommunity: false,
        challengeId,
        alarmNotificationId: notificationId ?? undefined,
      };

      setChallenges((current) => [challenge, ...current]);
      setRecordings((current) => [recording, ...current]);
      addInboxItem({
        id: buildId('inbox'),
        kind: 'system',
        title: 'Wake challenge scheduled',
        body: `Your shout is locked in for ${formatTimeOnly(input.wakeAt, settings.locale)}.`,
        createdAt: new Date().toISOString(),
        read: false,
        relatedChallengeId: challengeId,
      });

      if (!input.shareToCommunity) {
        return;
      }

      const localPost = buildLocalUploadPost(settings, input);
      setFeed((current) => [localPost, ...current]);

      try {
        const uploadedPost = await uploadShoutRequest(settings.apiBaseUrl, {
          videoUri: input.videoUri,
          caption: input.note,
          author: settings.communityHandle,
        });

        setFeed((current) => [uploadedPost, ...current.filter((post) => post.id !== localPost.id)]);
        setRecordings((current) =>
          current.map((record) => (record.id === shoutId ? { ...record, sharedToCommunity: true } : record)),
        );
        addInboxItem({
          id: buildId('community'),
          kind: 'community',
          title: 'Shared to community',
          body: 'Your shout is now visible in the community feed.',
          createdAt: new Date().toISOString(),
          read: false,
        });
      } catch {
        addInboxItem({
          id: buildId('community-fallback'),
          kind: 'community',
          title: 'Shared locally only',
          body: 'The local server was unreachable, so the shout stays in offline fallback mode for now.',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    },
    [addInboxItem, settings],
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      let nextLiked = false;
      setFeed((current) =>
        current.map((post) => {
          if (post.id !== postId) {
            return post;
          }
          nextLiked = !post.isLiked;
          return {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.likeCount + (post.isLiked ? -1 : 1),
          };
        }),
      );

      if (serverMode === 'server') {
        try {
          await toggleLikeRequest(settings.apiBaseUrl, postId);
        } catch {
          setFeed((current) =>
            current.map((post) =>
              post.id === postId
                ? { ...post, isLiked: !nextLiked, likeCount: post.likeCount + (nextLiked ? -1 : 1) }
                : post,
            ),
          );
        }
      }
    },
    [serverMode, settings.apiBaseUrl],
  );

  const addComment = useCallback(
    async (postId: string, body: string) => {
      const comment = {
        id: buildId('comment'),
        author: settings.communityHandle,
        body,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      setFeed((current) =>
        current.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, comment] } : post)),
      );

      if (serverMode === 'server') {
        try {
          await createCommentRequest(settings.apiBaseUrl, postId, settings.communityHandle, body);
        } catch {
          // Keep the optimistic comment for the local-first prototype.
        }
      }
    },
    [serverMode, settings.apiBaseUrl, settings.communityHandle],
  );

  const downloadPost = useCallback(async (postId: string) => {
    const targetPost = feed.find((post) => post.id === postId);
    if (!targetPost) {
      return;
    }

    if (!targetPost.videoUrl) {
      setFeed((current) => current.map((post) => (post.id === postId ? { ...post, isDownloaded: true } : post)));
      return;
    }

    const downloadsDirectory = new Directory(Paths.document, 'downloads');
    if (!downloadsDirectory.exists) {
      downloadsDirectory.create({ idempotent: true, intermediates: true });
    }

    const destination = new File(downloadsDirectory, `${postId}.mp4`);
    if (destination.exists) {
      destination.delete();
    }

    const file = await File.downloadFileAsync(targetPost.videoUrl, destination);
    setFeed((current) =>
      current.map((post) => (post.id === postId ? { ...post, isDownloaded: true, downloadedUri: file.uri } : post)),
    );
    addInboxItem({
      id: buildId('download'),
      kind: 'system',
      title: 'Offline video ready',
      body: 'The community reel is now saved for offline replay.',
      createdAt: new Date().toISOString(),
      read: false,
    });
  }, [addInboxItem, feed]);

  const checkInChallenge = useCallback(
    (challengeId: string, proofNote = '') => {
      const checkedInAt = new Date().toISOString();
      let wasSuccessful = false;
      setChallenges((current) =>
        current.map((challenge) => {
          if (challenge.id !== challengeId) {
            return challenge;
          }
          wasSuccessful = isWithinChallengeWindow(challenge.wakeAt, checkedInAt, challenge.windowMinutes);
          return {
            ...challenge,
            checkedInAt,
            proofNote,
            status: wasSuccessful ? 'success' : 'missed',
          };
        }),
      );
      addInboxItem({
        id: buildId('check-in'),
        kind: 'challenge',
        title: wasSuccessful ? 'Challenge success' : 'Challenge logged late',
        body: wasSuccessful
          ? 'You checked in inside the target wake-up window.'
          : 'You checked in after the grace window, but the attempt was recorded.',
        createdAt: checkedInAt,
        read: false,
        relatedChallengeId: challengeId,
      });
    },
    [addInboxItem],
  );

  const markNotificationRead = useCallback((notificationId: string) => {
    setInbox((current) => current.map((item) => (item.id === notificationId ? { ...item, read: true } : item)));
  }, []);

  const unreadCount = useMemo(() => inbox.filter((item) => !item.read).length, [inbox]);
  const successRate = useMemo(() => computeSuccessRate(challenges), [challenges]);

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      serverMode,
      isRefreshingFeed,
      settings,
      permissions,
      recordings,
      challenges,
      feed,
      inbox,
      unreadCount,
      successRate,
      requestAllPermissions,
      syncPermissions,
      updateSettings,
      updateLocale,
      saveShout,
      refreshFeed,
      toggleLike,
      addComment,
      downloadPost,
      checkInChallenge,
      markNotificationRead,
    }),
    [
      hydrated,
      serverMode,
      isRefreshingFeed,
      settings,
      permissions,
      recordings,
      challenges,
      feed,
      inbox,
      unreadCount,
      successRate,
      requestAllPermissions,
      syncPermissions,
      updateSettings,
      updateLocale,
      saveShout,
      refreshFeed,
      toggleLike,
      addComment,
      downloadPost,
      checkInChallenge,
      markNotificationRead,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }

  return context;
}
