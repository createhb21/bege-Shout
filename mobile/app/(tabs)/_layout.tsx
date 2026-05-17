import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';

function NotificationButton() {
  const { unreadCount } = useApp();

  return (
    <Link href="/notifications" asChild>
      <TouchableOpacity style={styles.headerIconButton}>
        <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
        {unreadCount ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Link>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: theme.colors.white,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        headerTitleStyle: styles.headerTitle,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        headerRight: () => <NotificationButton />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.capture'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <MaterialCommunityIcons name={focused ? 'camera-iris' : 'camera-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <MaterialCommunityIcons name={focused ? 'view-grid' : 'view-grid-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: t('tabs.challenge'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <MaterialCommunityIcons name={focused ? 'alarm-check' : 'alarm'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <MaterialCommunityIcons name={focused ? 'play-box' : 'play-box-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <MaterialCommunityIcons name={focused ? 'account-circle' : 'account-circle-outline'} size={25} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
    height: 68,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 34,
    backgroundColor: 'rgba(12,12,16,0.84)',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.36,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  tabBarItem: {
    borderRadius: 28,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unreadBadge: {
    position: 'absolute',
    right: -1,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
});
