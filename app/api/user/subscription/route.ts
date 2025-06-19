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

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user subscription:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      subscription: subscription || null,
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    console.error("Error in subscription API:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
