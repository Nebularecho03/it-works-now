import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
