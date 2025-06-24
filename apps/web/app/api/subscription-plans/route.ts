import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getUserInSession } from "@/features/profile/queries";
import { CacheClient } from "@/lib/cache-client";
import {
  getAllSubscriptionPlans,
  type SubscriptionPlan,
} from "@/features/payments/queries/subscription-plans";

export async function GET() {
  try {
    const user = await getUserInSession();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const cachedPlans = await CacheClient.getSubscriptionPlans<{
      plans: SubscriptionPlan[];
    }>();

    if (cachedPlans) {
      return NextResponse.json(cachedPlans);
    }

    const { data: plans, error } = await getAllSubscriptionPlans();

    if (error) {
      console.error("Error fetching subscription plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    const response = { plans: plans || [] };

    await CacheClient.setSubscriptionPlans(response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in subscription plans API:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
