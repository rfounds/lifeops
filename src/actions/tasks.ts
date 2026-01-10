"use server";

import { prisma } from "@/lib/db";
import { requireAuth, canCreateTask, FREE_TASK_LIMIT } from "@/lib/auth-utils";
import { taskSchema } from "@/lib/validations";
import { calculateNextDueDate } from "@/lib/schedule-utils";
import { revalidatePath } from "next/cache";
import { ScheduleType, Category } from "@prisma/client";

export type TaskActionResult = {
  success: boolean;
  error?: string;
  taskId?: string;
};

export async function createTask(formData: FormData): Promise<TaskActionResult> {
  const user = await requireAuth();

  // Check task limit for free users
  const canCreate = await canCreateTask(user.id);
  if (!canCreate) {
    return {
      success: false,
      error: `Free plan is limited to ${FREE_TASK_LIMIT} tasks. Upgrade to Pro for unlimited tasks.`,
    };
  }

  const rawData = {
    title: formData.get("title"),
    category: formData.get("category"),
    scheduleType: formData.get("scheduleType"),
    scheduleValue: formData.get("scheduleValue")
      ? parseInt(formData.get("scheduleValue") as string)
      : null,
    nextDueDate: formData.get("nextDueDate"),
    notes: formData.get("notes") || null,
  };

  const costValue = formData.get("cost");
  const cost = costValue ? parseFloat(costValue as string) : null;

  const parsed = taskSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Get householdId if sharing with household
  const shareWithHousehold = formData.get("shareWithHousehold") === "true";
  let householdId: string | null = null;

  if (shareWithHousehold) {
    const membership = await prisma.householdMember.findFirst({
      where: { userId: user.id },
    });
    householdId = membership?.householdId || null;
  }

  try {
    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        category: parsed.data.category as Category,
        scheduleType: parsed.data.scheduleType as ScheduleType,
        scheduleValue: parsed.data.scheduleValue,
        nextDueDate: parsed.data.nextDueDate,
        notes: parsed.data.notes,
        cost,
        householdId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error("Create task error:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(
  taskId: string,
  formData: FormData
): Promise<TaskActionResult> {
  const user = await requireAuth();

  const rawData = {
    title: formData.get("title"),
    category: formData.get("category"),
    scheduleType: formData.get("scheduleType"),
    scheduleValue: formData.get("scheduleValue")
      ? parseInt(formData.get("scheduleValue") as string)
      : null,
    nextDueDate: formData.get("nextDueDate"),
    notes: formData.get("notes") || null,
  };

  const costValue = formData.get("cost");
  const cost = costValue ? parseFloat(costValue as string) : null;

  const parsed = taskSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Get householdId if sharing with household
  const shareWithHousehold = formData.get("shareWithHousehold") === "true";
  let householdId: string | null = null;

  if (shareWithHousehold) {
    const membership = await prisma.householdMember.findFirst({
      where: { userId: user.id },
    });
    householdId = membership?.householdId || null;
  }

  try {
    // Verify ownership (user owns the task)
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: parsed.data.title,
        category: parsed.data.category as Category,
        scheduleType: parsed.data.scheduleType as ScheduleType,
        scheduleValue: parsed.data.scheduleValue,
        nextDueDate: parsed.data.nextDueDate,
        notes: parsed.data.notes,
        cost,
        householdId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, taskId };
  } catch (error) {
    console.error("Update task error:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTask(taskId: string): Promise<TaskActionResult> {
  const user = await requireAuth();

  try {
    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete task error:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

export async function completeTask(taskId: string): Promise<TaskActionResult> {
  const user = await requireAuth();

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const today = new Date();
    // Use noon to avoid timezone issues
    today.setHours(12, 0, 0, 0);

    // Just mark as completed - don't advance the date yet
    // The date will be advanced when the due date passes (in getUserTasks)
    await prisma.task.update({
      where: { id: taskId },
      data: {
        lastCompletedDate: today,
        completionCount: { increment: 1 },
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Complete task error:", error);
    return { success: false, error: "Failed to complete task" };
  }
}

export async function uncompleteTask(taskId: string): Promise<TaskActionResult> {
  const user = await requireAuth();

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        lastCompletedDate: null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Uncomplete task error:", error);
    return { success: false, error: "Failed to undo completion" };
  }
}

export async function getUserTasks() {
  const user = await requireAuth();

  // Get user's household membership
  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
  });

  // Fetch user's own tasks AND household shared tasks
  const tasks = await prisma.task.findMany({
    where: membership
      ? {
          OR: [
            { userId: user.id },
            { householdId: membership.householdId },
          ],
        }
      : { userId: user.id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { nextDueDate: "asc" },
  });

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Check for completed tasks whose due date has passed - advance them to next occurrence
  for (const task of tasks) {
    if (
      task.lastCompletedDate &&
      task.scheduleType !== "FIXED_DATE" &&
      task.nextDueDate < today
    ) {
      // Due date has passed and task was completed - advance to next occurrence
      const newNextDueDate = calculateNextDueDate(
        task.scheduleType,
        task.scheduleValue,
        task.nextDueDate,
        today
      );

      await prisma.task.update({
        where: { id: task.id },
        data: {
          nextDueDate: newNextDueDate,
          lastCompletedDate: null, // Clear completion for new period
        },
      });

      // Update the task object for return
      task.nextDueDate = newNextDueDate;
      task.lastCompletedDate = null;
    }
  }

  return tasks;
}

export async function getUserHouseholdId() {
  const user = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    select: { householdId: true },
  });

  return membership?.householdId || null;
}
