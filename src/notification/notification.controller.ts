/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  NotFoundException,
  BadRequestException,
  Delete,
  Put,
  // UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrbitDBNotificationService } from './notification.service.js';
import {
  SingleNotificationDto,
  BatchNotificationDto,
  NotificationResponseDto,
  RenderedNotificationDto,
  GetRenderedNotificationsDto,
  NotificationType,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './notification.dto.js';
import { NotificationEntity } from './notification.types.js';
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
      status as any,
    );

    return {
      status: 'success',
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('rendered/user/:userId')
  @ApiOperation({
    summary: 'Get notifications with rendered content for a user',
  })
  @ApiResponse({ status: 200, type: [RenderedNotificationDto] })
  async getRenderedNotifications(
    @Param('userId') userId: string,
    @Query() query: GetRenderedNotificationsDto,
    @Query('limit') limit: string = '50',
    @Query('status') status?: string,
  ) {
    const notifications =
      await this.notificationService.getNotificationsWithRenderedContent(
        userId,
        {
          channels: query.channels,
          includeHtml: query.includeHtml,
          preferredLanguage: query.preferredLanguage,
          limit: parseInt(limit),
          status: status as NotificationEntity['status'],
        },
      );

    return {
      status: 'success',
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('rendered/:notificationId')
  @ApiOperation({ summary: 'Get a single notification with rendered content' })
  @ApiResponse({ status: 200, type: RenderedNotificationDto })
  async getRenderedNotification(
    @Param('notificationId') notificationId: string,
    @Query('channel') channel: NotificationType,
    @Query('includeHtml') includeHtml: string = 'true',
    @Query('language') language?: string,
  ) {
    const notification =
      await this.notificationService.getNotificationWithRenderedContent(
        notificationId,
        channel,
        includeHtml === 'true',
        language,
      );

    if (!notification) {
      throw new NotFoundException(
        `Notification ${notificationId} not found or cannot be rendered`,
      );
    }

    return {
      status: 'success',
      data: notification,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('rendered/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get multiple notifications with rendered content in batch',
  })
  @ApiBody({ type: GetRenderedNotificationsDto })
  @ApiResponse({ status: 200, type: [RenderedNotificationDto] })
  async getBatchRenderedNotifications(
    @Body()
    body: GetRenderedNotificationsDto & {
      notificationIds: string[];
    },
  ) {
    const results: RenderedNotificationDto[] = [];

    for (const notificationId of body.notificationIds) {
      for (const channel of body.channels) {
        const notification =
          await this.notificationService.getNotificationWithRenderedContent(
            notificationId,
            channel,
            body.includeHtml || false,
            body.preferredLanguage,
          );

        if (notification) {
          results.push(notification);
          break; // Use the first successful channel for each notification
        }
      }
    }

    return {
      status: 'success',
      data: results,
      count: results.length,
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

  @Post('all-read/:userId')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Param('userId') userId: string) {
    const notification = await this.notificationService.markAllAsRead(userId);
    return {
      status: notification ? 'success' : 'error',
      message:
        !notification && notification!.length > 0
          ? 'Notifications marked as read'
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
  // @UseGuards(JwtNodeOpAuthGuard) // Uncomment if you want to add authentication
  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: CreateNotificationTemplateDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  async createTemplate(
    @Body() createTemplateDto: CreateNotificationTemplateDto,
  ) {
    const template =
      await this.notificationService.createTemplate(createTemplateDto);

    return {
      status: 'success',
      message: 'Template created successfully',
      data: template,
      timestamp: new Date().toISOString(),
    };
  }

  // You can also add update and delete endpoints:

  // @UseGuards(JwtNodeOpAuthGuard)
  @Put('templates/:templateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing notification template' })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    type: CreateNotificationTemplateDto,
  })
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() updateTemplateDto: UpdateNotificationTemplateDto,
  ) {
    // Note: You'll need to implement this method in the service
    // For now, we'll create a new template with updated data
    // You might want to implement a proper update method
    const existingTemplate = await this.notificationService
      .getTemplates({ templateId })
      .then((templates) => templates.find((t) => t.templateId === templateId));

    if (!existingTemplate) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    const updatedTemplateData = {
      ...existingTemplate,
      ...updateTemplateDto,
      updatedAt: new Date().toISOString(),
    };

    // Delete old template and create new one
    await this.notificationService.deleteTemplate(existingTemplate.id);
    const updatedTemplate = await this.notificationService.createTemplate({
      ...updatedTemplateData,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    } as any);

    return {
      status: 'success',
      message: 'Template updated successfully',
      data: updatedTemplate,
      timestamp: new Date().toISOString(),
    };
  }

  // @UseGuards(JwtNodeOpAuthGuard)
  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(@Param('id') id: string) {
    const template = await this.notificationService
      .getTemplates()
      .then((templates) => templates.find((t) => t.id === id));

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    // Prevent deletion of system templates
    if (template.isSystemTemplate) {
      throw new BadRequestException('Cannot delete system templates');
    }

    await this.notificationService.deleteTemplate(id);
  }

  // @UseGuards(JwtNodeOpAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteNotification(@Param('id') id: string) {
    const template = await this.notificationService.getNotification(id);

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    await this.notificationService.deleteNotification(id);
  }

  // Add this endpoint to the controller:

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a notification template by ID' })
  async getTemplateById(@Param('id') id: string) {
    const templates = await this.notificationService.getTemplates();
    const template = templates.find((t) => t.id === id);

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return {
      status: 'success',
      data: template,
      timestamp: new Date().toISOString(),
    };
  }

  // Update the existing getTemplates endpoint:

  @Get('templates')
  @ApiOperation({ summary: 'Get notification templates' })
  async getTemplates(
    @Query('active') active: string = 'true',
    @Query('language') language?: string,
    @Query('templateId') templateId?: string,
    @Query('system') system?: string,
  ) {
    const filters: any = {};

    if (active !== undefined) {
      filters.isActive = active === 'true';
    }

    if (language) {
      filters.language = language;
    }

    if (templateId) {
      filters.templateId = templateId;
    }

    if (system !== undefined) {
      // You might need to add this filter to your service method
    }

    const templates = await this.notificationService.getTemplates(filters);

    return {
      status: 'success',
      data: templates,
      count: templates.length,
      timestamp: new Date().toISOString(),
    };
  }
}
