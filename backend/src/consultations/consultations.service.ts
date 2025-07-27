import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultationDto, UpdateConsultationStatusDto, UpdateConsultationNotesDto } from './dto/consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createConsultationDto: CreateConsultationDto) {
    return this.prisma.consultation.create({
      data: {
        ...createConsultationDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.consultation.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.consultation.findFirst({
      where: { id, userId },
    });
  }

  async updateStatus(id: string, userId: string, updateStatusDto: UpdateConsultationStatusDto) {
    return this.prisma.consultation.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async updateNotes(id: string, userId: string, updateNotesDto: UpdateConsultationNotesDto) {
    return this.prisma.consultation.update({
      where: { id },
      data: { notes: updateNotesDto.notes },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.consultation.delete({
      where: { id },
    });
  }
}