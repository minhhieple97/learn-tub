/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

import { env } from '@/env.mjs';
import {
  createCreditBucket,
  createCreditTransaction,
  expireCreditBucketsByUserSubscriptionId,
  bulkCreateCreditTransactions,
  markCreditBucketsAsCancelled,
  getUserByStripeCustomerId,
  upsertUserSubscription,
  updateSubscriptionStatus,
  getPlanByStripePrice,
  createPaymentHistory,
  getSubscriptionPlanById,
  checkUserHasActivePlan,
  getActiveSubscriptionByStripeIds,
  expireUserSubscription,
  createNewUserSubscription,
  updateSubscriptionCancellation,
  cancelActiveFreePlan,
} from '../queries';
import {
  PAYMENT_CONFIG_MODES,
  PAYMENT_CONFIG_TYPES,
  CREDIT_EXPIRATION_CONFIG,
} from '@/config/constants';
import { STRIPE_BILLING_REASON, PLAN_ID_MAPPING } from '../constants';
import { IStripeSubscription, IStripeInvoice } from '../types';
import { ICreditTransactionType } from '@/types';

const stripe = require('stripe')(env.STRIPE_SECRET_KEY);

type IStripeEvent = {
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
  INVOICE_PAID: 'invoice.paid',
} as const;

