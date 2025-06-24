import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreditModule } from '../credit/credit.module';
import { PaymentModule } from '../payment/payment.module';
import { CreditService } from '../credit/credit.service';
import { PaymentService } from '../payment/payment.service';


@Module({
  imports: [CreditModule, PaymentModule],
  providers: [SubscriptionService, CreditService, PaymentService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
