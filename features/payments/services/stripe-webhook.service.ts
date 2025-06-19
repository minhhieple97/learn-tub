/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

import { env } from '@/env.mjs';
import { addCreditsToUser, createCreditTransaction } from '../queries/credit-queries';
import {
  getUserByStripeCustomerId,
  upsertUserSubscription,
  updateSubscriptionStatus,
  getPlanByStripePrice,
  createPaymentHistory,
  getSubscriptionPlan,
} from '../queries/subscription-queries';
import { PAYMENT_CONFIG_MODES, PAYMENT_CONFIG_TYPES, TRANSACTION_TYPES } from '@/config/constants';

const stripe = require('stripe')(env.STRIPE_SECRET_KEY);

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: any;
  };
};

const WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

export class StripeWebhookService {
  static constructEvent(body: string, signature: string): StripeEvent {
    try {
      return stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error}`);
    }
  }

  static async processWebhookEvent(event: StripeEvent): Promise<void> {
    console.log(`🎣 Processing webhook event: ${event.type}`);

    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await this.handleSubscriptionCreated(event.data.object);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await this.handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }
  }

  private static async handleCheckoutSessionCompleted(session: any): Promise<void> {
    const userId = session.metadata?.user_id;

    if (!userId) {
      throw new Error('User ID not found in session metadata');
    }

    console.log(`✅ Checkout completed for user: ${userId}, mode: ${session.mode}`);

    if (session.mode === PAYMENT_CONFIG_MODES.SUBSCRIPTION) {
      await this.handleSubscriptionCheckout(session);
    } else if (session.mode === PAYMENT_CONFIG_MODES.PAYMENT) {
      await this.handleCreditsPurchase(session);
    }

    // Create payment history record
    const paymentType =
      session.mode === PAYMENT_CONFIG_MODES.SUBSCRIPTION
        ? PAYMENT_CONFIG_TYPES.SUBSCRIPTION
        : PAYMENT_CONFIG_TYPES.CREDITS;
    const description =
      session.mode === PAYMENT_CONFIG_MODES.SUBSCRIPTION
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

  private static async handleSubscriptionCheckout(session: any): Promise<void> {
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
    await this.grantMonthlyCredits(userId, planId);

    console.log(`🎯 Subscription created/updated for user: ${userId}`);
  }

  private static async handleCreditsPurchase(session: any): Promise<void> {
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
      TRANSACTION_TYPES.PURCHASE,
      `Purchased ${creditsAmount} AI credits`,
      session.payment_intent,
    );

    if (transactionError) {
      throw new Error(`Failed to create credit transaction: ${transactionError.message}`);
    }

    console.log(`💰 ${creditsAmount} credits added to user: ${userId}`);
  }

  private static async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    // Skip if this is not a subscription invoice
    if (!invoice.subscription) {
      console.log('ℹ️ Non-subscription invoice payment succeeded, skipping credit grant');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customerId = subscription.customer;

    // Find user by customer ID
    const { data: userSubscription, error: userError } =
      await getUserByStripeCustomerId(customerId);

    if (userError || !userSubscription) {
      throw new Error(`User not found for customer: ${customerId}`);
    }

    // Only grant credits for recurring payments (not the initial payment)
    const isRecurringPayment = invoice.billing_reason === 'subscription_cycle';

    if (isRecurringPayment) {
      // Grant monthly credits for recurring payment
      await this.grantMonthlyCredits(userSubscription.user_id, userSubscription.plan_id);
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

  private static async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    // Skip if this is not a subscription invoice
    if (!invoice.subscription) {
      console.log('⚠️ Non-subscription invoice payment failed, skipping');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customerId = subscription.customer;

    // Find user by customer ID
    const { data: userSubscription, error: userError } =
      await getUserByStripeCustomerId(customerId);

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


  }

  private static async handleSubscriptionCreated(subscription: any): Promise<void> {
    console.log('🔍 Subscription created:', {
      id: subscription.id,
      customer: subscription.customer,
      status: subscription.status,
      items: subscription.items?.data?.length || 0,
    });

    const customerId = subscription.customer;

    // Step 1: Get plan ID from subscription items (with multiple fallback options)
    let planId: string | null = null;
    let priceId: string | null = null;

    // Try to get price ID from subscription items first
    if (subscription.items?.data?.[0]?.price?.id) {
      priceId = subscription.items.data[0].price.id;
    }
    // Fallback to the deprecated plan field for older Stripe integrations
    else if (subscription.plan?.id) {
      priceId = subscription.plan.id;
    }

    if (priceId) {
      const { data: plan } = await getPlanByStripePrice(priceId);
      planId = plan?.id || null;
      console.log(`🔍 Plan lookup for price ${priceId}:`, planId ? 'found' : 'not found');
    }

    if (!planId) {
      throw new Error(`Plan not found for price ID: ${priceId || 'unknown'}`);
    }

    // Step 2: Find user ID using multiple strategies
    let userId: string | null = null;
    const userLookupStrategies = [];

    // Strategy 1: Check subscription metadata (rarely populated for webhook events)
    if (subscription.metadata?.user_id) {
      userId = subscription.metadata.user_id;
      userLookupStrategies.push('subscription_metadata');
      console.log('🔍 Found user ID from subscription metadata:', userId);
    }

    // Strategy 2: Get customer from Stripe and check its metadata
    if (!userId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.metadata?.user_id) {
          userId = customer.metadata.user_id;
          userLookupStrategies.push('customer_metadata');
          console.log('🔍 Found user ID from customer metadata:', userId);
        }
        console.log('🔍 Customer metadata:', customer.metadata);
      } catch (error) {
        console.error('❌ Failed to retrieve customer:', error);
        userLookupStrategies.push('customer_metadata_failed');
      }
    }

    // Strategy 3: Look up existing subscription records for this customer
    if (!userId) {
      const { data: existingSubscription } = await getUserByStripeCustomerId(customerId);
      if (existingSubscription) {
        userId = existingSubscription.user_id;
        userLookupStrategies.push('existing_subscription');
        console.log('🔍 Found user ID from existing subscription:', userId);
      }
    }

    // Strategy 4: Check recent checkout sessions for this customer
    if (!userId) {
      try {
        const sessions = await stripe.checkout.sessions.list({
          customer: customerId,
          limit: 20, // Increased limit for better coverage
          expand: ['data.subscription'], // Include subscription data if available
        });

        console.log(`🔍 Found ${sessions.data.length} checkout sessions for customer`);

        // Look for the most recent session with user metadata
        const sessionWithMetadata = sessions.data
          .filter((s: any) => s.metadata?.user_id)
          .sort((a: any, b: any) => b.created - a.created)[0]; // Sort by creation time, newest first

        if (sessionWithMetadata) {
          userId = sessionWithMetadata.metadata.user_id;
          userLookupStrategies.push('checkout_session');
          console.log('🔍 Found user ID from checkout session:', userId);
        }
      } catch (error) {
        console.error('❌ Failed to retrieve checkout sessions:', error);
        userLookupStrategies.push('checkout_session_failed');
      }
    }

    // Strategy 5: Check if this subscription is linked to an invoice with customer info
    if (!userId && subscription.latest_invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
        if (invoice.metadata?.user_id) {
          userId = invoice.metadata.user_id;
          userLookupStrategies.push('invoice_metadata');
          console.log('🔍 Found user ID from invoice metadata:', userId);
        }
      } catch (error) {
        console.error('❌ Failed to retrieve latest invoice:', error);
        userLookupStrategies.push('invoice_metadata_failed');
      }
    }

    console.log('🔍 User lookup strategies tried:', userLookupStrategies);

    if (!userId) {
      const errorMessage = `User ID not found for customer: ${customerId}. Tried strategies: ${userLookupStrategies.join(', ')}`;
      console.error('❌', errorMessage);
      throw new Error(errorMessage);
    }

    // Step 3: Create or update subscription record
    console.log(`🔄 Creating/updating subscription for user ${userId}, plan ${planId}`);
    const { error: subscriptionError } = await upsertUserSubscription(userId, planId, subscription);

    if (subscriptionError) {
      throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
    }

    // Step 4: Grant initial monthly credits
    try {
      await this.grantMonthlyCredits(userId, planId);
      console.log(`💰 Monthly credits granted for user: ${userId}`);
    } catch (error) {
      console.error('❌ Failed to grant monthly credits:', error);
      // Don't throw error here as the subscription was created successfully
      // Credits can be granted manually or via retry mechanism
    }

    console.log(
      `🎉 Subscription successfully created for user: ${userId}, subscription: ${subscription.id}`,
    );
  }

  private static async handleSubscriptionUpdated(subscription: any): Promise<void> {
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

  private static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    // Update subscription status to canceled
    const { error } = await updateSubscriptionStatus(subscription.id, 'canceled');

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }

    console.log(`❌ Subscription canceled: ${subscription.id}`);
  }

  private static async grantMonthlyCredits(userId: string, planId: string): Promise<void> {
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
      TRANSACTION_TYPES.SUBSCRIPTION_GRANT,
      'Monthly subscription credit grant',
    );

    if (transactionError) {
      console.error('Failed to create credit transaction:', transactionError);
    }
  }
}
