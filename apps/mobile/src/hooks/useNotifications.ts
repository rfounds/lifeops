import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  getNotificationSettings,
  scheduleTaskReminder,
  cancelTaskReminder,
  cancelAllReminders,
  addNotificationResponseReceivedListener,
  registerForPushNotifications,
} from "../services/notifications";
import type { Task } from "@lifeops/shared";

export function useNotifications() {
  const queryClient = useQueryClient();

  // Handle notification taps
  useEffect(() => {
    const subscription = addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.taskId && data?.type === "task-reminder") {
        // Navigate to the task
        router.push(`/task/${data.taskId}`);
      } else if (data?.type === "daily-digest") {
        // Navigate to dashboard
        router.push("/");
      }
    });

    return () => subscription.remove();
  }, []);

  // Schedule notifications for all tasks
  const scheduleNotificationsForTasks = useCallback(async (tasks: Task[]) => {
    const settings = await getNotificationSettings();

    if (!settings.enabled) {
      return;
    }

    // Cancel all existing notifications first
    await cancelAllReminders();

    // Schedule notifications for each pending task
    for (const task of tasks) {
      if (!task.lastCompletedDate) {
        await scheduleTaskReminder(
          task.id,
          task.title,
          new Date(task.nextDueDate),
          settings
        );
      }
    }
  }, []);

  // Schedule notification for a single task
  const scheduleNotificationForTask = useCallback(async (task: Task) => {
    const settings = await getNotificationSettings();

    if (!settings.enabled) {
      return;
    }

    // Cancel any existing notification for this task
    await cancelTaskReminder(task.id);

    // Schedule new notification if task is not completed
    if (!task.lastCompletedDate) {
      await scheduleTaskReminder(
        task.id,
        task.title,
        new Date(task.nextDueDate),
        settings
      );
    }
  }, []);

  // Cancel notification for a task (e.g., when completed or deleted)
  const cancelNotificationForTask = useCallback(async (taskId: string) => {
    await cancelTaskReminder(taskId);
  }, []);

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    await registerForPushNotifications();
  }, []);

  return {
    scheduleNotificationsForTasks,
    scheduleNotificationForTask,
    cancelNotificationForTask,
    initializeNotifications,
  };
}
