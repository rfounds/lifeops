import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, generateTokens, errorResponse, successResponse, optionsResponse } from "@/lib/mobile-auth";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse("Refresh token is required");
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh") {
      return errorResponse("Invalid refresh token", 401);
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, plan: true },
    });

    if (!user) {
      return errorResponse("User not found", 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email);

    return successResponse({
      user,
      ...tokens,
    });
  } catch (error) {
    console.error("Mobile refresh error:", error);
    return errorResponse("Token refresh failed", 500);
  }
}
