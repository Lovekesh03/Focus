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

export async function scheduleTargetDeadlineReminder(targetId: string, title: string, deadline: string) {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await cancelTargetReminder(targetId);

  // Parse deadline to show "days left" in the body
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return; // Deadline already passed

  await Notifications.scheduleNotificationAsync({
    identifier: `target-${targetId}`,
    content: {
      title: "Target Reminder",
      body: `Don't forget: "${title}" is coming up!`,
      data: { targetId, deadline },
    },
    trigger: {
      type: 'daily',
      hour: 9,
      minute: 0,
    } as Notifications.DailyTriggerInput,
  });
}

export async function cancelTargetReminder(targetId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(`target-${targetId}`);
  } catch {
    // Silently ignore
  }
}

export async function cancelTaskReminder(taskId: string) {
  try {
    // Cancel directly — no permission check needed to cancel a notification
    await Notifications.cancelScheduledNotificationAsync(taskId);
  } catch {
    // Silently ignore if there was nothing to cancel
  }
}

/** Cancel ALL scheduled notifications — call this to clear stale reminders */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Silently ignore
  }
}

/**
 * Syncs scheduled notifications with the current list of incomplete task IDs.
 * Any scheduled notification whose ID is NOT in incompletedTaskIds gets cancelled.
 */
export async function syncNotificationsWithTasks(
  incompletedTaskIds: string[]
) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const validIds = new Set(incompletedTaskIds);
    let cancelledCount = 0;
    
    for (const notif of scheduled) {
      // Only sync task-based notifications (which use the taskId as identifier)
      // Exclude special identifiers like 'pomodoro-finish' and target- prefixed ones
      if (notif.identifier !== 'pomodoro-finish' && !notif.identifier.startsWith('target-')) {
        if (!validIds.has(notif.identifier)) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
          cancelledCount++;
        }
      }
    }
    
    if (cancelledCount > 0) {
      console.log(`[Notifications] Sync complete. Cancelled ${cancelledCount} stale task reminders.`);
    }
  } catch (error) {
    console.error('[Notifications] Failed to sync notifications:', error);
  }
}

/** Cancel ONLY task-specific reminders, leave targets and pomodoro intact */
export async function cancelAllTaskReminders() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier !== 'pomodoro-finish' && !notif.identifier.startsWith('target-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
    console.log('[Notifications] All task reminders cancelled.');
  } catch (error) {
    console.error('[Notifications] Failed to cancel task reminders:', error);
  }
}

export async function schedulePomodoroFinish(taskTitle: string, seconds: number) {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await cancelPomodoroFinish();

  await Notifications.scheduleNotificationAsync({
    identifier: 'pomodoro-finish',
    content: {
      title: "Focus Session Complete!",
      body: `Great job! You've finished your focus session for: "${taskTitle}"`,
      sound: true,
      priority: 'high',
    },
    trigger: {
      type: 'timeInterval',
      seconds: seconds,
      repeats: false,
    } as Notifications.TimeIntervalTriggerInput,
  });
}

export async function cancelPomodoroFinish() {
  try {
    await Notifications.cancelScheduledNotificationAsync('pomodoro-finish');
  } catch {
    // Silently ignore
  }
}
