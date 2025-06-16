'use server';

import { authAction } from '@/lib/safe-action';
import { CreateCheckoutSessionSchema, PurchaseCreditsSchema } from '../schemas';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';

const stripe = require('stripe')(env.STRIPE_SECRET_KEY);

export const createCheckoutSessionAction = authAction
  .inputSchema(CreateCheckoutSessionSchema)
  .action(async ({ parsedInput: { productId }, ctx: { user } }) => {
    try {
      const supabase = await createClient();

      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('stripe_product_id', productId)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        throw new Error('Invalid subscription plan');
      }

      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      let customerId: string;

      if (existingSubscription?.stripe_customer_id) {
        customerId = existingSubscription.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
        },
      });

      if (!session.url) {
        throw new Error('Failed to create checkout session');
      }

      redirect(session.url);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  });

export const purchaseCreditsAction = authAction
  .inputSchema(PurchaseCreditsSchema)
  .action(async ({ parsedInput: { amount }, ctx: { user } }) => {
    try {
      const supabase = await createClient();

      // Calculate price (200 credits for $1)
      const priceInCents = Math.ceil((amount / 200) * 100);

      // Create or get Stripe customer
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      let customerId: string;

      if (subscription?.stripe_customer_id) {
        customerId = subscription.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
      }

      // Create checkout session for one-time payment
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${amount} AI Credits`,
                description: `Purchase ${amount} additional AI credits`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?credits_canceled=true`,
        metadata: {
          user_id: user.id,
          credits_amount: amount.toString(),
          payment_type: 'credits',
        },
      });

      if (!session.url) {
        throw new Error('Failed to create checkout session');
      }

      redirect(session.url);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      throw new Error('Failed to purchase credits');
    }
  });
