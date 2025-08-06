import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  getUnreadCount(@Req() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Get()
  getAll(@Req() req) {
    return this.notificationsService.getAll(req.user.id);
  }

  @Post()
  create(@Req() req, @Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.id, createNotificationDto);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}