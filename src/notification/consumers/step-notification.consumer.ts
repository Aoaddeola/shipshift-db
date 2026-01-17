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
import { ContactDetailsService } from '../../settings/contact-details/contact-details.service.js';
import { UserService } from '../../users/user/user.service.js';
import { SingleNotificationEntityDto } from '../notification.dto.js';
import { JourneyService } from '../../logistics/journey/journey.service.js';
import { StepState } from '../../onchain/step/step.types.js';
import { StepStateChangedEvent } from '../../onchain/step/producers/step.producer.js';
import { StepService } from '../../onchain/step/step.service.js';
import { OperatorService } from '../../users/operator/operator.service.js';
import { User } from 'src/users/user/user.model.js';
import { Operator } from 'src/users/operator/operator.types.js';

@Injectable()
export class StepNotificationConsumer {
  private readonly logger = new Logger(StepNotificationConsumer.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly contactDetailsService: ContactDetailsService,
    private readonly userService: UserService,
    private readonly journeyService: JourneyService,
    private readonly stepService: StepService,
    private readonly operatorService: OperatorService,
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
      `Processing notifications event for step: ${message.stepId}`,
    );

    const contactDetails = (
      await this.contactDetailsService.findByOwner(message.assigneeId)
    )[0];

    const agent = await this.userService.findById(message.assigneeId);
    const journey = await this.journeyService.getJourney(message.journeyId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...cDetails } = contactDetails.dataValues;
    const notification: SingleNotificationEntityDto = {
      userId: message.assigneeId,
      recipientMap: createRecipientMapConcise(cDetails),
      urgency: 'low',
      userPreferences: cDetails.preference,
      isUserOnline: false,
      event: 'step.assigned',
      userName: agent!.dataValues.name || 'user',
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
        dueDate: journey.availableTo,
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
    const message = _message.data as StepStateChangedEvent;
    this.logger.debug(
      `Processing notifications event for step: ${message.stepId}`,
    );
    this.logger.debug(
      `Processing notifications event for step: ${JSON.stringify(message)}`,
    );
    let event: string;

    try {
      const step = await this.stepService.getStep(message.stepId);
      switch (message.newState) {
        case StepState.ACCEPTED:
          event = RabbitMQConfig.STEP.EVENTS.ACCEPTED;
          {
            const sender = await this.userService.findById(step.senderId);
            if (!sender) {
              throw new Error(
                `Notification recipient ${step.senderId} not found`,
              );
            }
            await this.sendMessage(step.senderId, sender.name, event, message);
          }
          break;
        case StepState.REJECTED:
          event = RabbitMQConfig.STEP.EVENTS.REJECTED;
          {
            const sender = await this.userService.findById(step.senderId);
            if (!sender) {
              throw new Error(
                `Notification recipient ${step.senderId} not found`,
              );
            }
            await this.sendMessage(step.senderId, sender.name, event, message);
          }
          break;
        case StepState.CANCELLED:
          event = RabbitMQConfig.STEP.EVENTS.CANCELLED;
          {
            const sender = await this.userService.findById(step.senderId);
            if (!sender) {
              throw new Error(
                `Notification recipient ${step.senderId} not found`,
              );
            }
            await this.sendMessage(step.senderId, sender.name, event, message);
          }
          break;
        case StepState.INITIALIZED:
          event = RabbitMQConfig.STEP.EVENTS.INITIALIZED;
          {
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );
            await this.sendMessage(
              operator.id,
              operator.offchain.name,
              event,
              message,
            );
          }
          break;
        case StepState.COMMITTED:
          event = RabbitMQConfig.STEP.EVENTS.COMMITTED;
          {
            const agent = await this.userService.findById(step.agentId);
            const sender = await this.userService.findById(step.senderId);

            await this.sendMultipleMessage([
              {
                recipient: agent,
                event: event,
                variables: message,
              },
              {
                recipient: sender,
                event: event,
                variables: message,
              },
            ]);
          }
          break;
        case StepState.PICKED_UP:
          event = RabbitMQConfig.STEP.EVENTS.MILESTONE.PICKED_UP;
          {
            const agent = await this.userService.findById(step.agentId);
            const sender = await this.userService.findById(step.senderId);
            const journey = await this.journeyService.getJourney(
              step.journeyId,
            );
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );
            const variables = {
              ...message,
              pickupLocation: journey.fromLocationId,
              estimatedDeliveryTime: journey.availableTo,
            };

            await this.sendMultipleMessage([
              {
                recipient: operator,
                event: event,
                variables,
              },
              {
                recipient: agent,
                event: event,
                variables,
              },
              {
                recipient: sender,
                event: event,
                variables,
              },
            ]);
          }
          break;
        case StepState.DROPPED_OFF:
          event = RabbitMQConfig.STEP.EVENTS.MILESTONE.DROPPED_OFF;
          {
            const agent = await this.userService.findById(step.agentId);
            const sender = await this.userService.findById(step.senderId);
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );
            const journey = await this.journeyService.getJourney(
              step.journeyId,
            );
            const variables = {
              ...message,
              dropoffLocation: journey.toLocationId,
            };

            await this.sendMultipleMessage([
              {
                recipient: operator,
                event: event,
                variables,
              },
              {
                recipient: agent,
                event: event,
                variables,
              },
              {
                recipient: sender,
                event: event,
                variables,
              },
            ]);
          }
          break;
        case StepState.FULFILLED:
          event = RabbitMQConfig.STEP.EVENTS.MILESTONE.FULFILLED;
          {
            const agent = await this.userService.findById(step.agentId);
            const sender = await this.userService.findById(step.senderId);
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );

