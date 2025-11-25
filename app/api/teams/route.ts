import { NextRequest, NextResponse } from "next/server";
import { getTeamsBySport } from "@/lib/db";

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

    const teams = await getTeamsBySport(sportId);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
