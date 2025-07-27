import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstimateDto, UpdateEstimateStatusDto } from './dto/estimate.dto';

@Injectable()
export class EstimatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createEstimateDto: CreateEstimateDto) {
    return this.prisma.estimate.create({
      data: {
        ...createEstimateDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.estimate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.estimate.findFirst({
      where: { id, userId },
    });
  }

  async updateStatus(id: string, userId: string, updateStatusDto: UpdateEstimateStatusDto) {
    return this.prisma.estimate.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.estimate.delete({
      where: { id },
    });
  }
}