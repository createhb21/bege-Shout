import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppScreen, Badge, HeroCard, PrimaryButton, SectionCard, SectionTitle, StatPill } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { settings, updateLocale, updateSettings, permissions, syncPermissions, recordings, feed, unreadCount, challenges } = useApp();
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl);

  return (
    <AppScreen>
      <HeroCard>
        <SectionTitle eyebrow={settings.communityHandle} title={t('profile.title')} subtitle={t('profile.subtitle')} />
        <View style={styles.statsRow}>
          <StatPill label={t('tabs.history')} value={`${recordings.length}`} />
          <StatPill label={t('tabs.community')} value={`${feed.length}`} />
          <StatPill label={t('profile.unread')} value={`${unreadCount}`} />
        </View>
      </HeroCard>

      <SectionCard>
        <SectionTitle title={t('profile.locale')} subtitle={t('profile.subtitle')} />
        <View style={styles.segmentRow}>
          {(['ko', 'en'] as const).map((locale) => (
            <TouchableOpacity
              key={locale}
              onPress={() => updateLocale(locale)}
              style={[styles.segmentButton, settings.locale === locale && styles.segmentButtonActive]}>
              <Text style={styles.segmentText}>{locale.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <SectionTitle title={t('profile.apiBaseUrl')} subtitle={t('profile.apiHint')} />
        <TextInput value={apiBaseUrl} onChangeText={setApiBaseUrl} style={styles.input} autoCapitalize="none" autoCorrect={false} />
        <PrimaryButton label={t('common.save')} onPress={() => updateSettings({ apiBaseUrl })} />
      </SectionCard>

      <SectionCard>
        <SectionTitle title={t('profile.autoSave')} subtitle={t('capture.saveToLibrary')} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('profile.autoSave')}</Text>
          <Switch value={settings.autoSaveToLibrary} onValueChange={(value) => updateSettings({ autoSaveToLibrary: value })} trackColor={{ true: theme.colors.mint }} />
        </View>
      </SectionCard>


      <SectionCard>
        <SectionTitle title={t('profile.defaultShare')} subtitle={t('profile.defaultShareHint')} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('profile.defaultShare')}</Text>
          <Switch value={settings.defaultShareToCommunity} onValueChange={(value) => updateSettings({ defaultShareToCommunity: value })} trackColor={{ true: theme.colors.accent }} />
        </View>
      </SectionCard>

      <SectionCard>
        <SectionTitle title={t('profile.permissions')} subtitle={t('capture.permissionsBody')} />
        <View style={styles.badgeRow}>
          <Badge label={`Camera · ${t(`status.${permissions.camera}`)}`} tone={permissions.camera === 'granted' ? 'success' : permissions.camera === 'denied' ? 'danger' : 'warning'} />
          <Badge label={`Mic · ${t(`status.${permissions.microphone}`)}`} tone={permissions.microphone === 'granted' ? 'success' : permissions.microphone === 'denied' ? 'danger' : 'warning'} />
          <Badge label={`Library · ${t(`status.${permissions.mediaLibrary}`)}`} tone={permissions.mediaLibrary === 'granted' ? 'success' : permissions.mediaLibrary === 'denied' ? 'danger' : 'warning'} />
          <Badge label={`Push · ${t(`status.${permissions.notifications}`)}`} tone={permissions.notifications === 'granted' ? 'success' : permissions.notifications === 'denied' ? 'danger' : 'warning'} />
        </View>
        <PrimaryButton label={t('profile.syncPermissions')} onPress={() => void syncPermissions()} />
      </SectionCard>

      <SectionCard>
        <SectionTitle title={t('profile.stats')} subtitle={t('common.comingSoon')} />
        <View style={styles.statsRow}>
          <StatPill label={t('tabs.challenge')} value={`${challenges.length}`} />
          <StatPill label={t('tabs.history')} value={`${recordings.length}`} />
        </View>
        <Link href="/notifications" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>{t('notifications.title')}</Text>
          </TouchableOpacity>
        </Link>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentButton: {
    flex: 1,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  segmentText: {
    color: '#fff',
    fontWeight: '800',
  },
  input: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    color: theme.colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchLabel: {
    color: theme.colors.text,
    flex: 1,
    lineHeight: 22,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.backgroundAlt,
  },
  linkText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
});
