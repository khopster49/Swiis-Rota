import { NextResponse } from "next/server";

/** Wrap an API handler with try/catch to prevent unhandled errors */
export function apiError(error: unknown) {
  console.error("[API Error]", error);

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message } },
    { status: 500 }
  );
}

/** Clamp pagination limit to prevent abuse */
export function clampPagination(limit: number, offset: number, maxLimit = 100) {
  return {
    limit: Math.max(1, Math.min(limit, maxLimit)),
    offset: Math.max(0, offset),
  };
}
