import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException,NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ConsultantRegisterDto } from './dto/consultant-register.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto, ChangePasswordDto, NotificationSettingsDto } from './dto/profile.dto';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };

    const userResponse = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            phone: true,
            company: true,
            notificationSettings: true,
        }
    });

    return {
      user: userResponse,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }
  
  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        avatar: registerDto.avatar || null,
        role: UserRole.USER,
      },
    });

    const { password: _, ...userResponse } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    return {
      user: userResponse,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  async registerConsultant(registerDto: ConsultantRegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        avatar: registerDto.avatar || null,
        role: UserRole.CONSULTANT,
      },
    });
    
    await this.prisma.consultantProfile.create({
      data: {
        userId: user.id,
        bio: registerDto.bio,
        specialties: registerDto.specialties,
        isAvailable: false,
      }
    });

    const { password: _, ...userResponse } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      user: userResponse,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      const newPayload = { email: user.email, sub: user.id, role: user.role };
      
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '30d' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        phone: true,
        company: true,
        notificationSettings: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('User not found.');
    }
    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  // FIX: Converted DTO to a plain object before passing to Prisma
  async updateNotificationSettings(userId: string, dto: NotificationSettingsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { notificationSettings: { ...dto } as Prisma.JsonObject }
    });
  }

  async updateAvatar(userId: string, avatarPath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath }
    });
  }
}