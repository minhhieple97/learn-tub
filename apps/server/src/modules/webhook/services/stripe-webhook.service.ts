import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PaymentService } from '../../payment/payment.service';
import { CreditService } from '../../credit/credit.service';

import { STRIPE_BILLING_REASON, PLAN_ID_MAPPING } from '../constants';
import { SubscriptionService } from 'src/modules/subscription/subscription.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly stripe: Stripe;
  private readonly webhookEvents: any;
  private readonly paymentConfig: any;
  private readonly creditConfig: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly creditService: CreditService,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('stripe.secretKey'),
      {
        apiVersion: '2023-10-16',
      },
    );
    this.webhookEvents = this.configService.get('webhook.events');
    this.paymentConfig = this.configService.get('payment');
    this.creditConfig = this.configService.get('credit');
  }

  constructEvent(body: Buffer | string, signature: string): Stripe.Event {
    try {
      const webhookSecret = this.configService.get<string>(
        'stripe.webhookSecret',
      );
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
      case this.webhookEvents.checkoutSessionCompleted:
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case this.webhookEvents.customerSubscriptionCreated:
        await this.handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case this.webhookEvents.customerSubscriptionUpdated:
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case this.webhookEvents.customerSubscriptionDeleted:
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case this.webhookEvents.invoicePaymentSucceeded:
        await this.handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      case this.webhookEvents.invoicePaymentFailed:
        await this.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;

      case this.webhookEvents.invoicePaid:
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.log(`🤷 Unhandled event type: ${event.type}`);
    }
  }

  private calculateExpirationDate(days: number | null): Date | null {
    if (days === null) return null;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate;
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

    if (session.mode === this.paymentConfig.modes.subscription) {
      await this.handleSubscriptionCheckout(session);
    } else if (session.mode === this.paymentConfig.modes.payment) {
      await this.handleCreditsPurchase(session);
    }

    await this.paymentService.createPaymentHistory({
      userId,
      amountCents: session.amount_total,
      currency: session.currency,
      paymentType:
        session.mode === this.paymentConfig.modes.subscription
          ? this.paymentConfig.types.subscription
          : this.paymentConfig.types.credits,
      status: 'completed',
      description:
        session.mode === this.paymentConfig.modes.subscription
          ? 'Subscription purchase'
          : `Purchase of ${session.metadata?.credits_amount || 0} AI credits`,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
    });
  }

  private async handleSubscriptionCheckout(
    session: Stripe.Checkout.Session,
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
    const userSubscription =
      await this.subscriptionService.upsertUserSubscription(
        userId,
        planId,
        subscriptionData,
      );

    const plan = await this.subscriptionService.getSubscriptionPlanById(planId);
    if (plan) {
      await this.creditService.grantMonthlyCredits(
        userId,
        plan,
        userSubscription.id,
      );
    }

    if (planId !== PLAN_ID_MAPPING.FREE) {
      await this.subscriptionService.cancelActiveFreePlan(userId);
    }

    this.logger.log(`🎯 Subscription created/updated for user: ${userId}`);
  }

  private async handleCreditsPurchase(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const { user_id: userId, credits_amount: creditsAmountStr } =
      session.metadata;
    const creditsAmount = parseInt(creditsAmountStr);

    if (!creditsAmount || creditsAmount <= 0) {
      throw new Error('Invalid credits amount');
    }

    const expiresAt = this.calculateExpirationDate(
      this.creditConfig.expiration.purchaseDays,
    );
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null;

    await this.creditService.createCreditBucket({
      userId,
      creditsTotal: creditsAmount,
      sourceType: 'purchase',
      description: `Purchased ${creditsAmount} AI credits`,
      expiresAt,
      metadata: {
        stripe_payment_intent_id: paymentIntentId,
        stripe_session_id: session.id,
      },
    });

    await this.creditService.createCreditTransaction({
      userId,
      amount: creditsAmount,
      type: 'purchase',
      description: `Purchased ${creditsAmount} AI credits`,
      stripePaymentIntentId: paymentIntentId,
    });

    this.logger.log(`💰 ${creditsAmount} credits added to user: ${userId}`);
  }

  private async handleSubscriptionCreated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const priceId = subscription.items?.data?.[0]?.price?.id;
    if (!priceId) throw new Error('Price ID not found in subscription');

    const plan = await this.subscriptionService.getPlanByStripePrice(priceId);
    if (!plan) throw new Error(`Plan not found for price ID: ${priceId}`);

    const userId = await this.findUserIdFromSubscription(subscription);
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    if (!userId)
      throw new Error(`User ID not found for customer: ${customerId}`);

    const { hasActivePlan } =
      await this.subscriptionService.checkUserHasActivePlan(userId, plan.id);
    if (hasActivePlan) {
      this.logger.log(
        `⚠️ User ${userId} already has active plan ${plan.id}. Skipping.`,
      );
      return;
    }

    const subscriptionData = this.extractSubscriptionData(subscription);
    const userSubscription =
      await this.subscriptionService.upsertUserSubscription(
        userId,
        plan.id,
        subscriptionData,
      );
    await this.creditService.grantMonthlyCredits(
      userId,
      plan,
      userSubscription.id,
    );

    if (plan.id !== PLAN_ID_MAPPING.FREE) {
      await this.subscriptionService.cancelActiveFreePlan(userId);
    }
    this.logger.log(
      `🎉 Sub created for user: ${userId}, sub: ${subscription.id}`,
    );
  }

  private async findUserIdFromSubscription(
    subscription: Stripe.Subscription,
  ): Promise<string | null> {
    if (subscription.metadata?.user_id) {
      this.logger.log('🔍 Found user ID from subscription metadata');
      return subscription.metadata.user_id;
    }

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      this.logger.warn(`Stripe customer ${customerId} is deleted.`);
      return null;
    }

    if ((customer as Stripe.Customer).metadata?.user_id) {
      this.logger.log('🔍 Found user ID from customer metadata');
      return (customer as Stripe.Customer).metadata.user_id;
    }

    const existingUserSub =
      await this.subscriptionService.getUserByStripeCustomerId(customerId);
    if (existingUserSub) {
      this.logger.log('🔍 Found user ID from existing subscription');
      return existingUserSub.user_id;
    }

    return null;
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const status =
      subscription.status === 'canceled' ? 'cancelled' : subscription.status;

    await this.subscriptionService.updateSubscriptionStatus(
      subscription.id,
      status as any,
      subscription.current_period_start,
      subscription.current_period_end,
      subscription.cancel_at_period_end,
    );

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
    await this.subscriptionService.updateSubscriptionStatus(
      subscription.id,
      'cancelled',
    );
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
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer.id;
    const userSub =
      await this.subscriptionService.getUserByStripeCustomerId(customerId);
    if (!userSub) throw new Error(`User not found for customer: ${customerId}`);

    await this.paymentService.createPaymentHistory({
      userId: userSub.user_id,
      amountCents: invoice.amount_paid,
      currency: invoice.currency,
      paymentType: 'subscription_renewal',
      status: 'completed',
      description: `Subscription payment - ${invoice.billing_reason || 'cycle'}`,
      stripeInvoiceId: invoice.id,
    });
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (!invoice.subscription) {
      this.logger.log('ℹ️ Non-subscription invoice payment failed, skipping.');
      return;
    }
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer.id;

    const userSub =
      await this.subscriptionService.getUserByStripeCustomerId(customerId);
    if (!userSub) {
      this.logger.error(`User not found for customer: ${customerId}`);
      return;
    }
    await this.paymentService.createPaymentHistory({
      userId: userSub.user_id,
      amountCents: invoice.amount_due,
      currency: invoice.currency,
      paymentType: 'subscription_renewal',
      status: 'failed',
      description: 'Failed subscription payment',
      stripeInvoiceId: invoice.id,
    });
    this.logger.log(
      `❌ Subscription payment failed for user: ${userSub.user_id}`,
    );
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
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer.id;
    await this.subscriptionService.processSubscriptionRenewal(
      customerId,
      subscriptionId,
      invoice,
    );
  }
}
