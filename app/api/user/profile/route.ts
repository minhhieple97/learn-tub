import {
  IAuthUserProfile,
  IAuthUserProfileWithCredits,
} from "@/features/auth/types";
import { getUserTotalCredits } from "@/features/payments/queries";
import {
  getProfileInSession,
  getUserInSession,
  updateProfile,
} from "@/features/profile/queries";
import { updateProfileSchema } from "@/features/auth/schemas";
import { CacheClient } from "@/lib/cache-client";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getProfileInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const cachedProfile = await CacheClient.getUserProfile<IAuthUserProfile>(
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

    const payload: IAuthUserProfileWithCredits = {
      ...user,
      credits: totalCredits,
    };

    await CacheClient.setUserProfile(user.id, payload);

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
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

    const body = await request.json();

    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const validatedData = validationResult.data;

    if (
      !validatedData.full_name &&
      !validatedData.avatar_url &&
      !validatedData.learning_preferences
    ) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const result = await updateProfile(user.id, validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update profile" },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
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
