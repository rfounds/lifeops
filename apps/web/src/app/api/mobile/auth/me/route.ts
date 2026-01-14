import { NextRequest } from "next/server";
import { authenticateRequest, errorResponse, successResponse, optionsResponse } from "@/lib/mobile-auth";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    return successResponse({ user });
  } catch (error) {
    console.error("Mobile me error:", error);
    return errorResponse("Failed to get user", 500);
  }
}
