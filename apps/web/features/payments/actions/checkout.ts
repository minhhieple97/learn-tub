"use server";

import { ActionError, authAction } from "@/lib/safe-action";
import {
  CreateCheckoutSessionSchema,
  PurchaseCreditsSchema,
  PurchaseCreditPackageSchema,
} from "../schemas";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import { checkProfileByUserId } from "@/lib/require-auth";
import {
  getSubscriptionPlan,
  getUserSubscription,
  getUserStripeCustomerId,
} from "../queries";
import {
  PAYMENT_CONFIG_MODES,
  PAYMENT_CONFIG_TYPES,
  PAYMENT_CONFIG_URLS,
} from "@/config/constants";

import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const createCheckoutSessionAction = authAction
  .inputSchema(CreateCheckoutSessionSchema)
  .action(async ({ parsedInput: { productId }, ctx: { user } }) => {
    const profile = await checkProfileByUserId(user.id);

    const { data: plan, error: planError } =
      await getSubscriptionPlan(productId);

    if (planError || !plan) {
      console.error("❌ Database error:", planError);
      throw new ActionError("Invalid subscription plan");
    }

    const { data: existingSubscription } = await getUserSubscription(
      profile.id,
    );

    let customerId: string;

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: profile.id,
        },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: PAYMENT_CONFIG_MODES.SUBSCRIPTION,
      ...PAYMENT_CONFIG_URLS,
      metadata: {
        user_id: profile.id,
        plan_id: plan.id,
        payment_type: PAYMENT_CONFIG_TYPES.SUBSCRIPTION,
      },
    });

    if (!session.url) {
      throw new ActionError("Failed to create checkout session");
    }

    redirect(session.url);
  });

export const purchaseCreditPackageAction = authAction
  .inputSchema(PurchaseCreditPackageSchema)
  .action(
    async ({
      parsedInput: { packageId, credits, productId },
      ctx: { user },
    }) => {
      const profile = await checkProfileByUserId(user.id);

      const { data: subscription } = await getUserStripeCustomerId(profile.id);

      let customerId: string;

      if (subscription?.stripe_customer_id) {
        customerId = subscription.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: profile.id,
          },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: productId,
            quantity: 1,
          },
        ],
        mode: PAYMENT_CONFIG_MODES.PAYMENT,
        ...PAYMENT_CONFIG_URLS,
        metadata: {
          user_id: profile.id,
          package_id: packageId,
          credits_amount: credits.toString(),
          payment_type: PAYMENT_CONFIG_TYPES.CREDITS,
          purchase_type: "credit_package",
        },
      });

      if (!session.url) {
        throw new ActionError("Failed to create checkout session");
      }

      redirect(session.url);
    },
  );

export const purchaseCreditsAction = authAction
  .inputSchema(PurchaseCreditsSchema)
  .action(async ({ parsedInput: { amount }, ctx: { user } }) => {
    const profile = await checkProfileByUserId(user.id);

    const priceInCents = Math.ceil((amount / 200) * 100);

    const { data: subscription } = await getUserStripeCustomerId(profile.id);

    let customerId: string;

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: profile.id,
        },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${amount} AI Credits`,
              description: `Purchase ${amount} additional AI credits`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: PAYMENT_CONFIG_MODES.PAYMENT,
      ...PAYMENT_CONFIG_URLS,
      metadata: {
        user_id: profile.id,
        credits_amount: amount.toString(),
        payment_type: PAYMENT_CONFIG_TYPES.CREDITS,
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    redirect(session.url);
  });
