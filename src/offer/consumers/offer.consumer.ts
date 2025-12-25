/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/modules/offer/consumers/offer.consumer.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { OfferService } from '../offer.service.js';
import { RabbitMQConfig } from '../../shared/rabbitmq/config/rabbitmq.config.js';
import { OfferProducer } from '../producers/offer.producer.js';
import { Offer } from '../offer.types.js';
import { ShipmentService } from '../../logistics/shipment/shipment.service.js';
import { StepService } from '../../onchain/step/step.service.js';
import { StepState } from '../../onchain/step/step.types.js';
import { JourneyService } from '../../logistics/journey/journey.service.js';
import { MissionService } from '../../logistics/mission/mission.service.js';
import { StepFactory } from '../../onchain/step/step.factory.js';

@Injectable()
export class OfferConsumer {
  private readonly logger = new Logger(OfferConsumer.name);
  private readonly config = RabbitMQConfig.OFFER;

  constructor(
    @Inject(OfferService)
    private readonly offerService: OfferService,
    @Inject(ShipmentService)
    private readonly shipmentService: ShipmentService,
    @Inject(StepService)
    private readonly stepService: StepService,
    @Inject(StepFactory)
    private readonly stepFactory: StepFactory,
    @Inject(JourneyService)
    private readonly journeyService: JourneyService,
    @Inject(MissionService)
    private readonly missionService: MissionService,
    @Inject(OfferProducer)
    private readonly offerProducer: OfferProducer,
  ) {}

