import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultationDto, UpdateConsultationStatusDto, UpdateConsultationNotesDto, UpdateConsultationDto } from './dto/consultation.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createConsultationDto: CreateConsultationDto) {
    const { consultantId, ...rest } = createConsultationDto;
    
    // Step 1: Find the consultant's profile ID based on the user ID provided in the DTO
    const consultantProfile = await this.prisma.consultantProfile.findFirst({
      where: { userId: consultantId },
    });
    if (!consultantProfile) {
      throw new NotFoundException('Consultant not found.');
    }

    // Step 2: Create the consultation using the correct foreign key
    return this.prisma.consultation.create({
      data: {
        ...rest,
        userId,
        consultantId: consultantProfile.id,
        status: 'SCHEDULED',
      },
      include: {
        user: { select: { name: true, avatar: true } },
        consultant: { include: { user: { select: { name: true, avatar: true } } } },
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.consultation.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        consultant: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        user: { select: { name: true, avatar: true } }
      }
    });
  }

  async findAllForConsultant(consultantUserId: string) {
    // FIX: First, find the consultant's profile ID
    const consultantProfile = await this.prisma.consultantProfile.findFirst({
      where: { userId: consultantUserId },
    });
    if (!consultantProfile) {
      throw new NotFoundException('Consultant profile not found.');
    }
    
    // FIX: Now, use the profile ID to filter consultations
    return this.prisma.consultation.findMany({
      where: { consultantId: consultantProfile.id },
      orderBy: { scheduledAt: 'desc' },
      include: {
        user: {
          select: { name: true, avatar: true }
        },
        consultant: { include: { user: { select: { name: true, avatar: true } } } }
      }
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const whereClause = userRole === 'CONSULTANT'
        ? { id, consultant: { is: { userId } } } // FIX: Correct syntax to filter by nested relation
        : { id, userId };
        
    const consultation = await this.prisma.consultation.findFirst({
      where: whereClause,
      include: {
        consultant: {
          include: {
            user: {
              select: { name: true, avatar: true, id: true }
            }
          }
        },
        user: {
          select: { name: true, avatar: true, id: true }
        }
      }
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found or unauthorized access');
    }
    
    return consultation;
  }
  
  async update(id: string, userId: string, updateConsultationDto: UpdateConsultationDto) {
    const consultation = await this.prisma.consultation.findUnique({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation not found');
    if (consultation.userId !== userId && consultation.consultantId !== (await this.prisma.consultantProfile.findFirst({ where: { userId } })).id) {
      throw new ForbiddenException('You do not have permission to update this consultation.');
    }

    return this.prisma.consultation.update({
      where: { id },
      data: updateConsultationDto,
    });
  }
  
  async updateStatus(id: string, userId: string, userRole: UserRole, updateStatusDto: UpdateConsultationStatusDto) {
    const consultation = await this.prisma.consultation.findUnique({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation not found');

    if (userRole === UserRole.CONSULTANT) {
      const consultantProfile = await this.prisma.consultantProfile.findFirst({ where: { userId } });
      if (consultation.consultantId !== consultantProfile.id) {
          throw new ForbiddenException('You do not have permission to update this consultation status.');
      }
    } else if (userRole === UserRole.USER) {
      if (consultation.userId !== userId) {
          throw new ForbiddenException('You do not have permission to update this consultation status.');
      }
    }
    
    return this.prisma.consultation.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async addNotes(id: string, userId: string, updateNotesDto: UpdateConsultationNotesDto) {
    const consultation = await this.prisma.consultation.findUnique({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation not found');

    const consultantProfile = await this.prisma.consultantProfile.findFirst({ where: { userId } });
    if (consultation.consultantId !== consultantProfile.id) {
      throw new ForbiddenException('You do not have permission to add notes to this consultation.');
    }

    return this.prisma.consultation.update({
      where: { id },
      data: { notes: updateNotesDto.notes },
    });
  }
  
  async remove(id: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation not found');
    if (consultation.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this consultation.');
    }

    return this.prisma.consultation.delete({ where: { id } });
  }
}