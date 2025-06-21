import { NextResponse } from "next/server";
import { getUserTotalCredits } from "@/features/payments/queries";
import { getUserInSession } from "@/features/profile/queries";
import { IUserProfile } from "@/features/auth/types";
import { CacheClient } from "@/lib/cache-client";

export async function GET() {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const cachedProfile = await CacheClient.getUserProfile<IUserProfile>(
      user.id,
    );
    if (cachedProfile) {
      return NextResponse.json(cachedProfile);
    }

    const { totalCredits, error: creditsError } = await getUserTotalCredits(
      user.id,
    );

    if (creditsError) {
      console.error("Failed to fetch user credits:", creditsError);
    }

    const payload: IUserProfile = {
      ...user,
      credits: totalCredits,
    };

    await CacheClient.setUserProfile(user.id, payload);

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
}
