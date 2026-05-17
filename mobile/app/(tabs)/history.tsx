import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { AppScreen, Badge, EmptyState, HeroCard, SectionTitle, StatPill } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { formatDateGroup, formatDateTime, groupRecordingsByDate } from '@/src/lib/format';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { recordings, settings } = useApp();
  const sharedCount = recordings.filter((recording) => recording.sharedToCommunity).length;

  if (!recordings.length) {
    return (
      <AppScreen>
        <HeroCard>
          <SectionTitle eyebrow="ARCHIVE" title={t('history.title')} subtitle={t('history.subtitle')} />
        </HeroCard>
        <EmptyState title={t('history.title')} body={t('history.empty')} />
      </AppScreen>
    );
  }

  const grouped = Object.entries(groupRecordingsByDate(recordings));

  return (
    <AppScreen>
      <HeroCard>
        <SectionTitle eyebrow="ARCHIVE" title={t('history.title')} subtitle={t('history.subtitle')} />
        <View style={styles.statRow}>
          <StatPill label={t('tabs.history')} value={`${recordings.length}`} />
          <StatPill label={t('history.shared')} value={`${sharedCount}`} />
        </View>
      </HeroCard>

      {grouped.map(([dateKey, items]) => (
        <View key={dateKey} style={styles.group}>
          <View style={styles.groupHeader}>
            <LinearGradient colors={theme.gradients.brand} style={styles.storyDot} />
            <Text style={styles.groupTitle}>{formatDateGroup(items[0].createdAt, settings.locale)}</Text>
          </View>
          {items.map((recording) => (
            <View key={recording.id} style={styles.mediaCard}>
              <VideoPreview source={{ uri: recording.videoUri }} height={360} muted />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.mediaShade} />
              <View style={styles.cardTopRow}>
                <Badge label={formatDateTime(recording.wakeAt, settings.locale)} tone="accent" />
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.statusRow}>
                  {recording.sharedToCommunity ? <Badge label={t('history.shared')} tone="success" /> : null}
                  {recording.savedToLibrary ? <Badge label={t('history.savedToLibrary')} tone="default" /> : null}
                  {recording.alarmNotificationId ? <Badge label={t('history.scheduled')} tone="warning" /> : null}
                </View>
                <View style={styles.noteRow}>
                  <MaterialCommunityIcons name="weather-night" size={18} color={theme.colors.mint} />
                  <Text numberOfLines={2} style={styles.note}>{recording.note}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  group: {
    gap: theme.spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  mediaCard: {
    minHeight: 360,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  mediaShade: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
  },
  cardBottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  note: {
    color: theme.colors.text,
    lineHeight: 21,
    fontWeight: '800',
    flex: 1,
  },
});
