import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppScreen, EmptyState, HeroCard, PrimaryButton, SectionCard, SectionTitle, StatPill } from '@/src/components/ui';
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
        <SectionTitle title={t('challenge.title')} subtitle={t('challenge.subtitle')} />
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
          sortedChallenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={{ gap: 6 }}>
                <Text style={styles.challengeTime}>{formatDateTime(challenge.wakeAt, settings.locale)}</Text>
                <Text style={styles.challengeStatus}>
                  {challenge.status === 'scheduled'
                    ? t('status.scheduled')
                    : challenge.status === 'success'
                      ? t('status.success')
                      : t('status.missed')}
                </Text>
              </View>
              <PrimaryButton label={t('challenge.checkIn')} onPress={() => checkInChallenge(challenge.id, proofNote)} disabled={challenge.status !== 'scheduled'} />
              {challenge.checkedInAt ? (
                <Text style={styles.challengeMeta}>
                  {challenge.status === 'success' ? t('challenge.checkInSuccess') : t('challenge.checkInMissed')}
                </Text>
              ) : null}
            </View>
          ))
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
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    color: theme.colors.text,
  },
  challengeCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundAlt,
    padding: theme.spacing.md,
    gap: 12,
  },
  challengeTime: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  challengeStatus: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  challengeMeta: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
