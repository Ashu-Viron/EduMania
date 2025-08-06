import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConsultantProfileDto } from './dto/consultant-profile.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ConsultantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: UserRole.CONSULTANT },
      select: {
        id: true,
        name: true,
        avatar: true,
        ConsultantProfile: {
          select: {
            id: true,
            bio: true,
            specialties: true,
            hourlyRate: true,
            isAvailable: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const consultant = await this.prisma.user.findFirst({
      where: { id, role: UserRole.CONSULTANT },
      select: {
        id: true,
        name: true,
        avatar: true,
        ConsultantProfile: {
          select: {
            id: true,
            bio: true,
            specialties: true,
            hourlyRate: true,
            isAvailable: true,
          },
        },
      },
    });
    if (!consultant) {
      throw new NotFoundException('Consultant not found');
    }
    return consultant;
  }

  // NEW: Method for authenticated consultant to get their own profile
  async findProfileForAuthenticatedUser(userId: string) {
    const consultantProfile = await this.prisma.consultantProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
    });
    if (!consultantProfile) {
      throw new NotFoundException('Consultant profile not found for this user.');
    }
    return consultantProfile;
  }

  async updateProfile(userId: string, updateDto: UpdateConsultantProfileDto) {
    const consultantProfile = await this.prisma.consultantProfile.findUnique({
      where: { userId },
    });
    if (!consultantProfile) {
      throw new NotFoundException('Consultant profile not found');
    }
    return this.prisma.consultantProfile.update({
      where: { userId },
      data: updateDto,
    });
  }
}