import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerSchema } from "@lifeops/shared";
import bcrypt from "bcryptjs";
import { generateTokens, errorResponse, successResponse } from "@/lib/mobile-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { name, email, password } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("An account with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    return successResponse({
      user,
      ...tokens,
    }, 201);
  } catch (error) {
    console.error("Mobile register error:", error);
    return errorResponse("Registration failed", 500);
  }
}
