import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { changePasswordSchema } from "@lifeops/shared";
import bcrypt from "bcryptjs";
import {
  authenticateRequest,
  errorResponse,
  successResponse,
  optionsResponse,
} from "@/lib/mobile-auth";

// OPTIONS /api/mobile/settings/password - Handle CORS preflight
export async function OPTIONS() {
  return optionsResponse();
}

// PUT /api/mobile/settings/password - Change password
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get user with password
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!fullUser?.password) {
      return errorResponse("Cannot change password for OAuth accounts");
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, fullUser.password);
    if (!isValid) {
      return errorResponse("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Mobile change password error:", error);
    return errorResponse("Failed to change password", 500);
  }
}