export class StripeWebhookService {
  static constructEvent(body: string, signature: string): IStripeEvent {
    try {
      return stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error}`);
    }
  }

  static async processWebhookEvent(event: IStripeEvent): Promise<void> {
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

      case WEBHOOK_EVENTS.INVOICE_PAID:
        await this.handleInvoicePaid(event.data.object);
        break;

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }
  }

  private static calculateExpirationDate(days: number | null): string | null {
    if (days === null) return null;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate.toISOString();
  }

  private static async getSubscriptionDataWithPlan(customerId: string, subscriptionId: string) {
    const { data: currentSubscription, error: subscriptionError } =
      await getActiveSubscriptionByStripeIds(customerId, subscriptionId);

    if (subscriptionError || !currentSubscription || !currentSubscription.subscription_plans) {
      return { currentSubscription: null, plan: null, error: subscriptionError };
    }

    return {
      currentSubscription,
      plan: currentSubscription.subscription_plans,
      error: null,
    };
  }

  private static extractSubscriptionData(subscription: IStripeSubscription) {
    const firstItem = subscription.items?.data?.[0];
    const currentPeriodStart = firstItem?.current_period_start;
    const currentPeriodEnd = firstItem?.current_period_end;

    return {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };
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

    const { hasActivePlan, error: checkError } = await checkUserHasActivePlan(userId, planId);

    if (checkError) {
      console.error(`❌ Error checking active plan for user ${userId}:`, checkError);
      throw new Error(`Failed to check existing subscription: ${checkError.message}`);
    }

    if (hasActivePlan) {
      console.log(
        `⚠️ User ${userId} already has an active subscription to plan ${planId}. Skipping subscription creation.`,
      );
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const subscriptionData = this.extractSubscriptionData(subscription);

    const { data: userSubscription, error: subscriptionError } = await upsertUserSubscription(
      userId,
      planId,
      subscriptionData,
    );

    if (subscriptionError) {
      throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
    }

    const userSubscriptionId = userSubscription?.[0]?.id;
    await this.grantMonthlyCredits(userId, planId, userSubscriptionId);

    const freePlanId = PLAN_ID_MAPPING.FREE;
    if (planId !== freePlanId) {
      try {
        const { data: cancelledFreePlan, error: cancelError } = await cancelActiveFreePlan(
          userId,
          freePlanId,
        );

        if (cancelError) {
          console.error(`⚠️ Failed to cancel active free plan for user ${userId}:`, cancelError);
        } else if (cancelledFreePlan && cancelledFreePlan.length > 0) {
          console.log(`🚫 Cancelled active free plan for user: ${userId}`);
        }
      } catch (error) {
        console.error(`⚠️ Error cancelling active free plan for user ${userId}:`, error);
      }
    }

    console.log(`🎯 Subscription created/updated for user: ${userId}`);
  }

  private static async handleCreditsPurchase(session: any): Promise<void> {
    const userId = session.metadata.user_id;
    const creditsAmount = parseInt(session.metadata.credits_amount);

    if (!creditsAmount || creditsAmount <= 0) {
      throw new Error('Invalid credits amount in session metadata');
    }

    const expiresAt = this.calculateExpirationDate(CREDIT_EXPIRATION_CONFIG.PURCHASE_DAYS);

    const { error: bucketError } = await createCreditBucket({
      userId,
      creditsTotal: creditsAmount,
      sourceType: 'purchase',
      description: `Purchased ${creditsAmount} AI credits`,
      expiresAt,
      metadata: {
        stripe_payment_intent_id: session.payment_intent,
        stripe_session_id: session.id,
        purchase_date: new Date().toISOString(),
        amount_paid_cents: session.amount_total,
        currency: session.currency,
      },
    });

    if (bucketError) {
      throw new Error(`Failed to create credit bucket: ${bucketError.message}`);
    }

    const { error: transactionError } = await createCreditTransaction(
      userId,
      creditsAmount,
      'purchase',
      `Purchased ${creditsAmount} AI credits`,
      session.payment_intent,
    );

    if (transactionError) {
      console.error('Failed to create credit transaction:', transactionError);
    }

    console.log(`💰 ${creditsAmount} credits added to user: ${userId} (expires: ${expiresAt})`);
  }

  private static async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    if (!invoice.subscription) {
      console.log('ℹ️ Non-subscription invoice payment succeeded, skipping credit grant');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customerId = subscription.customer;

    const { data: userSubscription, error: userError } =
      await getUserByStripeCustomerId(customerId);

    if (userError || !userSubscription) {
      throw new Error(`User not found for customer: ${customerId}`);
    }

    const isRecurringPayment = invoice.billing_reason === 'subscription_cycle';

    if (isRecurringPayment) {
      await this.grantMonthlyCredits(
        userSubscription.user_id,
        userSubscription.plan_id,
        userSubscription.id,
      );
      console.log(`🔄 Monthly credits granted for user: ${userSubscription.user_id}`);
    }

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
  }

  private static async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    if (!invoice.subscription) {
      console.log('ℹ️ Non-subscription invoice payment failed, skipping');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customerId = subscription.customer;

    const { data: userSubscription, error: userError } =
      await getUserByStripeCustomerId(customerId);

    if (userError || !userSubscription) {
      console.error(`User not found for customer: ${customerId}`);
      return;
    }

    await createPaymentHistory(
      userSubscription.user_id,
      invoice.amount_due,
      invoice.currency,
      'subscription_renewal',
      'failed',
      'Failed subscription payment',
      undefined,
      invoice.id,
    );

    console.log(`❌ Subscription payment failed for user: ${userSubscription.user_id}`);
  }

  private static async handleSubscriptionCreated(subscription: IStripeSubscription): Promise<void> {
    const customerId = subscription.customer;

    let planId: string | null = null;
    let priceId: string | null = null;

    if (subscription.items?.data?.[0]?.price?.id) {
      priceId = subscription.items.data[0].price.id;
    }

    if (priceId) {
      const { data: plan } = await getPlanByStripePrice(priceId);
      planId = plan?.id || null;
      console.log(`🔍 Plan lookup for price ${priceId}:`, planId ? 'found' : 'not found');
    }

    if (!planId) {
      throw new Error(`Plan not found for price ID: ${priceId || 'unknown'}`);
    }

    let userId: string | null = null;
    const userLookupStrategies = [];

    if (subscription.metadata?.user_id) {
      userId = subscription.metadata.user_id;
      userLookupStrategies.push('subscription_metadata');
      console.log('🔍 Found user ID from subscription metadata:', userId);
    }

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

    if (!userId) {
      const { data: existingSubscription } = await getUserByStripeCustomerId(customerId);
      if (existingSubscription) {
        userId = existingSubscription.user_id;
        userLookupStrategies.push('existing_subscription');
        console.log('🔍 Found user ID from existing subscription:', userId);
      }
    }

    if (!userId) {
      try {
        const sessions = await stripe.checkout.sessions.list({
          customer: customerId,
          limit: 20,
          expand: ['data.subscription'],
        });

        console.log(`🔍 Found ${sessions.data.length} checkout sessions for customer`);

        const sessionWithMetadata = sessions.data
          .filter((s: any) => s.metadata?.user_id)
          .sort((a: any, b: any) => b.created - a.created)[0];

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

    // Check if user already has an active subscription to this plan
    const { hasActivePlan, error: checkError } = await checkUserHasActivePlan(userId, planId);

    if (checkError) {
      console.error(`❌ Error checking active plan for user ${userId}:`, checkError);
      throw new Error(`Failed to check existing subscription: ${checkError.message}`);
    }

    if (hasActivePlan) {
      console.log(
        `⚠️ User ${userId} already has an active subscription to plan ${planId}. Skipping subscription creation.`,
      );
      return;
    }

    console.log(`🔄 Creating/updating subscription for user ${userId}, plan ${planId}`);
    const subscriptionData = this.extractSubscriptionData(subscription);

    const { data: userSubscription, error: subscriptionError } = await upsertUserSubscription(
      userId,
      planId,
      subscriptionData,
    );

    if (subscriptionError) {
      throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
    }

    try {
      const userSubscriptionId = userSubscription?.[0]?.id;
      await this.grantMonthlyCredits(userId, planId, userSubscriptionId);
      console.log(`💰 Monthly credits granted for user: ${userId}`);
    } catch (error) {
      console.error('❌ Failed to grant monthly credits:', error);
    }

    const freePlanId = PLAN_ID_MAPPING.FREE;
    if (planId !== freePlanId) {
      try {
        const { data: cancelledFreePlan, error: cancelError } = await cancelActiveFreePlan(
          userId,
          freePlanId,
        );

        if (cancelError) {
          console.error(`⚠️ Failed to cancel active free plan for user ${userId}:`, cancelError);
        } else if (cancelledFreePlan && cancelledFreePlan.length > 0) {
          console.log(`🚫 Cancelled active free plan for user: ${userId}`);
        }
      } catch (error) {
        console.error(`⚠️ Error cancelling active free plan for user ${userId}:`, error);
      }
    }

    console.log(
      `🎉 Subscription successfully created for user: ${userId}, subscription: ${subscription.id}`,
    );
  }

  private static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    // First update the subscription status
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

    // Handle subscription cancellation
    if (subscription.cancel_at_period_end) {
      console.log(`🚫 Subscription marked for cancellation: ${subscription.id}`);

      try {
        // Update the user_subscriptions table with cancellation info
        const { data: updatedSubscription, error: updateError } =
          await updateSubscriptionCancellation(subscription.customer, subscription.id, true);

        if (updateError) {
          console.error('❌ Failed to update subscription cancellation:', updateError);
        } else if (updatedSubscription) {
          // Mark credit buckets as cancelled_plan
          const { error: bucketError } = await markCreditBucketsAsCancelled(updatedSubscription.id);

          if (bucketError) {
            console.error('❌ Failed to mark credit buckets as cancelled:', bucketError);
          } else {
            console.log(
              `✅ Marked credit buckets as cancelled for subscription: ${updatedSubscription.id}`,
            );
          }
        }
      } catch (error) {
        console.error('❌ Error handling subscription cancellation:', error);
      }
    }

    console.log(`📝 Subscription updated: ${subscription.id}`);
  }

  private static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const { error } = await updateSubscriptionStatus(subscription.id, 'cancelled');

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }

    console.log(`❌ Subscription canceled: ${subscription.id}`);
  }

  private static async grantMonthlyCredits(
    userId: string,
    planId: string,
    userSubscriptionId?: string,
  ): Promise<void> {
    const { data: plan } = await getSubscriptionPlanById(planId);

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const expiresAt = this.calculateExpirationDate(CREDIT_EXPIRATION_CONFIG.SUBSCRIPTION_DAYS);

    const [bucketResult, transactionResult] = await Promise.allSettled([
      createCreditBucket({
        userId,
        creditsTotal: plan.credits_per_month,
        sourceType: 'subscription',
        description: `Monthly subscription credits - ${plan.name}`,
        expiresAt,
        metadata: {
          subscription_plan_id: planId,
          plan_name: plan.name,
          granted_date: new Date().toISOString(),
          credits_per_month: plan.credits_per_month,
        },
        user_subscription_id: userSubscriptionId,
      }),
      createCreditTransaction(
        userId,
        plan.credits_per_month,
        'subscription_grant',
        `Monthly subscription credit grant - ${plan.name}`,
      ),
    ]);

    if (bucketResult.status === 'rejected') {
      throw new Error(`Failed to create subscription credit bucket: ${bucketResult.reason}`);
    }

    if (bucketResult.status === 'fulfilled' && bucketResult.value.error) {
      throw new Error(
        `Failed to create subscription credit bucket: ${bucketResult.value.error.message}`,
      );
    }

    if (transactionResult.status === 'rejected') {
      console.error('Failed to create credit transaction:', transactionResult.reason);
    } else if (transactionResult.status === 'fulfilled' && transactionResult.value.error) {
      console.error('Failed to create credit transaction:', transactionResult.value.error);
    }

    console.log(
      `🎁 ${plan.credits_per_month} subscription credits granted to user: ${userId} (expires: ${expiresAt})`,
    );
  }

  private static async handleInvoicePaid(invoice: IStripeInvoice): Promise<void> {
    const startTime = Date.now();
    console.log(`💰 Invoice paid: ${invoice.id}`);

    if (invoice.billing_reason !== STRIPE_BILLING_REASON.SUBSCRIPTION_CYCLE) {
      console.log(`ℹ️ Skipping invoice.paid for billing_reason: ${invoice.billing_reason}`);
      return;
    }

    const subscriptionId = invoice.parent?.subscription_details?.subscription;
    if (!subscriptionId) {
      console.log('ℹ️ Non-subscription invoice paid, skipping renewal processing');
      return;
    }

    console.log(`🔄 Processing subscription renewal for invoice: ${invoice.id}`);

    try {
      const [subscription, subscriptionData] = await Promise.all([
        stripe.subscriptions.retrieve(subscriptionId),
        this.getSubscriptionDataWithPlan(invoice.customer, subscriptionId),
      ]);

      if (subscriptionData.error || !subscriptionData.currentSubscription) {
        console.error(
          `❌ Active subscription not found for customer: ${invoice.customer}, subscription: ${subscriptionId}`,
        );
        throw new Error(
          `Active subscription not found: ${subscriptionData.error?.message || 'Unknown error'}`,
        );
      }

      const { currentSubscription, plan } = subscriptionData;

      console.log(`✅ Found active subscription for user: ${currentSubscription.user_id}`);

      const periodStart = new Date(invoice.period_start * 1000);
      const periodEnd = new Date(invoice.period_end * 1000);
      const customerId = subscription.customer;

      const [expireResult, bucketExpireResult] = await Promise.all([
        expireUserSubscription(currentSubscription.id),
        expireCreditBucketsByUserSubscriptionId(currentSubscription.id),
      ]);

      if (expireResult.error) {
        throw new Error(`Failed to expire current subscription: ${expireResult.error.message}`);
      }

      const { data: newSubscription, error: createError } = await createNewUserSubscription(
        currentSubscription.user_id,
        currentSubscription.plan_id,
        customerId,
        subscriptionId,
        periodStart,
        periodEnd,
      );

      if (createError || !newSubscription) {
        throw new Error(`Failed to create new subscription: ${createError?.message}`);
      }

      console.log(`🎯 Created new subscription record: ${newSubscription.id}`);

      const parallelOperations: Promise<any>[] = [];

      if (bucketExpireResult.error) {
        console.error('❌ Failed to expire credit buckets:', bucketExpireResult.error);
      } else if (bucketExpireResult.expiredBuckets.length > 0) {
        const transactions = bucketExpireResult.expiredBuckets
          .filter(
            (bucket: { credits_remaining: number | null }) =>
              bucket.credits_remaining && bucket.credits_remaining > 0,
          )
          .map(
            (bucket: {
              user_id: string;
              credits_remaining: number | null;
              description: string | null;
            }) => ({
              user_id: bucket.user_id,
              amount: -(bucket.credits_remaining || 0),
              type: 'monthly_reset' as ICreditTransactionType,
              description: `Credits expired during subscription renewal - ${bucket.description || 'Subscription credits'}`,
            }),
          );

        if (transactions.length > 0) {
          parallelOperations.push(
            bulkCreateCreditTransactions(transactions).catch((error) => {
              console.error('❌ Failed to create bulk credit transactions:', error);
              return { error };
            }),
          );
        }

        console.log(
          `🔄 Expired ${bucketExpireResult.expiredBuckets.length} credit buckets from previous subscription`,
        );
      }

      if (plan) {
        parallelOperations.push(
          this.grantMonthlyCredits(
            currentSubscription.user_id,
            currentSubscription.plan_id,
            newSubscription.id,
          ).catch((error) => {
            console.error('❌ Failed to grant monthly credits:', error);
            return { error };
          }),
        );
      }

      parallelOperations.push(
        createPaymentHistory(
          currentSubscription.user_id,
          invoice.amount_paid,
          invoice.currency,
          'subscription_renewal',
          'completed',
          `Subscription renewal - ${plan?.name || 'Unknown Plan'}`,
          undefined,
          invoice.id,
        ).catch((error) => {
          console.error('❌ Failed to create payment history:', error);
          return { error };
        }),
      );

      const results = await Promise.allSettled(parallelOperations);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Parallel operation ${index} failed:`, result.reason);
        }
      });

      console.log(`💰 Granted monthly credits for renewed subscription`);

      const processingTime = Date.now() - startTime;
      console.log(
        `🎉 Subscription renewal completed successfully for user: ${currentSubscription.user_id} (${processingTime}ms)`,
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Failed to process subscription renewal (${processingTime}ms):`, error);
      throw error;
    }
  }
}
