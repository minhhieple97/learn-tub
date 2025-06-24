import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeWebhookService } from '@/features/payments/services';

export async function POST(request: NextRequest) {
  try {
    // Get request body and signature
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: StatusCodes.BAD_REQUEST });
    }

    const event = StripeWebhookService.constructEvent(body, signature);

    await StripeWebhookService.processWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';
    const statusCode = errorMessage.includes('signature verification')
      ? StatusCodes.BAD_REQUEST
      : StatusCodes.INTERNAL_SERVER_ERROR;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
