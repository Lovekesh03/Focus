import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleTaskReminder(taskId: string, title: string) {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await cancelTaskReminder(taskId);

  // Setup repeating alert for incomplete tasks (e.g., every 3 hours)
  await Notifications.scheduleNotificationAsync({
    identifier: taskId,
    content: {
      title: "Smart Reminder: Incomplete Task",
      body: `You haven't completed: "${title}". Time to focus!`,
      data: { taskId },
    },
    // Using TimeIntervalTrigger mechanism for repeats
    trigger: {
      type: 'timeInterval',
      seconds: 3 * 60 * 60, // 3 hours
      repeats: true, 
    } as Notifications.TimeIntervalTriggerInput,
  });
}

export async function cancelTaskReminder(taskId: string) {
  const hasPermission = await requestPermissions();
  if (hasPermission) {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  }
}
