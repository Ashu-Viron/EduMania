import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const [
      totalEstimates,
      pendingEstimates,
      totalConsultations,
      completedConsultations,
      approvedEstimates,
      estimateStatusCounts,
    ] = await Promise.all([
      this.prisma.estimate.count({ where: { userId } }),
      this.prisma.estimate.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.consultation.count({ where: { userId } }),
      this.prisma.consultation.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.estimate.findMany({
        where: { userId, status: 'APPROVED' },
        select: { amount: true },
      }),
      this.prisma.estimate.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { userId },
      }),
    ]);

    const totalEarnings = approvedEstimates.reduce((sum, estimate) => sum + estimate.amount, 0);
    const pieChartData = estimateStatusCounts.map(item => ({
      name: item.status,
      value: item._count.id,
    }));

    return {
      totalEstimates,
      pendingEstimates,
      totalConsultations,
      completedConsultations,
      totalEarnings,
      monthlyGrowth: 12.5,
      estimateStatusStats: pieChartData,
    };
  }

  async getConsultantStats(consultantId: string) {
    const [
      totalConsultations,
      upcomingConsultations,
      totalHours,
      monthlyConsultations
    ] = await Promise.all([
      this.prisma.consultation.count({ where: { consultantId } }),
      this.prisma.consultation.count({ where: { consultantId, status: 'SCHEDULED' } }),
      this.prisma.consultation.aggregate({
        _sum: { duration: true },
        where: { consultantId, status: 'COMPLETED' },
      }),
      this.prisma.consultation.groupBy({
        by: ['scheduledAt'],
        _count: { id: true },
        where: {
          consultantId,
          scheduledAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
    ]);

    const chartData = monthlyConsultations.map(item => ({
      name: new Date(item.scheduledAt).toLocaleDateString('en-US', { month: 'short' }),
      count: item._count.id,
    }));

    return {
      totalConsultations,
      upcomingConsultations: upcomingConsultations,
      totalHours: (totalHours._sum?.duration || 0) / 60,
      monthlyStats: chartData,
    };
  }
}