import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateRequest,
  errorResponse,
  successResponse,
} from "@/lib/mobile-auth";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/mobile/tasks/[id]/complete - Mark task as complete
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    // Verify ownership or household membership
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
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        lastCompletedDate: today,
        completionCount: { increment: 1 },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse({ task: updatedTask });
  } catch (error) {
    console.error("Mobile complete task error:", error);
    return errorResponse("Failed to complete task", 500);
  }
}
