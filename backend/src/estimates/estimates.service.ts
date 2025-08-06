import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstimateDto, UpdateEstimateDto, UpdateEstimateStatusDto } from './dto/estimate.dto';

@Injectable()
export class EstimatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createEstimateDto: CreateEstimateDto) {
    return this.prisma.estimate.create({
      data: {
        ...createEstimateDto,
        userId,
        status:'PENDING',
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
    const estimate = await this.prisma.estimate.findFirst({ where: { id, userId } });
    if (!estimate) {
        throw new NotFoundException(`Estimate with ID "${id}" not found or unauthorized access`);
    }
    return estimate;
  }

  async updateStatus(id: string, userId: string, updateStatusDto: UpdateEstimateStatusDto) {
    const estimate = await this.prisma.estimate.findFirst({ where: { id, userId } });
    if (!estimate) {
        throw new UnauthorizedException('You do not have permission to update this estimate.');
    }
    return this.prisma.estimate.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async remove(id: string, userId: string) {
    const estimate = await this.prisma.estimate.findFirst({ where: { id, userId } });
    if (!estimate) {
        throw new UnauthorizedException('You do not have permission to delete this estimate.');
    }
    return this.prisma.estimate.delete({
      where: { id },
    });
  }

  async update(id: string, userId: string, updateData: UpdateEstimateDto) {
    const estimate = await this.prisma.estimate.findFirst({ where: { id, userId } });
    if (!estimate) {
        throw new UnauthorizedException('You do not have permission to update this estimate.');
    }
    return this.prisma.estimate.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt:new Date()
      }
    });
  }
}