import { Module } from '@nestjs/common';
import { ConsultantsService } from './consultants.service';
import { ConsultantsController } from './consultants.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ConsultantsController],
  providers: [ConsultantsService],
  exports: [ConsultantsService],
})
export class ConsultantsModule {}