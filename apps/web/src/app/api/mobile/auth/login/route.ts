import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@lifeops/shared";
import bcrypt from "bcryptjs";
import { generateTokens, errorResponse, successResponse, optionsResponse } from "@/lib/mobile-auth";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        plan: true,
      },
    });

    if (!user || !user.password) {
      return errorResponse("Invalid email or password", 401);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return errorResponse("Login failed", 500);
  }
}
