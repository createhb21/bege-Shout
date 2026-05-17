import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppScreen, EmptyState, HeroCard, SectionCard, SectionTitle, StatPill } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { formatDateTime } from '@/src/lib/format';

export default function ChallengeScreen() {
  const { t } = useTranslation();
  const { challenges, checkInChallenge, settings, successRate } = useApp();
  const [proofNote, setProofNote] = useState('');

  const sortedChallenges = useMemo(
    () => [...challenges].sort((a, b) => new Date(a.wakeAt).getTime() - new Date(b.wakeAt).getTime()),
    [challenges],
  );
  const nextChallenge = sortedChallenges.find((challenge) => challenge.status === 'scheduled');

  return (
    <AppScreen>
      <HeroCard>
        <SectionTitle eyebrow="WAKE QUEST" title={t('challenge.title')} subtitle={t('challenge.subtitle')} />
        <View style={styles.statRow}>
          <StatPill
            label={t('challenge.nextAlarm')}
            value={nextChallenge ? formatDateTime(nextChallenge.wakeAt, settings.locale) : '--'}
          />
          <StatPill label={t('challenge.successRate')} value={`${successRate}%`} />
        </View>
      </HeroCard>

      <SectionCard>
        <SectionTitle title={t('challenge.active')} subtitle={t('capture.challengeHint')} />
        <TextInput
          value={proofNote}
          onChangeText={setProofNote}
          placeholder={t('challenge.proofPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        {!sortedChallenges.length ? (
          <EmptyState title={t('challenge.active')} body={t('challenge.empty')} />
        ) : (
          sortedChallenges.map((challenge) => {
            const isScheduled = challenge.status === 'scheduled';
            const statusText = isScheduled ? t('status.scheduled') : challenge.status === 'success' ? t('status.success') : t('status.missed');
            return (
              <View key={challenge.id} style={styles.challengeCard}>
                <LinearGradient colors={isScheduled ? theme.gradients.glass : theme.gradients.night} style={StyleSheet.absoluteFill} />
                <View style={styles.challengeTop}>
                  <View style={styles.challengeIcon}>
                    <MaterialCommunityIcons name={challenge.status === 'success' ? 'check-bold' : isScheduled ? 'alarm' : 'close'} size={22} color={theme.colors.text} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.challengeTime}>{formatDateTime(challenge.wakeAt, settings.locale)}</Text>
                    <Text style={styles.challengeStatus}>{statusText}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  disabled={!isScheduled}
                  style={[styles.checkButton, !isScheduled && styles.checkButtonDisabled]}
                  onPress={() => checkInChallenge(challenge.id, proofNote)}>
                  <Text style={styles.checkButtonText}>{t('challenge.checkIn')}</Text>
                </TouchableOpacity>
                {challenge.checkedInAt ? (
                  <Text style={styles.challengeMeta}>
                    {challenge.status === 'success' ? t('challenge.checkInSuccess') : t('challenge.checkInMissed')}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  input: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontWeight: '700',
  },
  challengeCard: {
    borderRadius: 28,
    padding: theme.spacing.md,
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  challengeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  challengeTime: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  challengeStatus: {
    color: theme.colors.textMuted,
    fontWeight: '800',
  },
  checkButton: {
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.42,
  },
  checkButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  challengeMeta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontWeight: '700',
  },
});