            await this.sendMultipleMessage([
              {
                recipient: operator,
                event: event,
                variables: message,
              },
              {
                recipient: agent,
                event: event,
                variables: message,
              },
              {
                recipient: sender,
                event: event,
                variables: message,
              },
            ]);
          }
          break;
        case StepState.COMMENCED:
          event = RabbitMQConfig.STEP.EVENTS.COMMENCED;
          {
            const agent = await this.userService.findById(step.agentId);
            const sender = await this.userService.findById(step.senderId);
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );
            const journey = await this.journeyService.getJourney(
              step.journeyId,
            );
            const variables = {
              ...message,
              expectedCompletionTime: journey.availableTo,
            };

            await this.sendMultipleMessage([
              {
                recipient: operator,
                event: event,
                variables,
              },
              {
                recipient: agent,
                event: event,
                variables,
              },
              {
                recipient: sender,
                event: event,
                variables,
              },
            ]);
          }
          break;
        case StepState.REFUNDED:
          event = RabbitMQConfig.STEP.EVENTS.REFUNDED;
          {
            const agent = await this.userService.findById(step.agentId);
            const sender = await this.userService.findById(step.senderId);
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );

            await this.sendMultipleMessage([
              {
                recipient: operator,
                event: event,
                variables: message,
              },
              {
                recipient: agent,
                event: event,
                variables: message,
              },
              {
                recipient: sender,
                event: event,
                variables: message,
              },
            ]);
          }
          break;
        case StepState.CLAIMED:
          event = RabbitMQConfig.STEP.EVENTS.CLAIMED;
          {
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );

            await this.sendMultipleMessage([
              {
                recipient: operator,
                event: event,
                variables: message,
              },
            ]);
          }
          break;
        case StepState.COMPLETED:
          event = RabbitMQConfig.STEP.EVENTS.COMPLETED;
          {
            const operator = await this.operatorService.getOperator(
              step.operatorId,
            );

            await this.sendMultipleMessage([
              {
                recipient: operator,
                event: event,
                variables: message,
              },
            ]);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      this.logger.error(
        `Failed to process system event: step.state.changed`,
        error,
      );
      throw error;
    }
  }

  async sendMessage(
    userId: string,
    userName: string,
    event: string,
    variables: any,
  ) {
    const contactDetails = (
      await this.contactDetailsService.findByOwner(userId)
    )[0];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...cDetails } = contactDetails.dataValues;

    const notification: SingleNotificationEntityDto = {
      userId: userId,
      recipientMap: createRecipientMapConcise(cDetails),
      urgency: 'low',
      userPreferences: cDetails.preference,
      isUserOnline: false,
      event: event,
      userName: userName || 'user',
      locale: 'en',
      status: NotificationStatus.PENDING,
      retryCount: 0,
      channelsToUse: [],
      variables: variables,
    };
    await this.notificationService.processSingleNotification(notification);
  }

  async sendMultipleMessage(payloads: MultipleRecipientPayload[]) {
    await Promise.all(
      payloads.map(async (payload, index) => {
        // Send notification to requester
        if (!payload.recipient) {
          throw new Error(`Notification recipient at index ${index} not found`);
        }
        await this.sendMessage(
          payload.recipient.id,
          (payload.recipient as User).name ||
            (payload.recipient as Operator).offchain.name,
          payload.event,
          payload.variables,
        );
      }),
    );
  }
}

interface MultipleRecipientPayload {
  recipient: any;
  event: string;
  variables: any;
}
