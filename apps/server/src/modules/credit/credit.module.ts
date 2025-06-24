import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [CreditService, PrismaService],
  exports: [CreditService],
})
export class CreditModule {}
