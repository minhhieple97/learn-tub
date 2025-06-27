import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";
import { checkAuth } from "@/lib/require-auth";
import { IPaymentDetails } from "@/features/payments/types";
import { getSubscriptionPlanById } from "@/features/payments/queries/subscription-plans";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Fetch session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "subscription"],
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify that this session belongs to the current user
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to session" },
        { status: 403 },
      );
    }

    let paymentDetails: IPaymentDetails;

    if (session.mode === "subscription") {
      // Handle subscription payment
      const { data: plan } = await getSubscriptionPlanById(
        session.metadata?.plan_id || "",
      );

      paymentDetails = {
        amount: session.amount_total || 0,
        currency: session.currency || "usd",
        paymentType: "subscription" as const,
        planName: plan?.name || "Subscription Plan",
      };
    } else {
      // Handle credit purchase
      paymentDetails = {
        amount: session.amount_total || 0,
        currency: session.currency || "usd",
        paymentType: "credits" as const,
        creditsAmount: parseInt(session.metadata?.credits_amount || "0"),
      };
    }

    return NextResponse.json(paymentDetails);
  } catch (error) {
    console.error("Error fetching payment session:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 },
    );
  }
}
