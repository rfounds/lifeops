import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { updateAccountSchema } from "@lifeops/shared";
import {
  authenticateRequest,
  errorResponse,
  successResponse,
} from "@/lib/mobile-auth";

// GET /api/mobile/settings/account - Get account info
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    });

    return successResponse({ account: fullUser });
  } catch (error) {
    console.error("Mobile get account error:", error);
    return errorResponse("Failed to get account info", 500);
  }
}

// PUT /api/mobile/settings/account - Update account info
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    });

    return successResponse({ account: updatedUser });
  } catch (error) {
    console.error("Mobile update account error:", error);
    return errorResponse("Failed to update account", 500);
  }
}
