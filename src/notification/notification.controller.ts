// notification.orbitdb.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  // UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrbitDBNotificationService } from './notification.service.js';
import {
  SingleNotificationDto,
  BatchNotificationDto,
  NotificationResponseDto,
} from './notification.dto.js';
// import { JwtNodeOpAuthGuard } from 'src/guards/jwt-nodeOp-auth.guard.js';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationOrbitDBController {
  constructor(
    private readonly notificationService: OrbitDBNotificationService,
  ) {}

  // @UseGuards(JwtNodeOpAuthGuard)
  @Post('notify')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send notification to a single user' })
  @ApiBody({ type: SingleNotificationDto })
  @ApiResponse({ status: 202, type: NotificationResponseDto })
  async notifySingle(
    @Body() body: SingleNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.processSingleNotification(body);
  }

  // @UseGuards(JwtNodeOpAuthGuard)
  @Post('notify-many')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send notifications to multiple users' })
  @ApiBody({ type: BatchNotificationDto })
  @ApiResponse({ status: 202, type: [NotificationResponseDto] })
  async notifyMany(
    @Body() body: BatchNotificationDto,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationService.processBatchNotifications(body);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit: string = '50',
    @Query('status') status?: string,
  ) {
    const notifications = await this.notificationService.getNotificationsByUser(
      userId,
      parseInt(limit),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      status as any,
    );

    return {
      status: 'success',
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return {
      status: 'success',
      userId,
      unreadCount: count,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('read/:notificationId')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('notificationId') notificationId: string) {
    const notification =
      await this.notificationService.markAsRead(notificationId);
    return {
      status: notification ? 'success' : 'error',
      message: notification
        ? 'Notification marked as read'
        : 'Notification not found',
      notification,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  async getStatistics(@Query('range') range: 'day' | 'week' | 'month' = 'day') {
    const stats = await this.notificationService.getStatistics(range);
    return {
      status: 'success',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get notification templates' })
  async getTemplates(
    @Query('active') active: string = 'true',
    @Query('language') language?: string,
  ) {
    const templates = await this.notificationService.getTemplates({
      isActive: active === 'true',
      language,
    });

    return {
      status: 'success',
      data: templates,
      count: templates.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async healthCheck() {
    try {
      const stats = await this.notificationService.getStatistics('day');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats: {
          totalToday: stats.total,
          successRate: stats.successRate,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
