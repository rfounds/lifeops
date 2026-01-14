import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { differenceInDays, startOfDay, format, setHours, setMinutes } from "date-fns";

const NOTIFICATION_SETTINGS_KEY = "@lifeops_notification_settings";
const SCHEDULED_NOTIFICATIONS_KEY = "@lifeops_scheduled_notifications";

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: { hour: number; minute: number };
  daysBefore: number; // Days before due date to send reminder
  overdueReminders: boolean;
  dailyDigest: boolean;
  digestTime: { hour: number; minute: number };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderTime: { hour: 9, minute: 0 },
  daysBefore: 1,
  overdueReminders: true,
  dailyDigest: false,
  digestTime: { hour: 8, minute: 0 },
};

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push notification permission");
    return null;
  }

  // Get the push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    token = tokenData.data;
  } catch (error) {
    console.error("Error getting push token:", error);
  }

  // Configure Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("task-reminders", {
      name: "Task Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#818CF8",
      sound: "default",
    });
  }

  return token;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error loading notification settings:", error);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
}

export async function scheduleTaskReminder(
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  settings: NotificationSettings
): Promise<string | null> {
  if (!settings.enabled) return null;

  const today = startOfDay(new Date());
  const taskDueDate = startOfDay(dueDate);
  const daysUntilDue = differenceInDays(taskDueDate, today);

  // Don't schedule if task is already past due (unless overdue reminders enabled)
  if (daysUntilDue < 0 && !settings.overdueReminders) return null;

  // Calculate when to send the reminder
  let reminderDate: Date;

  if (daysUntilDue < 0) {
    // Task is overdue - send reminder today
    reminderDate = new Date();
    reminderDate = setHours(reminderDate, settings.reminderTime.hour);
    reminderDate = setMinutes(reminderDate, settings.reminderTime.minute);

    // If reminder time has passed today, schedule for tomorrow
    if (reminderDate < new Date()) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
  } else if (daysUntilDue <= settings.daysBefore) {
    // Task is due soon - send reminder today
    reminderDate = new Date();
    reminderDate = setHours(reminderDate, settings.reminderTime.hour);
    reminderDate = setMinutes(reminderDate, settings.reminderTime.minute);

    // If reminder time has passed today, schedule for tomorrow
    if (reminderDate < new Date()) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
  } else {
    // Schedule for X days before due date
    reminderDate = new Date(taskDueDate);
    reminderDate.setDate(reminderDate.getDate() - settings.daysBefore);
    reminderDate = setHours(reminderDate, settings.reminderTime.hour);
    reminderDate = setMinutes(reminderDate, settings.reminderTime.minute);
  }

  // Don't schedule if reminder date is in the past
  if (reminderDate < new Date()) return null;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: daysUntilDue < 0 ? "Overdue Task" : "Task Reminder",
        body:
          daysUntilDue < 0
            ? `"${taskTitle}" is ${Math.abs(daysUntilDue)} day(s) overdue`
            : daysUntilDue === 0
            ? `"${taskTitle}" is due today`
            : daysUntilDue === 1
            ? `"${taskTitle}" is due tomorrow`
            : `"${taskTitle}" is due in ${daysUntilDue} days`,
        data: { taskId, type: "task-reminder" },
        sound: "default",
        categoryIdentifier: "task-reminders",
      },
      trigger: {
        date: reminderDate,
        channelId: "task-reminders",
      },
    });

    // Store the notification ID for later cancellation
    await storeScheduledNotification(taskId, notificationId);

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();
    const notificationId = scheduled[taskId];

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await removeScheduledNotification(taskId);
    }
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}

async function storeScheduledNotification(
  taskId: string,
  notificationId: string
): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();
    scheduled[taskId] = notificationId;
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduled));
  } catch (error) {
    console.error("Error storing scheduled notification:", error);
  }
}

async function removeScheduledNotification(taskId: string): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();
    delete scheduled[taskId];
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduled));
  } catch (error) {
    console.error("Error removing scheduled notification:", error);
  }
}

async function getScheduledNotifications(): Promise<Record<string, string>> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading scheduled notifications:", error);
  }
  return {};
}

export async function scheduleDailyDigest(
  tasks: Array<{ id: string; title: string; nextDueDate: Date }>,
  settings: NotificationSettings
): Promise<string | null> {
  if (!settings.enabled || !settings.dailyDigest) return null;

  const today = startOfDay(new Date());
  const upcomingTasks = tasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    const daysUntil = differenceInDays(dueDate, today);
    return daysUntil >= 0 && daysUntil <= 7;
  });

  const overdueTasks = tasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    return dueDate < today;
  });

  if (upcomingTasks.length === 0 && overdueTasks.length === 0) return null;

  // Schedule for tomorrow at digest time
  let digestDate = new Date();
  digestDate.setDate(digestDate.getDate() + 1);
  digestDate = setHours(digestDate, settings.digestTime.hour);
  digestDate = setMinutes(digestDate, settings.digestTime.minute);

  const body =
    overdueTasks.length > 0
      ? `You have ${overdueTasks.length} overdue and ${upcomingTasks.length} upcoming tasks`
      : `You have ${upcomingTasks.length} tasks due this week`;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Task Summary",
        body,
        data: { type: "daily-digest" },
        sound: "default",
      },
      trigger: {
        date: digestDate,
        channelId: "task-reminders",
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling daily digest:", error);
    return null;
  }
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
