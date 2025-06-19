import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();

    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select(
        "id, name, stripe_product_id, stripe_price_id, price_cents, credits_per_month",
      )
      .eq("is_active", true)
      .order("price_cents", { ascending: true });

    if (error) {
      console.error("Error fetching subscription plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (error) {
    console.error("Error in subscription plans API:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
