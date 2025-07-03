import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { CacheService } from "@/lib/cache-service";
import { env } from "@/env.mjs";
import { StatusCodes } from "http-status-codes";

export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const result = await CacheService.performCacheMaintenance();

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? "Cache maintenance completed successfully"
        : `Cache maintenance failed: ${result.error}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache maintenance cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cache maintenance failed",
        timestamp: new Date().toISOString(),
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