  // ==================== EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.SHIPMENT.EVENTS.CREATED, // 'shipment.created'
    queue: RabbitMQConfig.OFFER.QUEUES.SHIPMENT_CREATED, // 'offers.integration.shipment.created.queue',
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.OFFER.QUEUES.SHIPMENT_CREATED, // 'offers.integration.shipment.created.queue',
      {
        arguments: {
          'x-message-ttl': 300000,
        },
      },
    ),
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('OfferConsumer-ShipmentCreated');
      logger.error(
        `Failed to process shipment.created:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleShipmentCreated(event: any) {
    this.logger.log(
      `Processing shipment.created for shipment ${event.shipmentId}`,
    );

    // When a shipment is created, you might want to create initial offers
    // Example:
    // await this.offerProducer.sendCreateOfferCommand(
    //   event.shipmentId,
    //   { missionId: event.missionId, journeyId: event.journeyId },
    //   event.createdBy || 'system'
    // );
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'mission.updated',
    queue: 'offers.integration.mission.updated.queue',
  })
  async handleMissionUpdated(event: any) {
    this.logger.log(
      `Processing mission.updated for mission ${event.missionId}`,
    );

    // When a mission is updated, update all related offers
    try {
      const offers = await this.offerService.getOffersByMission(
        event.missionId,
      );
      this.logger.log(
        `Found ${offers.length} offers for mission ${event.missionId}`,
      );

      // You might want to update offers based on mission changes
      // Example:
      // for (const offer of offers) {
      //   await this.offerService.partialUpdateOffer(offer.id, {
      //     // Update fields based on mission changes
      //   }, 'system');
      // }
    } catch (error) {
      this.logger.error(`Failed to process mission.updated:`, error);
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.JOURNEY.EVENTS.UPDATED,
    queue: RabbitMQConfig.OFFER.QUEUES.JOURNEY_UPDATED, // 'offers.integration.journey.updated.queue',
  })
  async handleJourneyUpdated(event: any) {
    this.logger.log(
      `Processing journey.updated for journey ${event.journeyId}`,
    );

    // When a journey is updated, update all related offers
    try {
      const offers = await this.offerService.getOffersByJourney(
        event.journeyId,
      );
      this.logger.log(
        `Found ${offers.length} offers for journey ${event.journeyId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to process journey.updated:`, error);
    }
  }

  // ==================== COMMAND HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.OFFER.COMMANDS.ACCEPT_BID,
    queue: RabbitMQConfig.OFFER.QUEUES.COMMAND_ACCEPT_BID, // 'offers.command.accept.bid.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('OfferConsumer-AcceptBid');
      logger.error(
        `Failed to process command ${RabbitMQConfig.OFFER.COMMANDS.ACCEPT_BID}:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleAcceptBidCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.OFFER.COMMANDS.ACCEPT_BID} for offer ${command.offerId}`,
    );

    try {
      // Get the offer
      const offer = await this.offerService.getOffer(command.data.offerId);

      // Business logic for accepting bid
      // Example: Update offer status, create contract, etc.

      // Publish bid accepted event
      await this.offerProducer.publishOfferBidAccepted(
        command.offerId,
        offer.shipmentId,
        offer.bid,
        command.acceptedBy,
        command.metadata,
      );

      this.logger.log(`Bid accepted for offer ${command.offerId}`);

      return {
        success: true,
        message: 'Bid accepted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to accept bid for offer ${command.offerId}:`,
        error,
      );
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.OFFER.COMMANDS.REJECT_BID,
    queue: RabbitMQConfig.OFFER.QUEUES.COMMAND_REJECT_BID, // 'offers.command.reject.bid.queue',
  })
  async handleRejectBidCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.OFFER.COMMANDS.REJECT_BID} for offer ${command.offerId}`,
    );

    try {
      const offer = await this.offerService.getOffer(command.offerId);

      // Business logic for rejecting bid

      // Publish bid rejected event
      await this.offerProducer.publishOfferBidRejected(
        command.offerId,
        offer.shipmentId,
        offer.bid,
        command.rejectedBy,
        command.reason,
      );

      this.logger.log(`Bid rejected for offer ${command.offerId}`);

      return {
        success: true,
        message: 'Bid rejected successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to reject bid for offer ${command.offerId}:`,
        error,
      );
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== RPC HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.OFFER.RPC.GET_BATCH,
    queue: RabbitMQConfig.OFFER.QUEUES.RPC_GET_BATCH,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetOffersRPC(event: {
    filters: {
      shipmentId?: string;
      missionId?: string;
      journeyId?: string;
      [key: string]: any;
    };
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.OFFER.RPC.GET_BATCH} with filters`,
      event.filters,
    );

    try {
      let offers: any[] = [];

      // Use appropriate service method based on filters
      if (event.filters.shipmentId && event.filters.missionId) {
        offers = await this.offerService.getOffersByShipmentAndMission(
          event.filters.shipmentId,
          event.filters.missionId,
        );
      } else if (event.filters.shipmentId && event.filters.journeyId) {
        offers = await this.offerService.getOffersByShipmentAndJourney(
          event.filters.shipmentId,
          event.filters.journeyId,
        );
      } else if (event.filters.shipmentId) {
        offers = await this.offerService.getOffersByShipment(
          event.filters.shipmentId,
        );
      } else if (event.filters.missionId) {
        offers = await this.offerService.getOffersByMission(
          event.filters.missionId,
        );
      } else if (event.filters.journeyId) {
        offers = await this.offerService.getOffersByJourney(
          event.filters.journeyId,
        );
      } else {
        offers = await this.offerService.getOffers();
      }

      // Apply pagination
      if (event.limit || event.offset) {
        const offset = event.offset || 0;
        const limit = event.limit || offers.length;
        offers = offers.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: offers,
        count: offers.length,
        timestamp: new Date().toISOString(),
        metadata: {
          apiVersion: '1.0',
          entity: RabbitMQConfig.OFFER.ENTITY,
        },
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.OFFER.RPC.GET_BATCH} failed:`,
        error,
      );
      return {
        success: false,
        error: error.message,
        errorCode: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.OFFER.RPC.VALIDATE,
    queue: RabbitMQConfig.OFFER.RPC.VALIDATE,
  })
  async handleValidateOfferRPC(event: {
    offerId: string;
    validatorId: string;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.OFFER.RPC.VALIDATE} for offer ${event.offerId}`,
    );

    try {
      const offer = await this.offerService.getOffer(event.offerId);

      // Validation logic
      const validations: string[] = [];

      // Example validations
      if (!offer.shipmentId) {
        validations.push('Offer must have a shipmentId');
      }

      if (!offer.bid.missionId && !offer.bid.journeyId) {
        validations.push('Offer bid must have either missionId or journeyId');
      }

      const isValid = validations.length === 0;

      return {
        valid: isValid,
        reason: isValid ? undefined : validations.join(', '),
        offerId: event.offerId,
        validatorId: event.validatorId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.OFFER.RPC.VALIDATE} failed:`,
        error,
      );
      return {
        valid: false,
        reason: `Offer not found or validation failed: ${error.message}`,
        offerId: event.offerId,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.OFFER.RPC.GET,
    queue: RabbitMQConfig.OFFER.QUEUES.RPC_GET,
  })
  async handleGetOfferRPC(event: { offerId: string }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.OFFER.RPC.GET} for offer ${event.offerId}`,
    );

    try {
      const offer = await this.offerService.getOffer(event.offerId);

      return {
        success: true,
        data: offer,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`RPC ${RabbitMQConfig.OFFER.RPC.GET} failed:`, error);
      return {
        success: false,
        error: error.message,
        errorCode: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== INTERNAL EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.OFFER.EVENTS.CREATED,
    queue: RabbitMQConfig.OFFER.QUEUES.EVENT_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.OFFER.QUEUES.EVENT_CREATED,
    ),
  })
  async handleInternalOfferCreated(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.OFFER.EVENTS.CREATED} for offer ${event.data.offerId}`,
    );
    // Handle internal offer created events (e.g., update cache, analytics)
    const offer = await this.offerService.getOffer(event.data.offerId);

    // Business logic for accepting bid
    // Example: Update offer status, create contract, etc.
    const shipment = await this.shipmentService.getShipment(offer.shipmentId);

    const updatedShipment = offer.bid.journeyId
      ? {
          ...shipment,
          journey: await this.journeyService.getJourney(offer.bid.journeyId),
        }
      : offer.bid.missionId
        ? {
            ...shipment,
            mission: await this.missionService.getMission(offer.bid.missionId),
          }
        : shipment;
    const steps = await this.stepFactory.stepFactory(updatedShipment);

    await this.offerService.partialUpdateOffer(offer.id, {
      stepCount: steps.length,
    });

    await Promise.all(
      steps.map(async (step) => {
        const _step = step;
        _step.state = StepState.ACCEPTED;
        _step.offerId = event.data.offerId;
        await this.stepService.createStep(_step);
      }),
    );
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.OFFER.EVENTS.BID_ACCEPTED,
    queue: RabbitMQConfig.OFFER.QUEUES.EVENT_BID_ACCEPTED,
  })
  async handleInternalBidAccepted(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.OFFER.EVENTS.BID_ACCEPTED} for offer ${event.offerId}`,
    );
    // Handle bid accepted events (e.g., update related shipment/journey status)
  }

  // ==================== BATCH OPERATION HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.OFFER.EVENTS.BATCH_UPDATED, // 'batch.update.offers',
    queue: 'offers.command.batch.update.queue',
  })
  async handleBatchUpdateOffers(command: {
    filter: {
      shipmentId?: string;
      missionId?: string;
      journeyId?: string;
      [key: string]: any;
    };
    update: any;
    requestedBy: string;
  }) {
    this.logger.log(
      `Processing batch.update.offers command requested by ${command.requestedBy}`,
    );

    try {
      let offers = await this.offerService.getOffers();

      // Apply filters
      if (command.filter.shipmentId) {
        offers = offers.filter(
          (offer) => offer.shipmentId === command.filter.shipmentId,
        );
      }
      if (command.filter.missionId) {
        offers = offers.filter(
          (offer) => offer.bid.missionId === command.filter.missionId,
        );
      }
      if (command.filter.journeyId) {
        offers = offers.filter(
          (offer) => offer.bid.journeyId === command.filter.journeyId,
        );
      }

      // Update each offer
      const updatedOffers: Offer[] = [];
      for (const offer of offers) {
        try {
          const updatedOffer = await this.offerService.partialUpdateOffer(
            offer.id,
            command.update,
          );
          updatedOffers.push(updatedOffer);
        } catch (error) {
          this.logger.error(`Failed to update offer ${offer.id}:`, error);
        }
      }

      // Publish batch update event
      await this.offerProducer.publishOffersBatchUpdated(
        updatedOffers.length,
        command.filter,
        command.update,
        command.requestedBy,
      );

      return {
        success: true,
        updatedCount: updatedOffers.length,
        message: `Successfully updated ${updatedOffers.length} offers`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to process batch.update.offers:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
