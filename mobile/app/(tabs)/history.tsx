import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { AppScreen, Badge, EmptyState, HeroCard, SectionCard, SectionTitle } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { formatDateGroup, formatDateTime, groupRecordingsByDate } from '@/src/lib/format';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { recordings, settings } = useApp();

  if (!recordings.length) {
    return (
      <AppScreen>
        <HeroCard>
          <SectionTitle title={t('history.title')} subtitle={t('history.subtitle')} />
        </HeroCard>
        <EmptyState title={t('history.title')} body={t('history.empty')} />
      </AppScreen>
    );
  }

  const grouped = Object.entries(groupRecordingsByDate(recordings));

  return (
    <AppScreen>
      <HeroCard>
        <SectionTitle title={t('history.title')} subtitle={t('history.subtitle')} />
      </HeroCard>
      {grouped.map(([dateKey, items]) => (
        <View key={dateKey} style={styles.group}>
          <Text style={styles.groupTitle}>{formatDateGroup(items[0].createdAt, settings.locale)}</Text>
          {items.map((recording) => (
            <SectionCard key={recording.id}>
              <VideoPreview source={{ uri: recording.videoUri }} height={260} muted />
              <View style={styles.rowWrap}>
                <Badge label={formatDateTime(recording.wakeAt, settings.locale)} tone="accent" />
                {recording.sharedToCommunity ? <Badge label={t('history.shared')} tone="success" /> : null}
                {recording.savedToLibrary ? <Badge label={t('history.savedToLibrary')} tone="default" /> : null}
                {recording.alarmNotificationId ? <Badge label={t('history.scheduled')} tone="warning" /> : null}
              </View>
              <Text style={styles.note}>{recording.note}</Text>
            </SectionCard>
          ))}
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: theme.spacing.md,
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  note: {
    color: theme.colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
});
