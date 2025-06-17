import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { env } from '@/env.mjs';
import {
  addCreditsToUser,
  createCreditTransaction,
} from '@/features/payments/queries/credit-queries';
import {
  getUserByStripeCustomerId,
  upsertUserSubscription,
  updateSubscriptionStatus,
  getPlanByStripePrice,
  createPaymentHistory,
  getSubscriptionPlan,
} from '@/features/payments/queries/subscription-queries';

const stripe = require("stripe")(env.STRIPE_SECRET_KEY);

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: any;
  };
};

const WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: "checkout.session.completed",
  CUSTOMER_SUBSCRIPTION_CREATED: "customer.subscription.created",
  CUSTOMER_SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  CUSTOMER_SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  INVOICE_PAYMENT_SUCCEEDED: "invoice.payment_succeeded",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",
} as const;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: StripeEvent;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`🎣 Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object);
        break;

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`❌ Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata?.user_id;

  if (!userId) {
    throw new Error('User ID not found in session metadata');
  }

  console.log(`✅ Checkout completed for user: ${userId}, mode: ${session.mode}`);

  if (session.mode === 'subscription') {
    await handleSubscriptionCheckout(session);
  } else if (session.mode === 'payment') {
    await handleCreditsPurchase(session);
  }

  // Create payment history record
  const paymentType = session.mode === 'subscription' ? 'subscription' : 'credits';
  const description =
    session.mode === 'subscription'
      ? 'Subscription purchase'
      : `Purchase of ${session.metadata?.credits_amount || 0} AI credits`;

  await createPaymentHistory(
    userId,
    session.amount_total,
    session.currency,
    paymentType,
    'completed',
    description,
    session.payment_intent,
  );
}

async function handleSubscriptionCheckout(session: any) {
  const userId = session.metadata.user_id;
  const planId = session.metadata.plan_id;

  // Get the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update or create user subscription
  const { error: subscriptionError } = await upsertUserSubscription(userId, planId, subscription);

  if (subscriptionError) {
    throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
  }

  // Grant monthly credits
  await grantMonthlyCredits(userId, planId);

  console.log(`🎯 Subscription created/updated for user: ${userId}`);
}

