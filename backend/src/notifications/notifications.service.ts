import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {}

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }

    async getAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({ where: { id: notificationId, userId } });
        if (!notification) {
            throw new NotFoundException('Notification not found or unauthorized access.');
        }

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }

    async create(userId: string, createNotificationDto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                title: createNotificationDto.title,
                read: false,
                user: {
                    connect: { id: userId }
                },
            },
        });
    }
}