/* eslint-disable @typescript-eslint/no-unsafe-argument */
// notification.consumer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service.js';
import { RabbitMQConfig } from '../../shared/rabbitmq/config/rabbitmq.config.js';
import {
  createRecipientMapConcise,
  NotificationStatus,
} from '../notification.types.js';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ContactDetailsService } from '../../common/contact-details/contact-details.service.js';
import { UserService } from '../../users/user/user.service.js';
import { SingleNotificationEntityDto } from '../notification.dto.js';

@Injectable()
export class StepNotificationConsumer {
  private readonly logger = new Logger(StepNotificationConsumer.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly contactDetailsService: ContactDetailsService,
    private readonly userService: UserService,
  ) {}

  // Listen for system events that should trigger notifications
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.ASSIGNED,
    queue: 'notifications.system.events.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleStepAssigned(_message: any) {
    const message = _message.data;
    this.logger.debug(
      `Processing notifications event for step: ${JSON.stringify(message)}`,
    );
    this.logger.debug(
      `Processing notifications event for step: ${message.stepId}`,
    );

    const contactDetails = (
      await this.contactDetailsService.findByOwner(message.assigneeId)
    )[0];

    const agent = await this.userService.findById(message.assigneeId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...cDetails } = contactDetails.dataValues;
    const notification: SingleNotificationEntityDto = {
      userId: message.assigneeId,
      recipientMap: createRecipientMapConcise(cDetails),
      urgency: 'low',
      userPreferences: cDetails.preference,
      isUserOnline: false,
      event: 'step.assigned',
      userName: agent!.dataValues.name || 'User',
      locale: 'en',
      status: NotificationStatus.PENDING,
      retryCount: 0,
      channelsToUse: [],
      variables: {
        stepId: message.stepId,
        shipmentId: message.shipmentId,
        journeyId: message.journeyId,
        agentId: message.agentId,
        operatorId: message.operatorId,
        dueDate: '100000',
      },
    };

    try {
      await this.notificationService.processSingleNotification(notification);
    } catch (error) {
      this.logger.error(
        `Failed to process system event ${message.type}:`,
        error,
      );
      throw error;
    }
  }

  // Listen for system events that should trigger notifications
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.STATE_CHANGED,
    queue: 'notifications.system.events.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleStateChange(_message: any) {
    const message = _message.data;
    this.logger.debug(
      `Processing notifications event for step: ${message.stepId}`,
    );

    const contactDetails = (
      await this.contactDetailsService.findByOwner(message.assigneeId)
    )[0];

    const agent = await this.userService.findById(message.assigneeId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...cDetails } = contactDetails.dataValues;
    const notification: SingleNotificationEntityDto = {
      userId: message.assigneeId,
      recipientMap: createRecipientMapConcise(cDetails),
      urgency: 'low',
      userPreferences: cDetails.preference,
      isUserOnline: false,
      event: 'step.assigned',
      userName: agent!.dataValues.name || 'User',
      locale: 'en',
      status: NotificationStatus.PENDING,
      retryCount: 0,
      channelsToUse: [],
      variables: {
        stepId: message.stepId,
        shipmentId: message.shipmentId,
        journeyId: message.journeyId,
        agentId: message.agentId,
        operatorId: message.operatorId,
        dueDate: '100000',
      },
    };

    try {
      await this.notificationService.processSingleNotification(notification);
    } catch (error) {
      this.logger.error(
        `Failed to process system event ${message.type}:`,
        error,
      );
      throw error;
    }
  }
}
