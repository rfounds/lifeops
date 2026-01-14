import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { taskSchema } from "@lifeops/shared";
import {
  authenticateRequest,
  errorResponse,
  successResponse,
  optionsResponse,
} from "@/lib/mobile-auth";

type RouteParams = { params: Promise<{ id: string }> };

// OPTIONS /api/mobile/tasks/[id] - Handle CORS preflight
export async function OPTIONS() {
  return optionsResponse();
}

// GET /api/mobile/tasks/[id] - Get single task
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          {
            household: {
              members: { some: { userId: user.id } },
            },
          },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    return successResponse({ task });
  } catch (error) {
    console.error("Mobile get task error:", error);
    return errorResponse("Failed to fetch task", 500);
  }
}

// PUT /api/mobile/tasks/[id] - Update task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    // Verify ownership (user owns the task)
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTask) {
      return errorResponse("Task not found", 404);
    }

    // Get householdId if sharing with household
    let householdId: string | null = null;
    if (body.shareWithHousehold) {
      const membership = await prisma.householdMember.findFirst({
        where: { userId: user.id },
      });
      householdId = membership?.householdId || null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
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

    return successResponse({ task });
  } catch (error) {
    console.error("Mobile update task error:", error);
    return errorResponse("Failed to update task", 500);
  }
}

// DELETE /api/mobile/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTask) {
      return errorResponse("Task not found", 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Mobile delete task error:", error);
    return errorResponse("Failed to delete task", 500);
  }
}
