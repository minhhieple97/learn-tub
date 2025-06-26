import { Injectable } from '@nestjs/common';
import {
  credit_bucket_status_enum,
  credit_source_type_enum,
  subscription_plans,
  transaction_type_enum,
  user_subscriptions,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ICreateUserSubscriptionData,
  IUpdateUserSubscriptionData,
  IUpsertUserSubscriptionData,
} from './types';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSubscriptionPlanById(
    id: string,
  ): Promise<subscription_plans | null> {
    return this.prisma.subscription_plans.findFirst({
      where: { id, is_active: true },
    });
  }

  async findPlanByStripePrice(
    priceId: string,
  ): Promise<subscription_plans | null> {
    return this.prisma.subscription_plans.findFirst({
      where: { stripe_price_id: priceId, is_active: true },
    });
  }

  async findUserByStripeCustomerId(
    customerId: string,
  ): Promise<user_subscriptions | null> {
    return this.prisma.user_subscriptions.findFirst({
      where: { stripe_customer_id: customerId },
    });
  }

  async findActiveUserSubscription(userId: string, planId: string) {
    const now = new Date();
    return this.prisma.user_subscriptions.findFirst({
      where: {
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_end: { gte: now },
      },
    });
  }

  async upsertUserSubscription(
    stripeSubscriptionId: string,
    createData: IUpsertUserSubscriptionData,
    updateData: IUpdateUserSubscriptionData,
  ): Promise<user_subscriptions> {
    return this.prisma.user_subscriptions.upsert({
      where: { stripe_subscription_id: stripeSubscriptionId },
      create: createData,
      update: updateData,
    });
  }

  async updateSubscriptionByStripeId(
    subscriptionId: string,
    data: IUpdateUserSubscriptionData,
  ): Promise<user_subscriptions | null> {
    try {
      return await this.prisma.user_subscriptions.update({
        where: { stripe_subscription_id: subscriptionId },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  async findActiveSubscriptionByStripeIds(
    customerId: string,
    subscriptionId: string,
  ) {
    return this.prisma.user_subscriptions.findFirst({
      where: {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
      },
      include: {
        subscription_plans: true,
      },
    });
  }

  async updateSubscriptionById(
    id: string,
    data: IUpdateUserSubscriptionData,
  ): Promise<user_subscriptions> {
    return this.prisma.user_subscriptions.update({
      where: { id },
      data,
    });
  }

  async createUserSubscription(
    data: ICreateUserSubscriptionData,
  ): Promise<user_subscriptions> {
    return this.prisma.user_subscriptions.create({ data });
  }

  async findSubscriptionByStripeIds(
    customerId: string,
    subscriptionId: string,
  ) {
    return this.prisma.user_subscriptions.findFirst({
      where: {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      },
    });
  }

  async findActiveFreeSubscriptions(userId: string, freePlanId: string) {
    return this.prisma.user_subscriptions.findMany({
      where: {
        user_id: userId,
        plan_id: freePlanId,
        status: 'active',
      },
    });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  async handleSubscriptionCreationTransaction(
    userId: string,
    planId: string,
    subscriptionData: IUpsertUserSubscriptionData,
    plan: any,
    freePlanId: string,
  ) {
    return this.executeTransaction(async (tx) => {
      const userSubscription = await tx.user_subscriptions.upsert({
        where: {
          stripe_subscription_id: subscriptionData.stripe_subscription_id,
        },
        create: subscriptionData,
        update: {
          status: subscriptionData.status,
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          cancel_at_period_end: subscriptionData.cancel_at_period_end,
        },
      });

      const expirationDays = 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      const creditBucket = await tx.credit_buckets.create({
        data: {
          user_id: userId,
          credits_total: plan.credits_per_month,
          credits_used: 0,
          source_type: 'subscription',
          status: 'active',
          description: `Monthly subscription credits - ${plan.name}`,
          expires_at: expiresAt,
          metadata: {
            subscription_plan_id: plan.id,
            plan_name: plan.name,
            granted_date: new Date().toISOString(),
            credits_per_month: plan.credits_per_month,
          },
          user_subscription_id: userSubscription.id,
        },
      });

      const creditTransaction = await tx.credit_transactions.create({
        data: {
          user_id: userId,
          amount: plan.credits_per_month,
          type: 'subscription_grant',
          description: `Monthly subscription credit grant - ${plan.name}`,
        },
      });

      if (planId !== freePlanId) {
        const freeSubscriptions = await tx.user_subscriptions.findMany({
          where: {
            user_id: userId,
            plan_id: freePlanId,
            status: 'active',
          },
        });

        if (freeSubscriptions.length > 0) {
          await tx.user_subscriptions.updateMany({
            where: {
              user_id: userId,
              plan_id: freePlanId,
              status: 'active',
            },
            data: {
              status: 'cancelled',
              cancel_at_period_end: true,
            },
          });

          for (const sub of freeSubscriptions) {
            await tx.credit_buckets.updateMany({
              where: {
                user_subscription_id: sub.id,
                status: credit_bucket_status_enum.active,
              },
              data: {
                source_type: credit_source_type_enum.cancelled_plan,
              },
            });
          }
        }
      }

      return {
        userSubscription,
        creditBucket,
        creditTransaction,
        cancelledFreeSubscriptions: 0,
      };
    });
  }

  async handleCheckoutCompletedTransaction(
    userId: string,
    planId: string | null,
    subscriptionData: IUpsertUserSubscriptionData | null,
    plan: any | null,
    creditsAmount: number | null,
    paymentHistoryData: any,
    freePlanId: string,
  ) {
    return this.executeTransaction(async (tx) => {
      const results: any = {};

      results.paymentHistory = await tx.payment_history.create({
        data: paymentHistoryData,
      });

      if (subscriptionData && planId && plan) {
        const subscriptionResult =
          await this.handleSubscriptionCreationInTransaction(
            tx,
            userId,
            planId,
            subscriptionData,
            plan,
            freePlanId,
          );
        results.subscription = subscriptionResult;
      } else if (creditsAmount && creditsAmount > 0) {
        const expirationDays = 90;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);

        results.creditBucket = await tx.credit_buckets.create({
          data: {
            user_id: userId,
            credits_total: creditsAmount,
            credits_used: 0,
            source_type: 'purchase',
            status: 'active',
            description: `Purchased ${creditsAmount} AI credits`,
            expires_at: expiresAt,
            metadata: paymentHistoryData.stripe_payment_intent_id
              ? {
                  stripe_payment_intent_id:
                    paymentHistoryData.stripe_payment_intent_id,
                }
              : null,
          },
        });

        results.creditTransaction = await tx.credit_transactions.create({
          data: {
            user_id: userId,
            amount: creditsAmount,
            type: 'purchase',
            description: `Purchased ${creditsAmount} AI credits`,
            stripe_payment_intent_id:
              paymentHistoryData.stripe_payment_intent_id,
          },
        });
      }

      return results;
    });
  }

  private async handleSubscriptionCreationInTransaction(
    tx: any,
    userId: string,
    planId: string,
    subscriptionData: IUpsertUserSubscriptionData,
    plan: any,
    freePlanId: string,
  ) {
    const userSubscription = await tx.user_subscriptions.upsert({
      where: {
        stripe_subscription_id: subscriptionData.stripe_subscription_id,
      },
      create: subscriptionData,
      update: {
        status: subscriptionData.status,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
      },
    });

    const expirationDays = 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const creditBucket = await tx.credit_buckets.create({
      data: {
        user_id: userId,
        credits_total: plan.credits_per_month,
        credits_used: 0,
        source_type: 'subscription',
        status: 'active',
        description: `Monthly subscription credits - ${plan.name}`,
        expires_at: expiresAt,
        metadata: {
          subscription_plan_id: plan.id,
          plan_name: plan.name,
          granted_date: new Date().toISOString(),
          credits_per_month: plan.credits_per_month,
        },
        user_subscription_id: userSubscription.id,
      },
    });

    const creditTransaction = await tx.credit_transactions.create({
      data: {
        user_id: userId,
        amount: plan.credits_per_month,
        type: 'subscription_grant',
        description: `Monthly subscription credit grant - ${plan.name}`,
      },
    });

    if (planId !== freePlanId) {
      const freeSubscriptions = await tx.user_subscriptions.findMany({
        where: {
          user_id: userId,
          plan_id: freePlanId,
          status: 'active',
        },
      });

      if (freeSubscriptions.length > 0) {
        await tx.user_subscriptions.updateMany({
          where: {
            user_id: userId,
            plan_id: freePlanId,
            status: 'active',
          },
          data: {
            status: 'cancelled',
            cancel_at_period_end: true,
          },
        });

        for (const sub of freeSubscriptions) {
          await tx.credit_buckets.updateMany({
            where: {
              user_subscription_id: sub.id,
              status: credit_bucket_status_enum.active,
            },
            data: {
              source_type: credit_source_type_enum.cancelled_plan,
            },
          });
        }
      }
    }

    return {
      userSubscription,
      creditBucket,
      creditTransaction,
    };
  }

  async handleSubscriptionRenewalTransaction(
    customerId: string,
    subscriptionId: string,
    invoice: any,
    currentSubscription: any,
    plan: any,
  ) {
    return this.executeTransaction(async (tx) => {
      const {
        user_id,
        plan_id,
        id: currentSubscriptionId,
      } = currentSubscription;
      const periodStart = new Date(invoice.period_start * 1000);
      const periodEnd = new Date(invoice.period_end * 1000);

      const expiredSubscription = await tx.user_subscriptions.update({
        where: { id: currentSubscriptionId },
        data: { status: 'expired' },
      });

      const expiredBuckets = await tx.credit_buckets.findMany({
        where: {
          user_subscription_id: currentSubscriptionId,
          status: credit_bucket_status_enum.active,
        },
        select: {
          id: true,
          user_id: true,
          credits_remaining: true,
          description: true,
        },
      });

      if (expiredBuckets.length > 0) {
        await tx.credit_buckets.updateMany({
          where: {
            user_subscription_id: currentSubscriptionId,
            status: credit_bucket_status_enum.active,
          },
          data: { status: credit_bucket_status_enum.expired },
        });
      }

      const newSubscription = await tx.user_subscriptions.create({
        data: {
          user_id,
          plan_id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
        },
      });

      const expirationDays = 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      const newCreditBucket = await tx.credit_buckets.create({
        data: {
          user_id,
          credits_total: plan.credits_per_month,
          credits_used: 0,
          source_type: credit_source_type_enum.subscription,
          status: credit_bucket_status_enum.active,
          description: `Monthly subscription credits - ${plan.name}`,
          expires_at: expiresAt,
          metadata: {
            subscription_plan_id: plan.id,
            plan_name: plan.name,
            granted_date: new Date().toISOString(),
            credits_per_month: plan.credits_per_month,
          },
          user_subscription_id: newSubscription.id,
        },
      });

      const expiredCreditTransactions = expiredBuckets
        .filter(
          (bucket) => bucket.credits_remaining && bucket.credits_remaining > 0,
        )
        .map((bucket) => ({
          user_id: bucket.user_id,
          amount: -(bucket.credits_remaining || 0),
          type: transaction_type_enum.monthly_reset,
          description: `Credits expired during renewal - ${bucket.description || 'Subscription'}`,
        }));

      if (expiredCreditTransactions.length > 0) {
        await tx.credit_transactions.createMany({
          data: expiredCreditTransactions,
        });
      }

      const newCreditTransaction = await tx.credit_transactions.create({
        data: {
          user_id,
          amount: plan.credits_per_month,
          type: transaction_type_enum.subscription_grant,
          description: `Monthly subscription credit grant - ${plan.name}`,
        },
      });

      const paymentHistory = await tx.payment_history.create({
        data: {
          user_id,
          amount_cents: invoice.amount_paid,
          currency: invoice.currency,
          payment_type: 'subscription_renewal',
          status: 'completed',
          description: `Subscription renewal - ${plan?.name || 'Unknown Plan'}`,
          stripe_invoice_id: invoice.id,
        },
      });

      return {
        expiredSubscription,
        newSubscription,
        expiredBuckets,
        newCreditBucket,
        newCreditTransaction,
        expiredCreditTransactions,
        paymentHistory,
      };
    });
  }
}
