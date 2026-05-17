import type { ChallengeRecord, LocaleCode, PermissionState, ShoutRecord } from '@/src/types';

export function buildId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDateTime(value: string, locale: LocaleCode) {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateGroup(value: string, locale: LocaleCode) {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(value));
}

export function formatTimeOnly(value: string, locale: LocaleCode) {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function groupRecordingsByDate(recordings: ShoutRecord[]) {
  return recordings.reduce<Record<string, ShoutRecord[]>>((acc, recording) => {
    const key = recording.createdAt.slice(0, 10);
    acc[key] = acc[key] ? [...acc[key], recording] : [recording];
    return acc;
  }, {});
}

export function isWithinChallengeWindow(wakeAt: string, checkedAt: string, windowMinutes: number) {
  const wakeMs = new Date(wakeAt).getTime();
  const checkedMs = new Date(checkedAt).getTime();
  return checkedMs >= wakeMs && checkedMs <= wakeMs + windowMinutes * 60 * 1000;
}

export function reconcileChallenge(challenge: ChallengeRecord): ChallengeRecord {
  if (challenge.status !== 'scheduled') {
    return challenge;
  }

  const now = Date.now();
  const deadline = new Date(challenge.wakeAt).getTime() + challenge.windowMinutes * 60 * 1000;

  if (now > deadline) {
    return {
      ...challenge,
      status: 'missed',
    };
  }

  return challenge;
}

export function computeSuccessRate(challenges: ChallengeRecord[]) {
  const settled = challenges.filter((challenge) => challenge.status !== 'scheduled');
  if (!settled.length) {
    return 0;
  }

  const successCount = settled.filter((challenge) => challenge.status === 'success').length;
  return Math.round((successCount / settled.length) * 100);
}

export function statusToTone(status: PermissionState) {
  switch (status) {
    case 'granted':
      return 'success';
    case 'denied':
      return 'danger';
    default:
      return 'warning';
  }
}

export function buildDefaultWakeDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(7, 30, 0, 0);
  return date;
}
