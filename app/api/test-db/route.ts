import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await query("SELECT version()");
    return NextResponse.json({ success: true, version: result.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
