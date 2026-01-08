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
import { OfferService } from '../../offer/offer.service.js';
import { JourneyService } from '../../logistics/journey/journey.service.js';
import { OperatorService } from '../../users/operator/operator.service.js';

@Injectable()
export class OfferNotificationConsumer {
  private readonly logger = new Logger(OfferNotificationConsumer.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly contactDetailsService: ContactDetailsService,
    private readonly offerService: OfferService,
    private readonly journeyService: JourneyService,
    private readonly operatorService: OperatorService,
  ) {}

  // Listen for system events that should trigger notifications
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.OFFER.EVENTS.CREATED,
    queue: 'notifications.system.events.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleOfferAssigned(_message: any) {
    const message = _message.data;
    this.logger.debug(
      `Processing notifications event for offer: ${message.offerId}`,
    );

    let contactDetails;
    let userId;

    try {
      if (message.bid.missionId !== undefined) {
        const offer = await this.offerService.getOffer(message.offerId, [
          'mission',
        ]);
        contactDetails = (
          await this.contactDetailsService.findByOwner(offer.mission!.curatorId)
        )[0];
        userId = offer.mission!.curatorId;
      } else if (message.bid.journeyId !== undefined) {
        const journey = await this.journeyService.getJourney(
          message.bid.journeyId,
          ['agent'],
        );
        contactDetails = (
          await this.contactDetailsService.findByOwner(
            journey.agent!.operatorId,
          )
        )[0];
        userId = journey.agent!.operatorId;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...cDetails } = contactDetails.dataValues;
      await this.notificationService.processSingleNotification({
        userId: userId,
        recipientMap: createRecipientMapConcise(cDetails),
        urgency: 'low',
        userPreferences: cDetails.preference,
        isUserOnline: false,
        event: 'offer.created',
        userName:
          (await this.operatorService.getOperator(userId)).offchain.name ||
          'User',
        locale: 'en',
        status: NotificationStatus.PENDING,
        retryCount: 0,
        channelsToUse: [],
        variables: {
          offerId: message.offerId,
          shipmentId: message.shipmentId,
          journeyId:
            message.bid.journeyId !== undefined ? message.bid.journeyId : '',
          missionId:
            message.bid.missionId !== undefined ? message.bid.missionId : '',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to process system event for offer: ${message.offerId}:`,
        error,
      );
      throw error;
    }
  }
}
