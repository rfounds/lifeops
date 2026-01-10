import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateRequest,
  errorResponse,
  successResponse,
} from "@/lib/mobile-auth";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/mobile/tasks/[id]/uncomplete - Undo task completion
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    // Verify ownership
    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        lastCompletedDate: null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse({ task: updatedTask });
  } catch (error) {
    console.error("Mobile uncomplete task error:", error);
    return errorResponse("Failed to undo completion", 500);
  }
}
