"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export async function getReminderSettings() {
  const user = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      emailReminders: true,
      smsReminders: true,
      phoneNumber: true,
      reminderDays: true,
      plan: true,
    },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  return {
    emailReminders: dbUser.emailReminders,
    smsReminders: dbUser.smsReminders,
    phoneNumber: dbUser.phoneNumber || "",
    reminderDays: JSON.parse(dbUser.reminderDays) as number[],
    isPro: dbUser.plan === "PRO",
  };
}

type UpdateReminderSettingsInput = {
  emailReminders: boolean;
  smsReminders: boolean;
  phoneNumber: string;
  reminderDays: number[];
};

export async function updateReminderSettings(
  input: UpdateReminderSettingsInput
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  // Verify user is Pro
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });

  if (!dbUser || dbUser.plan !== "PRO") {
    return {
      success: false,
      error: "Reminders are a Pro feature. Please upgrade to enable them.",
    };
  }

  // Validate phone number if SMS is enabled
  if (input.smsReminders && !input.phoneNumber) {
    return {
      success: false,
      error: "Phone number is required for SMS reminders.",
    };
  }

  // Validate reminder days
  const validDays = input.reminderDays.filter((d) => d >= 0 && d <= 30);
  if (validDays.length === 0) {
    return {
      success: false,
      error: "Please select at least one reminder day.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailReminders: input.emailReminders,
        smsReminders: input.smsReminders,
        phoneNumber: input.phoneNumber || null,
        reminderDays: JSON.stringify(validDays.sort((a, b) => b - a)),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update reminder settings:", error);
    return { success: false, error: "Failed to save settings. Please try again." };
  }
}
