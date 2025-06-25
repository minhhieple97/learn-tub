import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './subscription.repository';
import { CreditModule } from '../credit/credit.module';
import { PaymentModule } from '../payment/payment.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CreditService } from '../credit/credit.service';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentRepository } from '../payment/payment.repository';

@Module({
  imports: [CreditModule, PaymentModule, PrismaModule],
  providers: [
    SubscriptionService,
    SubscriptionRepository,
    CreditService,
    PaymentService,
    PrismaService,
    PaymentRepository
  ],
  exports: [SubscriptionService, SubscriptionRepository],
})
export class SubscriptionModule {}
