"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { addMonths, startOfDay } from "date-fns";
import { calculateNextDueDate } from "@/lib/schedule-utils";
import { templates } from "@/lib/templates-data";

export async function addTemplateToAccount(
  templateId: string
): Promise<{ success: boolean; error?: string; addedCount?: number }> {
  const user = await requireAuth();

  // Check if user is Pro (templates are Pro-only)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });

  if (dbUser?.plan !== "PRO") {
    return { success: false, error: "Templates are a Pro feature. Upgrade to access." };
  }

  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    return { success: false, error: "Template not found" };
  }

  const today = startOfDay(new Date());

  try {
    const tasksToCreate = template.tasks.map((task) => {
      let nextDueDate: Date;

      if (task.scheduleType === "FIXED_DATE") {
        nextDueDate = addMonths(today, 1); // Default to 1 month out
      } else {
        nextDueDate = calculateNextDueDate(
          task.scheduleType,
          task.scheduleValue,
          today,
          today
        );
      }

      return {
        userId: user.id,
        title: task.title,
        category: task.category,
        scheduleType: task.scheduleType,
        scheduleValue: task.scheduleValue,
        nextDueDate,
        notes: task.notes,
      };
    });

    await prisma.task.createMany({
      data: tasksToCreate,
    });

    revalidatePath("/dashboard");
    revalidatePath("/templates");

    return { success: true, addedCount: tasksToCreate.length };
  } catch (error) {
    console.error("Add template error:", error);
    return { success: false, error: "Failed to add template tasks" };
  }
}
