import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { NotificationCreateDto } from './notification-create.dto.js';
import { NotificationUpdateDto } from './notification-update.dto.js';
import { NotificationType } from './notification.types.js';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async createNotification(@Body() notification: NotificationCreateDto) {
    return this.notificationService.createNotification(notification);
  }

  @Get(':id')
  async getNotification(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.notificationService.getNotification(id, includeArray);
  }

  @Get()
  async getNotifications(
    @Query('userId') userId?: string,
    @Query('type') type?: NotificationType,
    @Query('read') read?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const readBoolean = read ? read.toLowerCase() === 'true' : undefined;

    if (userId && type && read !== undefined) {
      return this.notificationService.getNotificationsByUserTypeAndRead(
        userId,
        type,
        readBoolean!,
        includeArray,
      );
    } else if (userId && type) {
      return this.notificationService.getNotificationsByUserAndType(
        userId,
        type,
        includeArray,
      );
    } else if (userId && read !== undefined) {
      return this.notificationService.getNotificationsByUserAndRead(
        userId,
        readBoolean!,
        includeArray,
      );
    } else if (type && read !== undefined) {
      return this.notificationService.getNotificationsByTypeAndRead(
        type,
        readBoolean!,
        includeArray,
      );
    } else if (userId) {
      return this.notificationService.getNotificationsByUser(
        userId,
        includeArray,
      );
    } else if (type) {
      return this.notificationService.getNotificationsByType(
        type,
        includeArray,
      );
    } else if (read !== undefined) {
      return this.notificationService.getNotificationsByRead(
        readBoolean!,
        includeArray,
      );
    }
    return this.notificationService.getNotifications(includeArray);
  }

  @Get('user/:userId')
  async getNotificationsByUser(
    @Param('userId') userId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.notificationService.getNotificationsByUser(
      userId,
      includeArray,
    );
  }

  @Get('type/:type')
  async getNotificationsByType(
    @Param('type') type: NotificationType,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.notificationService.getNotificationsByType(type, includeArray);
  }

  @Get('read/:read')
  async getNotificationsByRead(
    @Param('read') read: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const readBoolean = read.toLowerCase() === 'true';
    return this.notificationService.getNotificationsByRead(
      readBoolean,
      includeArray,
    );
  }

  @Put(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() notification: NotificationCreateDto,
  ) {
    return this.notificationService.updateNotification(id, notification);
  }

  @Patch(':id')
  async partialUpdateNotification(
    @Param('id') id: string,
    @Body() update: NotificationUpdateDto,
  ) {
    return this.notificationService.partialUpdateNotification(id, update);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.deleteNotification(id);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Body('userId') userId?: string) {
    if (userId) {
      return this.notificationService.markAllAsReadForUser(userId);
    }
    return this.notificationService.markAllAsRead();
  }
}
