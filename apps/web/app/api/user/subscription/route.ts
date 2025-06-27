import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getUserSubscriptionWithStatus } from "@/features/payments/queries";
import { getUserInSession } from "@/features/profile/queries";
import { CacheClient } from "@/lib/cache-client";
import { ICachedSubscriptionData } from "@/features/payments/types";

export async function GET() {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const cachedSubscriptionData = await CacheClient.getUserSubscription(
      user.id,
    );
    console.log(
      "cachedSubscriptionData",
      JSON.stringify(cachedSubscriptionData),
    );
    if (cachedSubscriptionData) {
      const {
        subscription,
        hasActiveSubscription,
        isCancelled,
        daysRemaining,
      } = cachedSubscriptionData;
      const response = {
        subscription,
        hasActiveSubscription,
        isCancelled,
        daysRemaining,
      };

      return NextResponse.json(response);
    }

    const { data: subscriptionData, error } =
      await getUserSubscriptionWithStatus(user.id);

    if (error) {
      console.error("❌ Failed to fetch user subscription:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    const cacheData: ICachedSubscriptionData = {
      subscription: subscriptionData?.subscription || null,
      hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
      isCancelled: subscriptionData?.isCancelled || false,
      daysRemaining: subscriptionData?.daysRemaining || 0,
    };
    await CacheClient.setUserSubscription(user.id, cacheData);

    const response = {
      subscription: subscriptionData?.subscription,
      hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
      isCancelled: subscriptionData?.isCancelled || false,
      daysRemaining: subscriptionData?.daysRemaining || 0,
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
