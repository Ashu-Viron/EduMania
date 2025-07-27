import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    const [
      totalEstimates,
      pendingEstimates,
      totalConsultations,
      completedConsultations,
      estimates,
    ] = await Promise.all([
      this.prisma.estimate.count({ where: { userId } }),
      this.prisma.estimate.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.consultation.count({ where: { userId } }),
      this.prisma.consultation.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.estimate.findMany({
        where: { userId, status: 'APPROVED' },
        select: { amount: true },
      }),
    ]);

    const totalEarnings = estimates.reduce((sum, estimate) => sum + estimate.amount, 0);

    return {
      totalEstimates,
      pendingEstimates,
      totalConsultations,
      completedConsultations,
      totalEarnings,
      monthlyGrowth: 12.5, // Mock data for now
    };
  }
}