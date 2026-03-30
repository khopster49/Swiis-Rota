import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

// Demo user fallback - used when Firebase Auth is not configured
const DEMO_USER_ID = "demo-user-1";

/**
 * Extract the authenticated user ID from a request.
 *
 * 1. Checks the Authorization header for a Firebase ID token.
 * 2. Falls back to DEMO_USER_ID for local development.
 *
 * Returns { userId } on success or a NextResponse error.
 */
export async function getAuthUser(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const idToken = authHeader.slice(7);
    try {
      const decoded = await auth.verifyIdToken(idToken);
      return { userId: decoded.uid };
    } catch {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
        { status: 401 }
      );
    }
  }

  // In development / demo mode, use the demo user
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    return { userId: DEMO_USER_ID };
  }

  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
    { status: 401 }
  );
}

/** Type guard to check if getAuthUser returned an error response */
export function isAuthError(result: { userId: string } | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
