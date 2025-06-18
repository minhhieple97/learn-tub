import { NextResponse } from "next/server";
import { getUserCredits } from "@/features/payments/queries";
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
    const userCredits = await getUserCredits(user.id);
    const payload: IUserProfile = {
      ...user,
      credits:
        (userCredits.data?.credits_subscription ?? 0) +
        (userCredits.data?.credits_purchase ?? 0),
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
