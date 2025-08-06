import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EstimatesModule } from './estimates/estimates.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatGateway } from './chat/chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConsultantsModule } from './consultants/consultants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EstimatesModule,
    ConsultationsModule,
    DashboardModule,
    NotificationsModule,
    // Keep this here, as AuthModule exports JwtModule
    // to make it available for other modules without re-importing
    // JwtModule.registerAsync is a better approach but this works
    ConsultantsModule,
  ],
  providers: [ChatGateway],
})
export class AppModule {}