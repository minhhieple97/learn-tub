import { Injectable, Logger } from '@nestjs/common';
import {
  subscription_plans,
  user_subscriptions,
  subscription_status,
} from '@prisma/client';

import { CreditService } from '../credit/credit.service';
import { PaymentService } from '../payment/payment.service';
import Stripe from 'stripe';
import { SubscriptionRepository } from './subscription.repository';

import { PLAN_ID_MAPPING } from '../stripe/constants';
import { ISubscriptionData, IUserSubscriptionWithPlan } from './types';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly creditService: CreditService,
    private readonly paymentService: PaymentService,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async getSubscriptionPlanById(
    id: string,
  ): Promise<subscription_plans | null> {
    return this.subscriptionRepository.findSubscriptionPlanById(id);
  }

  async getPlanByStripePrice(
    priceId: string,
  ): Promise<subscription_plans | null> {
    return this.subscriptionRepository.findPlanByStripePrice(priceId);
  }

  async getUserByStripeCustomerId(
    customerId: string,
  ): Promise<user_subscriptions | null> {
    return this.subscriptionRepository.findUserByStripeCustomerId(customerId);
  }

  async checkUserHasActivePlan(
    userId: string,
    planId: string,
  ): Promise<{ hasActivePlan: boolean }> {
    const existingSubscription =
      await this.subscriptionRepository.findActiveUserSubscription(
        userId,
        planId,
      );
    return { hasActivePlan: !!existingSubscription };
  }

  async upsertUserSubscription(
    userId: string,
    planId: string,
    subscriptionData: ISubscriptionData,
  ): Promise<user_subscriptions> {
    return this.subscriptionRepository.upsertUserSubscription(
      subscriptionData.stripeSubscriptionId,
      {
        user_id: userId,
        plan_id: planId,
        stripe_subscription_id: subscriptionData.stripeSubscriptionId,
        stripe_customer_id: subscriptionData.stripeCustomerId,
        status: 'active',
        current_period_start: subscriptionData.currentPeriodStart,
        current_period_end: subscriptionData.currentPeriodEnd,
        cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
      },
      {
        status: 'active',
        current_period_start: subscriptionData.currentPeriodStart,
        current_period_end: subscriptionData.currentPeriodEnd,
        cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
      },
    );
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: subscription_status,
    periodStart?: number,
    periodEnd?: number,
    cancelAtPeriodEnd?: boolean,
  ): Promise<user_subscriptions | null> {
    try {
      return await this.subscriptionRepository.updateSubscriptionByStripeId(
        subscriptionId,
        {
          status,
          current_period_start: periodStart
            ? new Date(periodStart * 1000)
            : undefined,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000)
            : undefined,
          cancel_at_period_end: cancelAtPeriodEnd,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to update subscription status for ${subscriptionId}`,
        error,
      );
      return null;
    }
  }

  async getActiveSubscriptionByStripeIds(
    customerId: string,
    subscriptionId: string,
  ): Promise<IUserSubscriptionWithPlan | null> {
    return this.subscriptionRepository.findActiveSubscriptionByStripeIds(
      customerId,
      subscriptionId,
    );
  }

  async expireUserSubscription(
    subscriptionId: string,
  ): Promise<user_subscriptions> {
    return this.subscriptionRepository.updateSubscriptionById(subscriptionId, {
      status: 'expired',
    });
  }

  async createNewUserSubscription(
    userId: string,
    planId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<user_subscriptions> {
    return this.subscriptionRepository.createUserSubscription({
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: 'active',
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    });
  }

  async updateSubscriptionCancellation(
    customerId: string,
    subscriptionId: string,
    cancelAtPeriodEnd: boolean,
  ): Promise<user_subscriptions | null> {
    const subscription =
      await this.subscriptionRepository.findSubscriptionByStripeIds(
        customerId,
        subscriptionId,
      );

    if (!subscription) {
      this.logger.warn(
        `Subscription not found for cancellation update: cust: ${customerId}, sub: ${subscriptionId}`,
      );
      return null;
    }

    return this.subscriptionRepository.updateSubscriptionById(subscription.id, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
  }

  async cancelActiveFreePlan(userId: string): Promise<void> {
    const freePlanId = PLAN_ID_MAPPING.FREE;

    const freeSubscriptions =
      await this.subscriptionRepository.findActiveFreeSubscriptions(
        userId,
        freePlanId,
      );

    if (freeSubscriptions.length === 0) {
      return;
    }

    for (const sub of freeSubscriptions) {
      await this.subscriptionRepository.updateSubscriptionById(sub.id, {
        status: 'cancelled',
        cancel_at_period_end: true,
      });

      await this.creditService.markCreditBucketsAsCancelled(sub.id);
      this.logger.log(
        `🚫 Cancelled active free plan for user: ${userId}, subscription: ${sub.id}`,
      );
    }
  }

  async handleSubscriptionCancellation(
    customerId: string,
    subscriptionId: string,
  ): Promise<void> {
    try {
      const updatedSubscription = await this.updateSubscriptionCancellation(
        customerId,
        subscriptionId,
        true,
      );

      if (updatedSubscription) {
        await this.creditService.markCreditBucketsAsCancelled(
          updatedSubscription.id,
        );
      }
    } catch (error) {
      this.logger.error('❌ Error handling subscription cancellation:', error);
    }
  }

  async processSubscriptionRenewal(
    customerId: string,
    subscriptionId: string,
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const startTime = Date.now();
    this.logger.log(
      `🔄 Processing subscription renewal for invoice: ${invoice.id}`,
    );

    try {
      const currentSubscription = await this.getActiveSubscriptionByStripeIds(
        customerId,
        subscriptionId,
      );

      if (!currentSubscription) {
        throw new Error(
          `Active subscription not found for renewal: subId ${subscriptionId}`,
        );
      }
      const {
        user_id,
        plan_id,
        id: currentSubscriptionId,
        subscription_plans: plan,
      } = currentSubscription;

      this.logger.log(`✅ Found active subscription for user: ${user_id}`);

      const periodStart = new Date(invoice.period_start * 1000);
      const periodEnd = new Date(invoice.period_end * 1000);

      // Expire old subscription and its credit buckets
      await this.expireUserSubscription(currentSubscriptionId);
      const { expiredBuckets } =
        await this.creditService.expireCreditBucketsByUserSubscriptionId(
          currentSubscriptionId,
        );

      // Create new subscription record for the new period
      const newSubscription = await this.createNewUserSubscription(
        user_id,
        plan_id,
        customerId,
        subscriptionId,
        periodStart,
        periodEnd,
      );
      this.logger.log(
        `🎯 Created new subscription record: ${newSubscription.id}`,
      );

      // Handle expired credits and grant new ones in parallel
      const parallelOperations = [];

      // Create transactions for expired credits
      if (expiredBuckets.length > 0) {
        const transactions = expiredBuckets
          .filter(
            (bucket) =>
              bucket.credits_remaining && bucket.credits_remaining > 0,
          )
          .map((bucket) => ({
            user_id: bucket.user_id,
            amount: -(bucket.credits_remaining || 0),
            type: 'monthly_reset' as const,
            description: `Credits expired during renewal - ${bucket.description || 'Subscription'}`,
          }));

        if (transactions.length > 0) {
          parallelOperations.push(
            this.creditService.bulkCreateCreditTransactions(transactions),
          );
        }
      }

      // Grant new monthly credits
      if (plan) {
        parallelOperations.push(
          this.creditService.grantMonthlyCredits(
            user_id,
            plan,
            newSubscription.id,
          ),
        );
      }

      // Create payment history
      parallelOperations.push(
        this.paymentService.createPaymentHistory({
          userId: user_id,
          amountCents: invoice.amount_paid,
          currency: invoice.currency,
          paymentType: 'subscription_renewal',
          status: 'completed',
          description: `Subscription renewal - ${plan?.name || 'Unknown Plan'}`,
          stripeInvoiceId: invoice.id,
        }),
      );

      await Promise.all(parallelOperations);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `🎉 Subscription renewal completed for user: ${user_id} (${processingTime}ms)`,
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `❌ Failed to process subscription renewal (${processingTime}ms):`,
        error,
      );
      throw error;
    }
  }
}
