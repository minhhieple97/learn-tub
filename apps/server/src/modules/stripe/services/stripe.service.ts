import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { AppConfigService } from '@/src/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly appConfigService: AppConfigService) {
    this.stripe = new Stripe(this.appConfigService.stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  // Get Products
  async getProducts(): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list();
      this.logger.log('Products retrieved successfully');
      return products.data;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve products',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Get Customers
  async getCustomers(): Promise<Stripe.Customer[]> {
    try {
      const customers = await this.stripe.customers.list();
      this.logger.log('Customers retrieved successfully');
      return customers.data;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve customers',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Create Payment Intent
  async createPaymentIntent(
    amount: number,
    currency: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Stripe expects cents
        currency,
      });
      this.logger.log('Payment intent created successfully');
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        'Failed to create payment intent',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Create Subscription
  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });
      this.logger.log('Subscription created successfully');
      return subscription;
    } catch (error) {
      this.logger.error(
        'Failed to create subscription',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Create Customer
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });
      this.logger.log('Customer created successfully');
      return customer;
    } catch (error) {
      this.logger.error(
        'Failed to create customer',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Create Product with Price
  async createProduct(
    name: string,
    description: string,
    price: number,
  ): Promise<{
    product: Stripe.Product;
    price: Stripe.Price;
  }> {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
      });

      const priceObj = await this.stripe.prices.create({
        unit_amount: price * 100, // Stripe expects cents
        currency: 'usd',
        product: product.id,
      });

      this.logger.log('Product and price created successfully');
      return { product, price: priceObj };
    } catch (error) {
      this.logger.error(
        'Failed to create product',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Refund Payment
  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      this.logger.log('Refund processed successfully');
      return refund;
    } catch (error) {
      this.logger.error(
        'Failed to process refund',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Attach Payment Method to Customer
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: customerId,
        },
      );
      this.logger.log('Payment method attached successfully');
      return paymentMethod;
    } catch (error) {
      this.logger.error(
        'Failed to attach payment method',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Get Balance
  async getBalance(): Promise<Stripe.Balance> {
    try {
      const balance = await this.stripe.balance.retrieve();
      this.logger.log('Balance retrieved successfully');
      return balance;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve balance',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Create Payment Link
  async createPaymentLink(priceId: string): Promise<Stripe.PaymentLink> {
    try {
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: 1 }],
      });
      this.logger.log('Payment link created successfully');
      return paymentLink;
    } catch (error) {
      this.logger.error(
        'Failed to create payment link',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Create Checkout Session
  async createCheckoutSession(params: {
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    metadata?: Record<string, string>;
    lineItems: Array<{
      price?: string;
      priceData?: {
        currency: string;
        productData: {
          name: string;
          description?: string;
        };
        unitAmount: number;
      };
      quantity: number;
    }>;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: params.mode,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer: params.customerId,
        metadata: params.metadata,
        line_items: params.lineItems.map((item) => ({
          price: item.price,
          price_data: item.priceData
            ? {
                currency: item.priceData.currency,
                product_data: item.priceData.productData,
                unit_amount: item.priceData.unitAmount,
              }
            : undefined,
          quantity: item.quantity,
        })),
      });
      this.logger.log('Checkout session created successfully');
      return session;
    } catch (error) {
      this.logger.error(
        'Failed to create checkout session',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // Construct Event (for webhook verification)
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

  // Get Stripe instance for advanced operations
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
