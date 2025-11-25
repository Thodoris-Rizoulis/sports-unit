import { NextRequest, NextResponse } from "next/server";
import { getPositionsBySport } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = parseInt(searchParams.get("sportId") || "0");

    if (!sportId || sportId <= 0) {
      return NextResponse.json(
        { error: "Valid sportId is required" },
        { status: 400 }
      );
    }

    const positions = await getPositionsBySport(sportId);
    return NextResponse.json(positions);
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}
