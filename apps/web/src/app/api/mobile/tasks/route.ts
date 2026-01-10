import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { taskSchema, FREE_TASK_LIMIT } from "@lifeops/shared";
import {
  authenticateRequest,
  errorResponse,
  successResponse,
} from "@/lib/mobile-auth";

// GET /api/mobile/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get user's household membership
    const membership = await prisma.householdMember.findFirst({
      where: { userId: user.id },
    });

    // Fetch user's own tasks AND household shared tasks
    const tasks = await prisma.task.findMany({
      where: membership
        ? {
            OR: [{ userId: user.id }, { householdId: membership.householdId }],
          }
        : { userId: user.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { nextDueDate: "asc" },
    });

    return successResponse({ tasks });
  } catch (error) {
    console.error("Mobile get tasks error:", error);
    return errorResponse("Failed to fetch tasks", 500);
  }
}

// POST /api/mobile/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    // Check task limit for free users
    if (user.plan === "FREE") {
      const taskCount = await prisma.task.count({
        where: { userId: user.id },
      });
      if (taskCount >= FREE_TASK_LIMIT) {
        return errorResponse(
          `Free plan is limited to ${FREE_TASK_LIMIT} tasks. Upgrade to Pro for unlimited.`,
          403
        );
      }
    }

    // Get householdId if sharing with household
    let householdId: string | null = null;
    if (body.shareWithHousehold) {
      const membership = await prisma.householdMember.findFirst({
        where: { userId: user.id },
      });
      householdId = membership?.householdId || null;
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        category: parsed.data.category,
        scheduleType: parsed.data.scheduleType,
        scheduleValue: parsed.data.scheduleValue,
        nextDueDate: new Date(`${parsed.data.nextDueDate}T12:00:00`),
        notes: parsed.data.notes || null,
        cost: body.cost || null,
        householdId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse({ task }, 201);
  } catch (error) {
    console.error("Mobile create task error:", error);
    return errorResponse("Failed to create task", 500);
  }
}
