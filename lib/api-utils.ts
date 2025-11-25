// API error handling and utility functions

import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Unknown error occurred" },
    { status: 500 }
  );
}

export function createSuccessResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function createErrorResponse(
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json({ error: message, details }, { status });
}

// Validation helpers
export function formatValidationErrors(errors: unknown): string[] {
  if (Array.isArray(errors)) {
    return errors.map((err) => {
      if (typeof err === "object" && err !== null && "message" in err) {
        return String(err.message);
      }
      return String(err);
    });
  }
  return [String(errors)];
}
