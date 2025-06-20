import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getUserActiveSubscription } from "@/features/payments/queries/subscription-queries";
import { getUserInSession } from "@/features/profile/queries";

export async function GET() {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const { data: subscription, error } = await getUserActiveSubscription(
      user.id,
    );

    if (error) {
      console.error("❌ Failed to fetch user subscription:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    const response = {
      subscription,
      hasActiveSubscription: !!subscription,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ User subscription API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
