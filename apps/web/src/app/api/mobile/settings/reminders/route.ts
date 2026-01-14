import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
  authenticateRequest,
  errorResponse,
  successResponse,
  optionsResponse,
} from "@/lib/mobile-auth";

// OPTIONS /api/mobile/settings/reminders - Handle CORS preflight
export async function OPTIONS() {
  return optionsResponse();
}

const reminderSettingsSchema = z.object({
  emailReminders: z.boolean(),
  smsReminders: z.boolean(),
  phoneNumber: z.string().nullable().optional(),
  reminderDays: z.array(z.number().min(0).max(30)),
});

// GET /api/mobile/settings/reminders - Get reminder settings
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const settings = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        emailReminders: true,
        smsReminders: true,
        phoneNumber: true,
        reminderDays: true,
        plan: true,
      },
    });

    if (!settings) {
      return errorResponse("User not found", 404);
    }

    return successResponse({
      reminders: {
        emailReminders: settings.emailReminders,
        smsReminders: settings.smsReminders,
        phoneNumber: settings.phoneNumber,
        reminderDays: JSON.parse(settings.reminderDays),
        isPro: settings.plan === "PRO",
      },
    });
  } catch (error) {
    console.error("Mobile get reminders error:", error);
    return errorResponse("Failed to get reminder settings", 500);
  }
}

// PUT /api/mobile/settings/reminders - Update reminder settings
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // Reminders are a Pro feature
    if (user.plan !== "PRO") {
      return errorResponse("Reminders are a Pro feature", 403);
    }

    const body = await request.json();
    const parsed = reminderSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { emailReminders, smsReminders, phoneNumber, reminderDays } =
      parsed.data;

    // Validate SMS requires phone number
    if (smsReminders && !phoneNumber) {
      return errorResponse("Phone number is required for SMS reminders");
    }

    // Validate at least one reminder day
    if ((emailReminders || smsReminders) && reminderDays.length === 0) {
      return errorResponse("At least one reminder day is required");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailReminders,
        smsReminders,
        phoneNumber: phoneNumber || null,
        reminderDays: JSON.stringify(reminderDays),
      },
    });

    return successResponse({ message: "Reminder settings updated" });
  } catch (error) {
    console.error("Mobile update reminders error:", error);
    return errorResponse("Failed to update reminder settings", 500);
  }
}
