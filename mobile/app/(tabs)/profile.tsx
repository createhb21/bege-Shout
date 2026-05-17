import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppScreen, Badge, PrimaryButton, SectionCard, SectionTitle, StatPill } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { settings, updateLocale, updateSettings, permissions, syncPermissions, recordings, feed, unreadCount, challenges } = useApp();
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl);

  return (
    <AppScreen>
      <LinearGradient colors={theme.gradients.aurora} style={styles.profileHero}>
        <View style={styles.heroScrim}>
          <View style={styles.identityRow}>
            <LinearGradient colors={theme.gradients.brand} style={styles.avatarRing}>
              <View style={styles.avatarCore}>
                <Text style={styles.avatarText}>{settings.communityHandle.replace('@', '').slice(0, 1).toUpperCase()}</Text>
              </View>
            </LinearGradient>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.handle}>{settings.communityHandle}</Text>
              <Text style={styles.bio}>{t('profile.subtitle')}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <StatPill label={t('tabs.history')} value={`${recordings.length}`} />
            <StatPill label={t('tabs.community')} value={`${feed.length}`} />
            <StatPill label={t('profile.unread')} value={`${unreadCount}`} />
          </View>
        </View>
      </LinearGradient>

      <SectionCard>
        <SectionTitle eyebrow="PROFILE" title={t('profile.locale')} subtitle={t('profile.subtitle')} />
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
        <SectionTitle eyebrow="CAPTURE DEFAULTS" title={t('profile.autoSave')} subtitle={t('profile.defaultShareHint')} />
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}><MaterialCommunityIcons name="image-multiple-outline" size={20} color={theme.colors.mint} /></View>
          <Text style={styles.switchLabel}>{t('profile.autoSave')}</Text>
          <Switch value={settings.autoSaveToLibrary} onValueChange={(value) => updateSettings({ autoSaveToLibrary: value })} trackColor={{ true: theme.colors.mint }} />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}><MaterialCommunityIcons name="share-variant-outline" size={20} color={theme.colors.accent} /></View>
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
            <MaterialCommunityIcons name="bell-outline" size={19} color={theme.colors.text} />
            <Text style={styles.linkText}>{t('notifications.title')}</Text>
          </TouchableOpacity>
        </Link>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  heroScrim: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.36)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    padding: 3,
  },
  avatarCore: {
    flex: 1,
    borderRadius: 38,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  handle: {
    color: theme.colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  bio: {
    color: 'rgba(255,255,255,0.76)',
    lineHeight: 20,
    fontWeight: '700',
  },
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
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  segmentText: {
    color: '#fff',
    fontWeight: '900',
  },
  input: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontWeight: '700',
  },
  settingRow: {
    minHeight: 56,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  switchLabel: {
    color: theme.colors.text,
    flex: 1,
    lineHeight: 22,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    gap: 8,
  },
  linkText: {
    color: theme.colors.text,
    fontWeight: '900',
  },
});
