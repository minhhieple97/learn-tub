import { env } from "@/env.mjs";
import { CronCreditResetService } from "@/features/payments/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!CronCreditResetService.validateCronSecret(authHeader, env.CRON_SECRET)) {
    const response = CronCreditResetService.createUnauthorizedResponse();
    return NextResponse.json(
      { error: response.error },
      { status: response.status },
    );
  }

  const result = await CronCreditResetService.executeCreditReset();

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, details: result.details },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { message: result.message, summary: result.summary },
    { status: result.status },
  );
}
