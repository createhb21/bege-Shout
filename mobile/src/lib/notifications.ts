import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleWakeNotification(wakeAt: string, note: string) {
  const wakeDate = new Date(wakeAt);

  if (wakeDate.getTime() <= Date.now()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bege Shout wake-up challenge',
      body: note ? `Time to prove your pillow promise: ${note}` : 'Time to prove your pillow promise.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: wakeDate,
    },
  });
}
