import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditRepository } from './credit.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [CreditService, CreditRepository, PrismaService],
  exports: [CreditService, CreditRepository],
})
export class CreditModule {}
