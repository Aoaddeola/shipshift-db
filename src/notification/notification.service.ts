/* eslint-disable @typescript-eslint/no-unsafe-return */
// notification.orbitdb.service.ts
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDatabase } from '../db/orbitdb/inject-database.decorator.js';
import { Database } from '../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import {
  NotificationEntity,
  NotificationRuleEntity,
  NotificationType,
} from './notification.types.js';
import { MessageBusService } from '../shared/rabbitmq/rabbitmq.service.js';
import {
  SingleNotificationDto,
  NotificationResponseDto,
  RenderedNotificationDto,
  RenderedContentDto,
  SingleNotificationEntityDto,
} from './notification.dto.js';
import { RabbitMQConfig } from '../shared/rabbitmq/config/rabbitmq.config.js';
import { NotificationTemplateEntity } from '../notification-template/notification-template.types.js';
import { NotificationTemplateService } from '..//notification-template/notification-template.service.js';
import {
  Stakeholder,
  StakeholderRole,
  Step,
  StepState,
} from '../onchain/step/step.types.js';
import { ContactDetailsService } from '../settings/contact-details/contact-details.service.js';
import { UserService } from '../users/user/user.service.js';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    @InjectDatabase('notification')
    private notificationDatabase: Database<NotificationEntity>,

    @InjectDatabase('notification-rule')
    private ruleDatabase: Database<NotificationRuleEntity>,

    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,

    @Inject(NotificationTemplateService)
    private readonly notificationTemplateService: NotificationTemplateService,

    @Inject(ContactDetailsService)
    private readonly contactDetailsService: ContactDetailsService,

    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    // Wait a bit for databases to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await this.initializeDefaultRules();

      // Schedule cleanup job (once per day)
      this.cleanupInterval = setInterval(
        () => {
          this.cleanupOldNotifications().catch((error) =>
            this.logger.error('Cleanup job failed:', error),
          );
        },
        24 * 60 * 60 * 1000,
      );

      this.logger.log('OrbitDB Notification service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize notification service:', error);
    }
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // ==================== MAIN NOTIFICATION METHODS ====================

  /**
   * Process single notification (compatible with existing /notify endpoint)
   */
  async processSingleNotification(
    notification: SingleNotificationEntityDto,
  ): Promise<NotificationResponseDto> {
    const notificationId = randomUUID();
    const now = new Date().toISOString();

    try {
      // TODO: Implement method for assigning value to isUserOnline
      // Determine which channels to use based on preferences and recipient map
      const channelsToUse = this.determineChannelsToUse(notification);

      if (channelsToUse.length === 0) {
        return {
          status: 'warning',
          message:
            'No channels available for notification. Check user preferences and recipient addresses.',
          timestamp: now,
          notificationId,
          channelsProcessed: [],
          channelsCount: 0,
        };
      }

      const n = {
        ...notification,
        channelsToUse,
        id: notificationId,
        createdAt: now,
        updatedAt: now,
      };

      // Save notification to OrbitDB
      await this.notificationDatabase.put(n);
      this.logger.debug(`Notification saved to OrbitDB: ${notificationId}`);

      // Send single command to process the notification
      await this.sendNotificationProcessingCommand(n);

      return {
        status: 'success',
        message: 'Notification queued for processing',
        timestamp: now,
        notificationId,
        channelsProcessed: channelsToUse,
        channelsCount: channelsToUse.length,
      };
    } catch (error) {
      this.logger.error('Failed to process notification:', error);

      // Create failed notification record
      const failedNotification: NotificationEntity = {
        id: notificationId,
        userId: notification.userId,
        recipientMap: notification.recipientMap,
        urgency: notification.urgency,
        userPreferences: notification.userPreferences,
        isUserOnline: notification.isUserOnline,
        event: notification.event,
        userName: notification.userName,
        locale: notification.locale,
        channelsToUse: [],
        status: 'failed',
        retryCount: 0,
        errorDetails: {
          message: error.message,
          stack: error.stack,
        },
        createdAt: now,
        updatedAt: now,
      };

      await this.notificationDatabase.put(failedNotification);

      return {
        status: 'error',
        message: `Failed to process notification: ${error.message}`,
        timestamp: now,
        notificationId,
      };
    }
  }

  /**
   * Process batch notifications (compatible with existing /notify-many endpoint)
   */
  // async processBatchNotifications(
  //   batchDto: BatchNotificationDto,
  // ): Promise<NotificationResponseDto[]> {
  //   const results: NotificationResponseDto[] = [];
  //   const batchId = randomUUID();

  //   try {
  //     this.logger.log(
  //       `Processing batch ${batchId} with ${Object.entries(batchDto.notifications).length} notifications`,
  //     );

  //     for (const notificationDto of batchDto.notifications) {
  //       try {
  //         const result = await this.processSingleNotification(notificationDto);
  //         results.push(result);
  //       } catch (error) {
  //         this.logger.error(
  //           `Failed to process notification for user ${notificationDto.userId}:`,
  //           error,
  //         );

  //         results.push({
  //           status: 'error',
  //           message: `Failed to process notification: ${error.message}`,
  //           timestamp: new Date().toISOString(),
  //         });
  //       }
  //     }

  //     // Emit batch completion event
  //     await this.messageBus.emitEvent('notification.batch.completed', {
  //       batchId,
  //       total: Object.entries(batchDto.notifications).length,
  //       successful: results.filter((r) => r.status === 'success').length,
  //       failed: results.filter((r) => r.status === 'error').length,
  //       timestamp: new Date().toISOString(),
  //     });
  //   } catch (error) {
  //     this.logger.error(`Failed to process batch ${batchId}:`, error);

  //     // Return error for all notifications in batch
  //     return Object.entries(batchDto.notifications).map(() => ({
  //       status: 'error',
  //       message: `Batch processing failed: ${error.message}`,
  //       timestamp: new Date().toISOString(),
  //     }));
  //   }

  //   return results;
  // }

  // ==================== HELPER METHODS ====================

  private determineChannelsToUse(
    notificationDto: SingleNotificationDto,
  ): NotificationType[] {
    const channels: NotificationType[] = [];

    // Check each channel
    for (const channel of Object.values(NotificationType)) {
      const channelStr = channel as NotificationType;

      // Check if user has preference for this channel
      const hasPreference = notificationDto.userPreferences[channelStr];

      // Check if recipient map has address for this channel
      const hasRecipient = notificationDto.recipientMap[channelStr];

      if (hasPreference && hasRecipient) {
        channels.push(channelStr);
      }
    }

    // If user is online and has session/websocket, prioritize those
    if (notificationDto.isUserOnline) {
      const onlineChannels = channels.filter(
        (ch) =>
          ch === NotificationType.Session || ch === NotificationType.WebSocket,
      );
      if (onlineChannels.length > 0) {
        return [
          ...onlineChannels,
          ...channels.filter(
            (ch) =>
              !onlineChannels.includes(
                ch as NotificationType.Session | NotificationType.WebSocket,
              ),
          ),
        ];
      }
    }

    // If urgency is high, include all possible channels
    if (notificationDto.urgency === 'high') {
      return channels;
    }

    // For medium urgency, exclude SMS (more expensive)
    if (notificationDto.urgency === 'medium') {
      return channels.filter((ch) => ch !== NotificationType.SMS);
    }

    // For low urgency, only use least intrusive channels
    if (notificationDto.urgency === 'low') {
      return channels.filter(
        (ch) =>
          ch === NotificationType.Session ||
          ch === NotificationType.WebSocket ||
          ch === NotificationType.Email,
      );
    }

    return channels;
  }

  private initializeChannelStatus(
    channels: NotificationType[],
  ): Record<string, any> {
    const status: Record<string, any> = {};
    channels.forEach((channel) => {
      status[channel] = {
        sent: false,
        attempts: 0,
        lastAttempt: null,
      };
    });
    return status;
  }

  private async sendNotificationProcessingCommand(
    notification: NotificationEntity,
  ): Promise<void> {
    try {
      // Get template for event
      const template =
        await this.notificationTemplateService.getTemplateForEvent(
          notification.event,
          notification.locale,
        );

      // Prepare the processing command payload
      const payload = {
        notificationId: notification.id,
        userId: notification.userId,
        userName: notification.userName,
        event: notification.event,
        locale: notification.locale,
        urgency: notification.urgency,
        isUserOnline: notification.isUserOnline,
        recipientMap: notification.recipientMap,
        channelsToUse: notification.channelsToUse,
        variables: notification.variables,
        template: template || null,
        timestamp: new Date().toISOString(),
      };

      // Send single command to process notification
      await this.messageBus.sendCommand(
        RabbitMQConfig.NOTIFICATION.COMMANDS.SEND,
        payload,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-notification-id': notification.id,
            'x-user-id': notification.userId,
            'x-urgency': notification.urgency,
            'x-channels-count': notification.channelsToUse.length.toString(),
          },
        },
      );

      this.logger.debug(
        `Sent processing command for notification: ${notification.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send processing command for ${notification.id}:`,
        error,
      );

      // Update notification status to failed
      notification.status = 'failed';
      notification.errorDetails = {
        message: `Failed to send processing command: ${error.message}`,
        stack: error.stack,
      };
      notification.updatedAt = new Date().toISOString();
      await this.notificationDatabase.put(notification);

      throw error;
    }
  }

  // ==================== TEMPLATE METHODS ====================

  async mapEventToTemplate(): Promise<number> {
    return 0;
  }

  async deleteNotification(id: string): Promise<void> {
    await this.notificationDatabase.del(id);
    this.logger.log(`Deleted notification ${id} successfully`);
  }

  // ==================== NOTIFICATION QUERY METHODS ====================

  async getNotification(id: string): Promise<NotificationEntity | null> {
    if (!this.notificationDatabase) {
      return null;
    }

    return await this.notificationDatabase.get(id);
  }

  async getNotificationsByUser(
    userId: string,
    limit: number = 50,
    status?: NotificationEntity['status'],
  ): Promise<NotificationEntity[]> {
    if (!this.notificationDatabase) {
      return [];
    }

    const allNotifications = await this.notificationDatabase.all();

    let filtered = allNotifications.filter((n) => n.userId === userId);

    if (status) {
      filtered = filtered.filter((n) => n.status === status);
    }

    // Sort by createdAt descending (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return filtered.slice(0, limit);
  }

  async getNotificationsByEvent(
    event: string,
    startDate?: string,
    endDate?: string,
  ): Promise<NotificationEntity[]> {
    if (!this.notificationDatabase) {
      return [];
    }

    const allNotifications = await this.notificationDatabase.all();

    let filtered = allNotifications.filter((n) => n.event === event);

    if (startDate || endDate) {
      filtered = filtered.filter((n) => {
        const createdAt = new Date(n.createdAt);
        if (startDate && createdAt < new Date(startDate)) return false;
        if (endDate && createdAt > new Date(endDate)) return false;
        return true;
      });
    }

    return filtered;
  }
  private updateLocks = new Map<string, Promise<void>>();

  async updateNotificationStatus(
    notificationId: string,
    channel: NotificationType,
    status: 'sent' | 'delivered' | 'failed' | 'read',
    metadata?: { messageId?: string; error?: string; sentAt?: string },
  ): Promise<NotificationEntity | null> {
    // Create or get existing lock for this notification
    let releaseLock: () => void;
    const lockKey = `notification:${notificationId}`;

    // Wait for any existing lock to release
    while (this.updateLocks.has(lockKey)) {
      await this.updateLocks.get(lockKey);
    }

    // Create new lock
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.updateLocks.set(lockKey, lockPromise);

    try {
      const notification = await this.getNotification(notificationId);
      if (!notification) return null;

      const now = new Date().toISOString();

      if (!notification.channelStatus) {
        notification.channelStatus = {};
      }

      const existingStatus = notification.channelStatus[channel] || {
        sent: false,
        attempts: 0,
      };

      // Update channel status
      notification.channelStatus[channel] = {
        ...existingStatus,
        sent:
          status === 'failed'
            ? false
            : status === 'sent' || status === 'delivered' || status === 'read',
        ...(metadata?.messageId && { messageId: metadata.messageId }),
        ...(metadata?.error && { error: metadata.error }),
        ...(status === 'sent' && { sentAt: metadata?.sentAt || now }),
        attempts:
          existingStatus.attempts! +
          (status === 'sent' || status === 'failed' ? 1 : 0),
        lastAttempt: now,
      };

      // Check if all channels have been processed
      const allChannelsProcessed = notification.channelsToUse.every(
        (ch) =>
          notification.channelStatus![ch]?.sent === true ||
          notification.channelStatus![ch]?.error,
      );

      if (allChannelsProcessed) {
        const anyFailed = notification.channelsToUse.some(
          (ch) => notification.channelStatus![ch]?.error,
        );

        if (anyFailed) {
          notification.status = 'partially_sent';
        } else {
          notification.status = 'sent';
        }
      }

      if (status === 'sent' && !notification.sentAt) {
        notification.sentAt = now;
      } else if (status === 'delivered' && !notification.deliveredAt) {
        notification.deliveredAt = now;
      } else if (status === 'read' && !notification.readAt) {
        notification.readAt = now;
      }

      notification.updatedAt = now;

      await this.notificationDatabase.put(notification);
      return notification;
    } finally {
      // Release the lock
      releaseLock!();
      this.updateLocks.delete(lockKey);
    }
  }

  async markAsRead(notificationId: string): Promise<NotificationEntity | null> {
    const notification = await this.getNotification(notificationId);
    if (!notification) return null;

    notification.status = 'read';
    notification.readAt = new Date().toISOString();
    notification.updatedAt = new Date().toISOString();

    await this.notificationDatabase.put(notification);
    return notification;
  }

  async markAllAsRead(userId: string): Promise<NotificationEntity[] | null> {
    const notifications = await this.getNotificationsByUser(userId);
    if (notifications.length === 0) return null;

    const notificationEntity = await Promise.all(
      notifications.map(async (notification) => {
        notification.status = 'read';
        notification.readAt = new Date().toISOString();
        notification.updatedAt = new Date().toISOString();

        await this.notificationDatabase.put(notification);
        return notification;
      }),
    );

    return notificationEntity;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotificationsByUser(
      userId,
      undefined,
      'sent',
    );
    return notifications.filter((n) => !n.readAt).length;
  }

  async retryFailedNotification(
    notificationId: string,
  ): Promise<NotificationEntity | null> {
    const notification = await this.getNotification(notificationId);
    if (!notification) return null;

    // Check if notification is eligible for retry
    if (
      notification.status !== 'failed' &&
      notification.status !== 'partially_sent'
    ) {
      throw new Error(
        `Notification ${notificationId} is not in a retryable state`,
      );
    }

    if (notification.retryCount >= 3) {
      throw new Error(
        `Notification ${notificationId} has exceeded maximum retry attempts`,
      );
    }

    const now = new Date().toISOString();

    // Reset status and increment retry count
    notification.status = 'pending';
    notification.retryCount = (notification.retryCount || 0) + 1;
    notification.updatedAt = now;

    // Reset channel status for failed channels
    notification.channelsToUse.forEach((channel) => {
      const channelStatus = notification.channelStatus![channel];
      if (channelStatus?.error) {
        channelStatus.sent = false;
        channelStatus.error = undefined;
        channelStatus.lastAttempt = now;
      }
    });

    await this.notificationDatabase.put(notification);

    // Send retry command
    await this.sendNotificationProcessingCommand(notification);

    return notification;
  }

  // ==================== STATISTICS ====================

  async getStatistics(
    timeRange: 'day' | 'week' | 'month' = 'day',
  ): Promise<any> {
    if (!this.notificationDatabase) {
      throw new Error('Notification database not initialized');
    }

    const startDate = new Date();

    switch (timeRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const allNotifications = await this.notificationDatabase.all();

    const filteredNotifications = allNotifications.filter(
      (notification) => new Date(notification.createdAt) >= startDate,
    );

    const byStatus = filteredNotifications.reduce(
      (acc, notification) => {
        acc[notification.status] = (acc[notification.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byEvent = filteredNotifications.reduce(
      (acc, notification) => {
        acc[notification.event] = (acc[notification.event] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byChannel = filteredNotifications.reduce(
      (acc, notification) => {
        notification.channelsToUse.forEach((channel) => {
          acc[channel] = (acc[channel] || 0) + 1;
        });
        return acc;
      },
      {} as Record<NotificationType, number>,
    );

    const total = filteredNotifications.length;
    const successful = filteredNotifications.filter(
      (n) =>
        n.status === 'sent' || n.status === 'delivered' || n.status === 'read',
    ).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      total,
      timeRange,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      byStatus,
      byEvent,
      byChannel,
      successRate: `${successRate.toFixed(2)}%`,
      summary: {
        pending: byStatus.pending || 0,
        sent: byStatus.sent || 0,
        failed: byStatus.failed || 0,
        partially_failed: byStatus.partially_failed || 0,
        read: byStatus.read || 0,
      },
    };
  }

  // ==================== INITIALIZATION ====================

  async initializeDefaultRules(): Promise<void> {
    if (!this.ruleDatabase) {
      this.logger.warn('Rule database not ready, skipping initialization');
      return;
    }

    try {
      const existingRules = await this.ruleDatabase.all();

      if (existingRules.length === 0) {
        this.logger.log('Initializing default notification rules');

        const defaultRules: Array<
          Omit<NotificationRuleEntity, 'id' | 'createdAt' | 'updatedAt'>
        > = [
          {
            event: 'booking_confirmed',
            templateId: 'booking_confirmed',
            priority: 10,
            isActive: true,
            isSystemRule: true,
            description: 'Rule for booking confirmation notifications',
          },
          {
            event: 'password_reset',
            templateId: 'password_reset',
            priority: 8,
            isActive: true,
            isSystemRule: true,
            description: 'Rule for password reset notifications',
          },
          {
            event: 'payment_received',
            templateId: 'payment_received',
            priority: 7,
            isActive: true,
            isSystemRule: true,
            description: 'Rule for payment received notifications',
          },
        ];

        for (const rule of defaultRules) {
          await this.ruleDatabase.put({
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...rule,
          });
        }

        this.logger.log(`Created ${defaultRules.length} default rules`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize default rules:', error);
    }
  }

  // ==================== CLEANUP ====================

  async cleanupOldNotifications(retentionDays: number = 90): Promise<number> {
    if (!this.notificationDatabase) {
      this.logger.warn('Notification database not ready, skipping cleanup');
      return 0;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const allNotifications = await this.notificationDatabase.all();

      const oldNotifications = allNotifications.filter((notification) => {
        const createdAt = new Date(notification.createdAt);
        return createdAt < cutoffDate && notification.status !== 'pending';
      });

      for (const notification of oldNotifications) {
        await this.notificationDatabase.del(notification.id);
      }

      this.logger.log(
        `Cleaned up ${oldNotifications.length} old notifications`,
      );
      return oldNotifications.length;
    } catch (error) {
      this.logger.error('Cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Get rendered content for a notification
   */
  async getRenderedContent(
    notificationId: string,
    channel: NotificationType,
    includeHtml: boolean = true,
    preferredLanguage?: string,
  ): Promise<RenderedContentDto | null> {
    const notification = await this.getNotification(notificationId);
    if (!notification) {
      return null;
    }

    // Get template for the event
    const template = await this.notificationTemplateService.getTemplateForEvent(
      notification.event,
      preferredLanguage || notification.locale,
    );

    if (!template) {
      this.logger.warn(
        `No template found for event ${notification.event} and language ${preferredLanguage || notification.locale}`,
      );
      return null;
    }

    // Prepare template variables from notification
    const templateVariables = this.prepareTemplateVariables(notification);

    // Get channel-specific or default content
    const { subject, body, isHtml } = this.getContentForChannel(
      template,
      channel,
      templateVariables,
      includeHtml,
    );

    return {
      subject,
      body,
      isHtml,
      channel,
      metadata: {
        templateId: template.templateId,
        language: template.language,
        variablesUsed: Object.keys(templateVariables),
        renderedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Prepare template variables from notification
   */
  private prepareTemplateVariables(
    notification: NotificationEntity,
  ): Record<string, any> {
    const baseVariables = {
      userName: notification.userName,
      userId: notification.userId,
      event: notification.event,
      locale: notification.locale,
      urgency: notification.urgency,
      isUserOnline: notification.isUserOnline,
      date: new Date().toLocaleDateString(notification.locale),
      time: new Date().toLocaleTimeString(notification.locale),
      timestamp: new Date().toISOString(),
    };

    // Add any additional variables from notification
    if (notification.variables) {
      return { ...baseVariables, ...notification.variables };
    }

    return baseVariables;
  }

  /**
   * Get content for specific channel
   */
  private getContentForChannel(
    template: NotificationTemplateEntity,
    channel: NotificationType,
    variables: Record<string, any>,
    includeHtml: boolean,
  ): { subject?: string; body: string; isHtml: boolean } {
    const channelContent = template.channelSpecificContent?.[channel];
    let subject = template.defaultSubject;
    let body = template.defaultBody;
    let isHtml = false;

    // Use channel-specific content if available
    if (channelContent) {
      // For email, use HTML if available and requested
      if (
        channel === NotificationType.Email &&
        includeHtml &&
        template.channelSpecificContent?.[channel]!.htmlBody
      ) {
        if (template.channelSpecificContent?.[channel].subject) {
          subject = template.channelSpecificContent?.[channel].subject;
        }
        body = template.channelSpecificContent?.[channel].htmlBody;
        isHtml = true;
      }
    }

    const processTemplate = (template: string): string => {
      const processBlock = (text: string): string => {
        // Process conditionals first
        const conditionalRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

        let processed = text.replace(
          conditionalRegex,
          (match, conditionName, content) => {
            if (
              variables[conditionName] !== undefined &&
              variables[conditionName]
            ) {
              // Recursively process the inner content
              return processBlock(`${content}`);
            }
            return '';
          },
        );

        // Then replace variables in the processed text
        processed = processed.replace(
          /\{\{(\w+)\}\}/g,
          (match, variableName) => {
            return variables[variableName] !== undefined
              ? String(variables[variableName])
              : match;
          },
        );

        return processed;
      };

      return processBlock(template);
    };

    // Replace template variables
    const replaceVariables = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        return variables[variableName] !== undefined
          ? String(variables[variableName])
          : match;
      });
    };

    return {
      subject: subject ? replaceVariables(subject) : undefined,
      body: processTemplate(body),
      isHtml,
    };
  }

  /**
   * Get multiple notifications with rendered content
   */
  async getNotificationsWithRenderedContent(
    userId: string,
    options: {
      channels: NotificationType[];
      includeHtml?: boolean;
      preferredLanguage?: string;
      limit?: number;
      status?: NotificationEntity['status'];
    },
  ): Promise<RenderedNotificationDto[]> {
    const notifications = await this.getNotificationsByUser(
      userId,
      options.limit || 50,
      options.status,
    );

    const result: RenderedNotificationDto[] = [];

    for (const notification of notifications) {
      // Get rendered content for each requested channel
      // We'll use the first successful channel or the user's preferred channel
      for (const channel of options.channels) {
        const renderedContent = await this.getRenderedContent(
          notification.id,
          channel,
          options.includeHtml || false,
          options.preferredLanguage || notification.locale,
        );

        if (renderedContent) {
          result.push({
            notificationId: notification.id,
            event: notification.event,
            userId: notification.userId,
            userName: notification.userName,
            locale: notification.locale,
            createdAt: notification.createdAt,
            status: notification.status,
            renderedContent,
          });
          break; // Use the first successful channel
        }
      }
    }

    return result;
  }

  /**
   * Get single notification with rendered content
   */
  async getNotificationWithRenderedContent(
    notificationId: string,
    channel: NotificationType,
    includeHtml: boolean = true,
    preferredLanguage?: string,
  ): Promise<RenderedNotificationDto | null> {
    const notification = await this.getNotification(notificationId);
    if (!notification) {
      return null;
    }

    const renderedContent = await this.getRenderedContent(
      notificationId,
      channel,
      includeHtml,
      preferredLanguage || notification.locale,
    );

    if (!renderedContent) {
      return null;
    }

    return {
      notificationId: notification.id,
      event: notification.event,
      userId: notification.userId,
      userName: notification.userName,
      locale: notification.locale,
      createdAt: notification.createdAt,
      status: notification.status,
      renderedContent,
    };
  }

  async buildStepNotificationPayload(
    step: Step,
    stakeholder: Stakeholder,
    sourceEvent: string,
  ): Promise<NotificationEntity> {
    const variables = this.buildStepVariables(step, stakeholder.role);
    const contactDetails = (
      await this.contactDetailsService.findByOwner(stakeholder.userId)
    )[0];
    const user = await this.userService.findById(stakeholder.userId);
    const result: NotificationEntity = {
      userId: stakeholder.userId,
      recipientMap: contactDetails,
      urgency: 'medium',
      userPreferences: contactDetails.preference,
      isUserOnline: false,
      event: sourceEvent,
      userName: user!.name,
      locale: 'en',
      status: 'sent',
      retryCount: 0,
      channelsToUse: [],
      createdAt: '',
      updatedAt: '',
      variables: { ...variables, dueDate: step.journey!.availableTo },
      id: '',
    };

    return result;
  }

  private buildStepVariables(
    step: Step,
    role: StakeholderRole,
  ): Record<string, any> {
    const baseVariables: Record<string, any> = {
      stepId: step.id,
      shipmentId: step.shipmentId,
      journeyId: step.journeyId,
      agentId: step.agentId,
      senderId: step.senderId,
      recipientId: step.recipientId,
      holderId: step.holderId,
      operatorId: step.operatorId,
      colonyId: step.colonyId,
      state: StepState[step.state],
      timestamp: new Date().toISOString(),
      userRole: role,
    };

    // Add stepParams if available
    if (step.stepParams) {
      baseVariables['spCost'] = step.stepParams.spCost;
      baseVariables['spETA'] = step.stepParams.spETA;
      if (
        step.stepParams.spPerformer &&
        Array.isArray(step.stepParams.spPerformer)
      ) {
        baseVariables['spPerformer'] = step.stepParams.spPerformer[0]; // Wallet address
      }
    }

    // Add shipment info if available
    if (step.shipment) {
      baseVariables['shipmentReference'] = step.shipment.id; // TODO:
      baseVariables['shipmentStatus'] = step.shipment.status;
    }

    // Add journey info if available
    if (step.journey) {
      baseVariables['journeyRoute'] =
        `${step.journey.fromLocation?.street + ' ' + step.journey.fromLocation?.city + ' ' + step.journey.fromLocation?.state} 
          → ${step.journey.toLocation?.street + ' ' + step.journey.toLocation?.city + ' ' + step.journey.toLocation?.state}`;
    }

    return baseVariables;
  }
}
