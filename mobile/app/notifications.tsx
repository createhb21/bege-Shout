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
        <SectionTitle title={t('notifications.title')} subtitle={t('notifications.subtitle')} />
      </HeroCard>

      {!inbox.length ? (
        <EmptyState title={t('notifications.title')} body={t('notifications.empty')} />
      ) : (
        inbox.map((item) => (
          <SectionCard key={item.id}>
            <View style={styles.row}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.meta}>{formatDateTime(item.createdAt, settings.locale)}</Text>
              </View>
              {!item.read ? (
                <TouchableOpacity onPress={() => markNotificationRead(item.id)}>
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
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  body: {
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  link: {
    color: theme.colors.mint,
    fontWeight: '800',
  },
});
