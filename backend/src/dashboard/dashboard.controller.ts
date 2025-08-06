import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user-stats')
  @UseGuards(new UserRoleGuard(UserRole.USER))
  getUserStats(@Req() req) {
    return this.dashboardService.getUserStats(req.user.id);
  }

  @Get('consultant-stats')
  @UseGuards(new UserRoleGuard(UserRole.CONSULTANT))
  getConsultantStats(@Req() req) {
    return this.dashboardService.getConsultantStats(req.user.id);
  }
}