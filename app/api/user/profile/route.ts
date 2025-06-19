import { NextResponse } from "next/server";
import { getUserTotalCredits } from "@/features/payments/queries";
import { getUserInSession } from "@/features/profile/queries";
import { IUserProfile } from "@/features/auth/types";

export async function GET() {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
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

    return NextResponse.json({
      ...payload,
    });
  } catch {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
}
