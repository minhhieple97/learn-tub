'use server';

import { ActionError, authAction } from '@/lib/safe-action';
import { redirect } from 'next/navigation';
import { env } from '@/env.mjs';
import { checkProfileByUserId } from '@/lib/require-auth';
import { getUserActiveSubscription } from '../queries';
import { PAYMENT_CONFIG_URLS } from '@/config/constants';

const stripe = require('stripe')(env.STRIPE_SECRET_KEY);

export const manageBillingAction = authAction.action(async ({ ctx: { user } }) => {
  const profile = await checkProfileByUserId(user.id);

  const { data: subscription, error } = await getUserActiveSubscription(profile.id);

  if (error) {
    console.error('❌ Database error:', error);
    throw new ActionError('Failed to retrieve subscription information');
  }

  if (!subscription?.stripe_customer_id) {
    throw new ActionError('No active subscription found');
  }

  let billingPortalUrl: string;

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: PAYMENT_CONFIG_URLS.cancel_url,
  });

  if (!session.url) {
    throw new ActionError('Failed to create billing portal session');
  }

  billingPortalUrl = session.url;
  console.log('🔗 Billing portal session created successfully');

  redirect(billingPortalUrl);
});
