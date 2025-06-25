import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeService } from './services/stripe.service';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get all Stripe products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts() {
    return this.stripeService.getProducts();
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get all Stripe customers' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async getCustomers() {
    return this.stripeService.getCustomers();
  }

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  async createPaymentIntent(
    @Body() body: { amount: number; currency: string },
  ) {
    const { amount, currency } = body;
    return this.stripeService.createPaymentIntent(amount, currency);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create a subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  async createSubscription(
    @Body() body: { customerId: string; priceId: string },
  ) {
    const { customerId, priceId } = body;
    return this.stripeService.createSubscription(customerId, priceId);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create a customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async createCustomer(@Body() body: { email: string; name: string }) {
    return this.stripeService.createCustomer(body.email, body.name);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a product with price' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(
    @Body() body: { name: string; description: string; price: number },
  ) {
    return this.stripeService.createProduct(
      body.name,
      body.description,
      body.price,
    );
  }

  @Post('refunds')
  @ApiOperation({ summary: 'Process a refund' })
  @ApiResponse({ status: 201, description: 'Refund processed successfully' })
  async refundPayment(@Body() body: { paymentIntentId: string }) {
    return this.stripeService.refundPayment(body.paymentIntentId);
  }

  @Post('payment-links')
  @ApiOperation({ summary: 'Create a payment link' })
  @ApiResponse({
    status: 201,
    description: 'Payment link created successfully',
  })
  async createPaymentLink(@Body() body: { priceId: string }) {
    return this.stripeService.createPaymentLink(body.priceId);
  }

  @Post('checkout-sessions')
  @ApiOperation({ summary: 'Create a checkout session' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
  })
  async createCheckoutSession(
    @Body()
    body: {
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
    },
  ) {
    return this.stripeService.createCheckoutSession(body);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get Stripe account balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getBalance() {
    return this.stripeService.getBalance();
  }
}
