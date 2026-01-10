import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";
import { sendReminderSms } from "@/lib/sms";
import { differenceInDays, startOfDay } from "date-fns";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());

  try {
    // Get all Pro users with reminders enabled
    const users = await prisma.user.findMany({
      where: {
        plan: "PRO",
        OR: [{ emailReminders: true }, { smsReminders: true }],
      },
      include: {
        tasks: true,
      },
    });

    let emailsSent = 0;
    let smsSent = 0;
    let remindersSaved = 0;

    for (const user of users) {
      // Parse user's reminder day preferences
      const reminderDays: number[] = JSON.parse(user.reminderDays);

      // Find tasks that need reminders
      const tasksToRemind: {
        taskId: string;
        title: string;
        category: string;
        dueDate: Date;
        daysUntilDue: number;
        reminderType: string;
      }[] = [];

      for (const task of user.tasks) {
        const dueDate = startOfDay(new Date(task.nextDueDate));
        const daysUntilDue = differenceInDays(dueDate, today);

        // Check if this day matches user's reminder preferences
        let reminderType: string | null = null;

        if (daysUntilDue < 0) {
          // Always remind for overdue tasks
          reminderType = "overdue";
        } else if (reminderDays.includes(daysUntilDue)) {
          // Match user's configured reminder days
          if (daysUntilDue === 0) {
            reminderType = "today";
          } else if (daysUntilDue === 1) {
            reminderType = "1_day";
          } else if (daysUntilDue === 3) {
            reminderType = "3_days";
          } else if (daysUntilDue === 7) {
            reminderType = "7_days";
          }
        }

        if (!reminderType) continue;

        // Check if this reminder was already sent for this due date
        const existingReminder = await prisma.taskReminder.findFirst({
          where: {
            taskId: task.id,
            reminderType,
            dueDateSnapshot: dueDate,
          },
        });

        if (existingReminder) continue;

        tasksToRemind.push({
          taskId: task.id,
          title: task.title,
          category: task.category,
          dueDate,
          daysUntilDue,
          reminderType,
        });
      }

      if (tasksToRemind.length === 0) continue;

      // Send email if enabled
      if (user.emailReminders) {
        const emailSent = await sendReminderEmail({
          to: user.email,
          userName: user.name || "there",
          tasks: tasksToRemind.map((t) => ({
            title: t.title,
            category: t.category,
            dueDate: t.dueDate,
            daysUntilDue: t.daysUntilDue,
          })),
        });

        if (emailSent) {
          emailsSent++;
        }
      }

      // Send SMS if enabled and phone number exists
      if (user.smsReminders && user.phoneNumber) {
        const smsSentResult = await sendReminderSms({
          to: user.phoneNumber,
          tasks: tasksToRemind.map((t) => ({
            title: t.title,
            daysUntilDue: t.daysUntilDue,
          })),
        });

        if (smsSentResult) {
          smsSent++;
        }
      }

      // Record reminders sent (only if at least one notification was sent)
      if (user.emailReminders || (user.smsReminders && user.phoneNumber)) {
        for (const task of tasksToRemind) {
          await prisma.taskReminder.create({
            data: {
              taskId: task.taskId,
              userId: user.id,
              reminderType: task.reminderType,
              dueDateSnapshot: task.dueDate,
            },
          });
          remindersSaved++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      usersProcessed: users.length,
      emailsSent,
      smsSent,
      remindersSaved,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
