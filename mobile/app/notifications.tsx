import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppScreen, EmptyState, HeroCard, SectionCard, SectionTitle } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { formatDateTime } from '@/src/lib/format';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { inbox, markNotificationRead, settings } = useApp();

  return (
    <AppScreen>
      <HeroCard>
        <SectionTitle eyebrow="INBOX" title={t('notifications.title')} subtitle={t('notifications.subtitle')} />
      </HeroCard>

      {!inbox.length ? (
        <EmptyState title={t('notifications.title')} body={t('notifications.empty')} />
      ) : (
        inbox.map((item) => (
          <SectionCard key={item.id}>
            <View style={styles.row}>
              <View style={[styles.iconBubble, !item.read && styles.iconBubbleUnread]}>
                <MaterialCommunityIcons name={item.read ? 'bell-outline' : 'bell-ring'} size={20} color={theme.colors.text} />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.meta}>{formatDateTime(item.createdAt, settings.locale)}</Text>
              </View>
              {!item.read ? (
                <TouchableOpacity style={styles.markButton} onPress={() => markNotificationRead(item.id)}>
                  <Text style={styles.link}>{t('notifications.markRead')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </SectionCard>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconBubbleUnread: {
    backgroundColor: 'rgba(255,45,122,0.22)',
    borderColor: 'rgba(255,45,122,0.32)',
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    color: theme.colors.textMuted,
    lineHeight: 22,
    fontWeight: '600',
  },
  meta: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
  },
  markButton: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  link: {
    color: theme.colors.mint,
    fontWeight: '900',
    fontSize: 12,
  },
});
