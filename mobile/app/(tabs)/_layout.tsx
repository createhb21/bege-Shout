import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';

function NotificationButton() {
  const { unreadCount } = useApp();

  return (
    <Link href="/notifications" asChild>
      <TouchableOpacity style={{ marginRight: 12 }}>
        <View>
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          {unreadCount ? (
            <View
              style={{
                position: 'absolute',
                right: -4,
                top: -4,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                paddingHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.danger,
              }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0D1329',
          borderTopColor: theme.colors.border,
          height: 84,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textMuted,
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'camera' : 'camera-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'history' : 'history'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: t('tabs.challenge'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'alarm-check' : 'alarm-plus'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'play-box-multiple' : 'play-box-multiple-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'account-circle' : 'account-circle-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
