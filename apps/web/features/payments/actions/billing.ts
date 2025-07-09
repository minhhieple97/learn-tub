"use server";

import { ActionError, authAction } from "@/lib/safe-action";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import { getUserActiveSubscription } from "../queries";
import { PAYMENT_CONFIG_URLS } from "@/config/constants";

import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const manageBillingAction = authAction.action(
  async ({ ctx: { user } }) => {
    const subscriptionData = await getUserActiveSubscription(user.id);

    if (!subscriptionData?.subscription?.stripe_customer_id) {
      throw new ActionError("No active subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptionData.subscription.stripe_customer_id,
      return_url: PAYMENT_CONFIG_URLS.cancel_url,
    });

    if (!session.url) {
      throw new ActionError("Failed to create billing portal session");
    }

    console.log("🔗 Billing portal session created successfully");
    redirect(session.url);
  },
);