async function handleCreditsPurchase(session: any) {
  const userId = session.metadata.user_id;
  const creditsAmount = parseInt(session.metadata.credits_amount);

  // Add credits to user account
  const { error: creditsError } = await addCreditsToUser(userId, creditsAmount);

  if (creditsError) {
    throw new Error(`Failed to add credits: ${creditsError.message}`);
  }

  // Create credit transaction record
  const { error: transactionError } = await createCreditTransaction(
    userId,
    creditsAmount,
    'purchase',
    `Purchased ${creditsAmount} AI credits`,
    session.payment_intent,
  );

  if (transactionError) {
    throw new Error(`Failed to create credit transaction: ${transactionError.message}`);
  }

  console.log(`💰 ${creditsAmount} credits added to user: ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  // Skip if this is not a subscription invoice
  if (!invoice.subscription) {
    console.log('ℹ️ Non-subscription invoice payment succeeded, skipping credit grant');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customerId = subscription.customer;

  // Find user by customer ID
  const { data: userSubscription, error: userError } = await getUserByStripeCustomerId(customerId);

  if (userError || !userSubscription) {
    throw new Error(`User not found for customer: ${customerId}`);
  }

  // Only grant credits for recurring payments (not the initial payment)
  const isRecurringPayment = invoice.billing_reason === 'subscription_cycle';

  if (isRecurringPayment) {
    // Grant monthly credits for recurring payment
    await grantMonthlyCredits(userSubscription.user_id, userSubscription.plan_id);
    console.log(`🔄 Monthly credits granted for user: ${userSubscription.user_id}`);
  }

  // Create payment history for all successful payments
  const paymentDescription = isRecurringPayment
    ? 'Monthly subscription renewal'
    : `Subscription payment - ${invoice.billing_reason || 'subscription_create'}`;

  await createPaymentHistory(
    userSubscription.user_id,
    invoice.amount_paid,
    invoice.currency,
    'subscription_renewal',
    'completed',
    paymentDescription,
    undefined,
    invoice.id,
  );

  console.log(
    `✅ Invoice payment processed for user: ${userSubscription.user_id}, amount: ${invoice.amount_paid}`,
  );
}

async function handleInvoicePaymentFailed(invoice: any) {
  // Skip if this is not a subscription invoice
  if (!invoice.subscription) {
    console.log('⚠️ Non-subscription invoice payment failed, skipping');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customerId = subscription.customer;

  // Find user by customer ID
  const { data: userSubscription, error: userError } = await getUserByStripeCustomerId(customerId);

  if (userError || !userSubscription) {
    throw new Error(`User not found for customer: ${customerId}`);
  }

  // Create payment history record for failed payment
  const description = `Failed subscription renewal payment - ${invoice.billing_reason || 'subscription_cycle'}`;

  await createPaymentHistory(
    userSubscription.user_id,
    invoice.amount_due,
    invoice.currency,
    'subscription_renewal',
    'failed',
    description,
    undefined,
    invoice.id,
  );

  // Log the failure for monitoring
  console.error(
    `💳 Payment failed for user: ${userSubscription.user_id}, invoice: ${invoice.id}, amount: ${invoice.amount_due}`,
  );

  // Note: We don't automatically cancel the subscription here as Stripe handles retries
  // The subscription status will be updated via subscription.updated event when Stripe changes it
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('🔍 Subscription created:', JSON.stringify(subscription, null, 2));

  const customerId = subscription.customer;

  // Step 1: Get plan ID from subscription items (this is always available)
  let planId: string | null = null;

  if (subscription.items?.data?.[0]?.price?.id) {
    const priceId = subscription.items.data[0].price.id;
    const { data: plan } = await getPlanByStripePrice(priceId);
    planId = plan?.id || null;
  }

  if (!planId) {
    throw new Error(`Plan not found for price ID: ${subscription.items?.data?.[0]?.price?.id}`);
  }

  // Step 2: Find user ID - since metadata might be empty, we need to get it from Stripe customer
  let userId: string | null = null;

  try {
    // Get the customer from Stripe to access its metadata
    const customer = await stripe.customers.retrieve(customerId);
    userId = (customer.metadata?.user_id as string) || null;
    console.log('🔍 Customer metadata:', customer.metadata);
  } catch (error) {
    console.error('❌ Failed to retrieve customer:', error);
  }

  // Step 3: If no user ID from customer metadata, try to find from existing subscriptions
  if (!userId) {
    const { data: existingSubscription } = await getUserByStripeCustomerId(customerId);
    if (existingSubscription) {
      userId = existingSubscription.user_id;
      console.log('🔍 Found user from existing subscription:', userId);
    }
  }

  // Step 4: If still no user ID, try to find by looking up recent checkout sessions
  if (!userId) {
    try {
      // Get recent checkout sessions for this customer
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 10,
      });

      // Find the most recent session with user metadata
      const sessionWithMetadata = sessions.data.find((s: any) => s.metadata?.user_id);
      if (sessionWithMetadata) {
        userId = sessionWithMetadata.metadata.user_id;
        console.log('🔍 Found user from checkout session:', userId);
      }
    } catch (error) {
      console.error('❌ Failed to retrieve checkout sessions:', error);
    }
  }

  if (!userId) {
    throw new Error(
      `User ID not found for customer: ${customerId}. Please check customer metadata.`,
    );
  }

  // Step 5: Create or update subscription record
  const { error: subscriptionError } = await upsertUserSubscription(userId, planId, subscription);

  if (subscriptionError) {
    throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
  }

  // Step 6: Grant initial monthly credits
  await grantMonthlyCredits(userId, planId);

  console.log(`🎉 Subscription created for user: ${userId}, subscription: ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription: any) {
  // Update subscription status in database
  const { error } = await updateSubscriptionStatus(
    subscription.id,
    subscription.status,
    subscription.current_period_start,
    subscription.current_period_end,
    subscription.cancel_at_period_end,
  );

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  console.log(`📝 Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: any) {
  // Update subscription status to canceled
  const { error } = await updateSubscriptionStatus(subscription.id, 'canceled');

  if (error) {
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }

  console.log(`❌ Subscription canceled: ${subscription.id}`);
}

async function grantMonthlyCredits(userId: string, planId: string) {
  // Get plan details
  const { data: plan } = await getSubscriptionPlan(planId);

  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  // Update user credits
  const { error: creditsError } = await addCreditsToUser(userId, plan.credits_per_month);

  if (creditsError) {
    throw new Error(`Failed to add credits: ${creditsError.message}`);
  }

  // Create credit transaction
  const { error: transactionError } = await createCreditTransaction(
    userId,
    plan.credits_per_month,
    'subscription_grant',
    'Monthly subscription credit grant',
  );

  if (transactionError) {
    console.error('Failed to create credit transaction:', transactionError);
  }
}
