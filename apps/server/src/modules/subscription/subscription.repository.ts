import { Injectable } from '@nestjs/common';
import { subscription_plans, user_subscriptions } from '@prisma/client';
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
} 