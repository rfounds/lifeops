import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET!;
const JWT_EXPIRES_IN = "7d";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

// CORS headers for mobile/web API access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export interface JWTPayload {
  userId: string;
  email: string;
  type?: "access" | "refresh";
}

export interface MobileUser {
  id: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO";
}

/**
 * Generate access and refresh tokens for a user
 */
export function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email, type: "access" } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, email, type: "refresh" } as JWTPayload,
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify the bearer token from a request
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<MobileUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload || payload.type === "refresh") {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, plan: true },
  });

  return user;
}

/**
 * Higher-order function to wrap API handlers with authentication
 */
export function withMobileAuth<T extends Record<string, string>>(
  handler: (
    request: NextRequest,
    user: MobileUser,
    context: { params: Promise<T> }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401, headers: corsHeaders }
      );
    }

    return handler(request, user, context);
  };
}

/**
 * Create a standardized error response
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message, success: false },
    { status, headers: corsHeaders }
  );
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { ...data, success: true },
    { status, headers: corsHeaders }
  );
}

/**
 * Handle OPTIONS preflight requests
 */
export function optionsResponse() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
