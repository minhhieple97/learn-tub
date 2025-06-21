import { getUserTotalCredits } from "@/features/payments/queries";
import {
  getUserInSession,
  updateProfileSettings,
} from "@/features/profile/queries";
import { IUserProfile } from "@/features/auth/types";
import { CacheClient } from "@/lib/cache-client";
import type { IProfileUpdate } from "@/types";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: StatusCodes.UNAUTHORIZED },
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

export async function PUT(request: Request) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const body: IProfileUpdate = await request.json();

    if (!body.full_name && !body.avatar_url) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 },
      );
    }

    const result = await updateProfileSettings(user.id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update profile" },
        { status: 500 },
      );
    }

    await CacheClient.invalidateUserProfile(user.id);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
