/* eslint-disable @typescript-eslint/no-unsafe-argument */
// notification.consumer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MessageBusService } from '../shared/rabbitmq/rabbitmq.service.js';
import { OrbitDBNotificationService } from './notification.service.js';
import { RabbitMQConfig } from '../shared/rabbitmq/config/rabbitmq.config.js';
import { NotificationType } from './notification.types.js';
import {
  NotificationResult,
  SingleNotificationDto,
} from './notification.dto.js';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class NotificationConsumerService {
  private readonly logger = new Logger(NotificationConsumerService.name);

  constructor(
    private readonly messageBus: MessageBusService,
    private readonly notificationService: OrbitDBNotificationService,
  ) {}

  private async postData(url: string, data: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Check if response is OK
    if (!response.ok) {
      // Get the response text to see what the server returned
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type before parsing as JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.warn('Response is not JSON:', text.substring(0, 100));
      throw new Error('Server did not return JSON');
    }

    return await response.json();
  }

  // Listen for notification commands from the controller
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.NOTIFICATION.COMMANDS.SEND,
    queue: 'notifications.send.commands.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('NotificationConsumerService');
      logger.error(
        `Failed to process command notification.send.*:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleSendCommands(_message: any) {
    const message = _message.data;

    const notification = await this.notificationService.getNotification(
      message.notificationId,
    );

    this.logger.debug(
      `Processing notification command: ${message.notificationId}`,
    );

    if (notification === null) {
      this.logger.warn('Notification not found: ' + message.notificationId);
      throw new Error('Notification not found');
    }

    try {
      // In a real implementation, you would:
      // 1. Call the appropriate channel service (email, SMS, push, etc.)
      // 2. Update notification status based on result

      const singleNotification: SingleNotificationDto = {
        userId: notification.userId,
        recipientMap: notification.recipientMap,
        urgency: notification.urgency,
        userPreferences: notification.userPreferences,
        isUserOnline: notification.isUserOnline,
        event: notification.event,
        userName: notification.userName,
        locale: notification.locale,
      };

      const url = process.env.NEXT_PUBLIC_NOTIFICATION_URL! + '/notify';
      const result: {
        success: boolean;
        message: string;
        results: NotificationResult[];
      } = await this.postData(url, singleNotification);

      // Update notification status
      await Promise.all(
        result.results.map(async (notification) => {
          this.logger.debug('notification', notification);
          await this.notificationService.updateNotificationStatus(
            message.notificationId,
            notification.channel,
            notification.success ? 'sent' : 'failed',
            {
              messageId: '',
              sentAt: new Date().toISOString(),
              error: notification.error === undefined ? '' : notification.error,
            },
          );
          this.logger.log(
            `Notification ${message.notificationId} ${!notification.success ? 'not' : ''} sent via ${notification.channel}`,
          );
        }),
      );
    } catch (error) {
      await Promise.all(
        // Object.entries(notification.userPreferences)
        Object.entries(notification.userPreferences).map(async ([channel]) => {
          this.logger.error(
            `Failed to process ${channel} notification:`,
            error,
          );
          await this.notificationService.updateNotificationStatus(
            message.notificationId,
            channel as NotificationType,
            'failed',
            {
              error: error.message,
              sentAt: new Date().toISOString(),
            },
          );
        }),
      );
      throw error;
    }
  }

  // Listen for system events that should trigger notifications
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: [
      'booking.confirmed',
      'payment.received',
      'password.reset.requested',
      'shipment.delivered',
      'step.completed',
    ],
    queue: 'notifications.system.events.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleSystemEvents(message: any) {
    this.logger.debug(
      `Processing system event for notifications: ${message.type}`,
    );

    try {
      // Map system events to notification events
      const eventMap = {
        'booking.confirmed': 'booking_confirmed',
        'payment.received': 'payment_received',
        'password.reset.requested': 'password_reset',
        'shipment.delivered': 'shipment_delivered',
        'step.completed': 'step_completed',
      };

      const notificationEvent = eventMap[message.type] || 'generic';

      // In a real implementation, you would:
      // 1. Look up user from the event data
      // 2. Get user preferences and recipient map
      // 3. Create and send notification

      this.logger.log(
        `Mapped system event ${message.type} to notification event ${notificationEvent}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process system event ${message.type}:`,
        error,
      );
      throw error;
    }
  }
}
