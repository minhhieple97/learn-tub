import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { PaymentService } from '../../payment/payment.service';
import { SubscriptionService } from '../../subscription/subscription.service';
import { CacheService, CacheUtils } from '../../../config/cache';

import { WEBHOOK_CONFIG, PAYMENT_CONFIG } from '../../../config/constants';
import { AppConfigService } from '@/src/config';
import { STRIPE_BILLING_REASON } from '../constants';

export type IUpdateSubscriptionStatusParams = {
  subscriptionId: string;
  status: any;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
};

export type IHandleCheckoutCompletedParams = {
  userId: string;
  planId?: string | null;
  subscriptionData?: any | null;
  plan?: any | null;
  creditsAmount?: number | null;
  paymentHistoryData: any;
};

export type IHandleSubscriptionCreationParams = {
  userId: string;
  planId: string;
  subscriptionData: any;
  plan: any;
};

export type IProcessSubscriptionRenewalParams = {
  customerId: string;
  subscriptionId: string;
  invoice: Stripe.Invoice;
};

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly appConfigService: AppConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.stripe = new Stripe(this.appConfigService.stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  constructEvent(body: Buffer | string, signature: string): Stripe.Event {
    try {
      const webhookSecret = this.appConfigService.stripeWebhookSecret;
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Webhook signature verification failed: ${error.message}`,
        );
      }
      throw new Error('Webhook signature verification failed: Unknown error');
    }
  }

  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`🎣 Processing webhook event: ${event.type}`);

    switch (event.type) {
      case WEBHOOK_CONFIG.EVENTS.CHECKOUT_SESSION_COMPLETED:
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case WEBHOOK_CONFIG.EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case WEBHOOK_CONFIG.EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case WEBHOOK_CONFIG.EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await this.handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      case WEBHOOK_CONFIG.EVENTS.INVOICE_PAYMENT_FAILED:
        await this.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;

      case WEBHOOK_CONFIG.EVENTS.INVOICE_PAID:
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.log(`🤷 Unhandled event type: ${event.type}`);
    }
  }

  // Cache invalidation helper methods
  private async invalidateCacheOnCreditChange(
    userId: string,
    context: string,
  ): Promise<void> {
    await CacheUtils.safeInvalidate(
      () => this.cacheService.invalidateUserCacheOnCreditChange(userId),
      `${context} - user: ${userId}`,
      this.logger,
    );
  }

  private async invalidateCacheOnSubscriptionChange(
    userId: string,
    context: string,
  ): Promise<void> {
    await CacheUtils.safeInvalidate(
      () => this.cacheService.invalidateUserCacheOnSubscriptionChange(userId),
      `${context} - user: ${userId}`,
      this.logger,
    );
  }

  private async invalidateFullUserCache(
    userId: string,
    context: string,
  ): Promise<void> {
    await CacheUtils.safeInvalidate(
      () => this.cacheService.invalidateUserCache(userId),
      `${context} - user: ${userId}`,
      this.logger,
    );
  }

  private async invalidateCacheByCustomerId(
    customerId: string,
    context: string,
  ): Promise<void> {
    try {
      const userSub =
        await this.subscriptionService.getUserByStripeCustomerId(customerId);
      if (userSub) {
        await this.invalidateCacheOnSubscriptionChange(
          userSub.user_id,
          context,
        );
      } else {
        this.logger.warn(
          `User not found for customer ${customerId} during cache invalidation`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for customer ${customerId}:`,
        error,
      );
    }
  }

  // Helper method to extract customer ID from subscription
  private getCustomerIdFromSubscription(
    subscription: Stripe.Subscription,
  ): string {
    return typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;
  }

  private getCustomerIdFromInvoice(invoice: Stripe.Invoice): string {
    return typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id || '';
  }

  private extractSubscriptionData(subscription: Stripe.Subscription) {
    return {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id,
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      status: subscription.status,
    };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.metadata?.user_id;
    if (!userId) {
      throw new Error('User ID not found in session metadata');
    }
    this.logger.log(
      `✅ Checkout completed for user: ${userId}, mode: ${session.mode}`,
    );

    try {
      const paymentHistoryData = {
        user_id: userId,
        amount_cents: session.amount_total,
        currency: session.currency,
        payment_type:
          session.mode === PAYMENT_CONFIG.MODES.SUBSCRIPTION
            ? PAYMENT_CONFIG.TYPES.SUBSCRIPTION
            : PAYMENT_CONFIG.TYPES.CREDITS,
        status: 'completed' as const,
        description:
          session.mode === PAYMENT_CONFIG.MODES.SUBSCRIPTION
            ? 'Subscription purchase'
            : `Purchase of ${session.metadata?.credits_amount || 0} AI credits`,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null,
        stripe_invoice_id: null,
      };

      if (session.mode === PAYMENT_CONFIG.MODES.SUBSCRIPTION) {
        await this.handleSubscriptionCheckoutTransaction(
          session,
          paymentHistoryData,
        );
        return;
      }
      if (session.mode === PAYMENT_CONFIG.MODES.PAYMENT) {
        await this.handleCreditsPurchaseTransaction(
          session,
          paymentHistoryData,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to handle checkout session completed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private async handleSubscriptionCheckoutTransaction(
    session: Stripe.Checkout.Session,
    paymentHistoryData: any,
  ): Promise<void> {
    const { user_id: userId, plan_id: planId } = session.metadata;

    const { hasActivePlan } =
      await this.subscriptionService.checkUserHasActivePlan(userId, planId);
    if (hasActivePlan) {
      this.logger.log(
        `⚠️ User ${userId} already has active plan ${planId}. Skipping.`,
      );
      return;
    }

    if (typeof session.subscription !== 'string') {
      this.logger.error('Subscription ID not found in session');
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription,
    );
    const subscriptionData = this.extractSubscriptionData(subscription);
    const plan = await this.subscriptionService.getSubscriptionPlanById(planId);

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    await this.handleCheckoutCompletedTransactionTyped({
      userId,
      planId,
      subscriptionData,
      plan,
      creditsAmount: null,
      paymentHistoryData,
    });

    await this.invalidateCacheOnSubscriptionChange(
      userId,
      'Subscription checkout',
    );
    this.logger.log(`🎯 Subscription checkout completed for user: ${userId}`);
  }

  private async handleCreditsPurchaseTransaction(
    session: Stripe.Checkout.Session,
    paymentHistoryData: any,
  ): Promise<void> {
    const { user_id: userId, credits_amount: creditsAmountStr } =
      session.metadata;
    const creditsAmount = parseInt(creditsAmountStr);

    if (!creditsAmount || creditsAmount <= 0) {
      throw new Error('Invalid credits amount');
    }

    await this.handleCheckoutCompletedTransactionTyped({
      userId,
      planId: null,
      subscriptionData: null,
      plan: null,
      creditsAmount,
      paymentHistoryData,
    });

    await this.invalidateCacheOnCreditChange(userId, 'Credit purchase');
    this.logger.log(`💰 ${creditsAmount} credits added to user: ${userId}`);
  }

  private async updateSubscriptionStatusTyped(
    params: IUpdateSubscriptionStatusParams,
  ): Promise<any> {
    return this.subscriptionService.updateSubscriptionStatus(
      params.subscriptionId,
      params.status,
      params.currentPeriodStart,
      params.currentPeriodEnd,
      params.cancelAtPeriodEnd,
    );
  }

  private async handleCheckoutCompletedTransactionTyped(
    params: IHandleCheckoutCompletedParams,
  ): Promise<any> {
    return this.subscriptionService.handleCheckoutCompletedTransaction(
      params.userId,
      params.planId,
      params.subscriptionData,
      params.plan,
      params.creditsAmount,
      params.paymentHistoryData,
    );
  }



  private async processSubscriptionRenewalTransactionTyped(
    params: IProcessSubscriptionRenewalParams,
  ): Promise<void> {
    return this.subscriptionService.processSubscriptionRenewalTransaction(
      params.customerId,
      params.subscriptionId,
      params.invoice,
    );
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId = this.getCustomerIdFromSubscription(subscription);
    const status =
      subscription.status === 'canceled' ? 'cancelled' : subscription.status;

    await this.updateSubscriptionStatusTyped({
      subscriptionId: subscription.id,
      status: status as any,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    await this.invalidateCacheByCustomerId(customerId, 'Subscription update');

    if (subscription.cancel_at_period_end) {
      this.logger.log(
        `🚫 Subscription marked for cancellation: ${subscription.id}`,
      );
      await this.subscriptionService.handleSubscriptionCancellation(
        customerId,
        subscription.id,
      );
    }
    this.logger.log(`📝 Subscription updated: ${subscription.id}`);
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId = this.getCustomerIdFromSubscription(subscription);

    await this.updateSubscriptionStatusTyped({
      subscriptionId: subscription.id,
      status: 'cancelled',
    });

    await this.invalidateCacheByCustomerId(customerId, 'Subscription deletion');
    this.logger.log(`❌ Subscription deleted: ${subscription.id}`);
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (!invoice.subscription) {
      this.logger.log(
        'ℹ️ Non-subscription invoice payment succeeded, skipping.',
      );
      return;
    }
    const customerId = this.getCustomerIdFromInvoice(invoice);
    const userSub =
      await this.subscriptionService.getUserByStripeCustomerId(customerId);
    if (!userSub) throw new Error(`User not found for customer: ${customerId}`);

    try {
      await this.paymentService.createPaymentHistoryTransaction({
        userId: userSub.user_id,
        amountCents: invoice.amount_paid,
        currency: invoice.currency,
        paymentType: 'subscription_renewal',
        status: 'completed',
        description: `Subscription payment - ${invoice.billing_reason || 'cycle'}`,
        stripeInvoiceId: invoice.id,
      });

      await this.invalidateCacheOnSubscriptionChange(
        userSub.user_id,
        'Payment success',
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to create payment history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (!invoice.subscription) {
      this.logger.log('ℹ️ Non-subscription invoice payment failed, skipping.');
      return;
    }
    const customerId = this.getCustomerIdFromInvoice(invoice);
    const userSub =
      await this.subscriptionService.getUserByStripeCustomerId(customerId);
    if (!userSub) {
      this.logger.error(`User not found for customer: ${customerId}`);
      return;
    }

    try {
      await this.paymentService.createPaymentHistoryTransaction({
        userId: userSub.user_id,
        amountCents: invoice.amount_due,
        currency: invoice.currency,
        paymentType: 'subscription_renewal',
        status: 'failed',
        description: 'Failed subscription payment',
        stripeInvoiceId: invoice.id,
      });

      await this.invalidateCacheOnSubscriptionChange(
        userSub.user_id,
        'Payment failure',
      );
      this.logger.log(
        `❌ Subscription payment failed for user: ${userSub.user_id}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to create payment history for failed payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.billing_reason !== STRIPE_BILLING_REASON.SUBSCRIPTION_CYCLE) {
      this.logger.log(
        `ℹ️ Skipping invoice.paid for reason: ${invoice.billing_reason}`,
      );
      return;
    }
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;
    if (!subscriptionId) {
      this.logger.log('ℹ️ Non-subscription invoice paid, skipping renewal.');
      return;
    }
    const customerId = this.getCustomerIdFromInvoice(invoice);

    try {
      await this.processSubscriptionRenewalTransactionTyped({
        customerId,
        subscriptionId,
        invoice,
      });

     
      const userSub =
        await this.subscriptionService.getUserByStripeCustomerId(customerId);
      if (userSub) {
        await this.invalidateFullUserCache(
          userSub.user_id,
          'Subscription renewal',
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to process subscription renewal: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
