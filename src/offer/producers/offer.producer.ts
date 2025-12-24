// src/modules/offer/producers/offer.producer.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBusService } from '../../shared/rabbitmq/rabbitmq.service.js';
import { Offer } from '../offer.types.js';
import { OfferUpdateDto } from '../offer-update.dto.js';
import { RabbitMQConfig } from '../../shared/rabbitmq/config/rabbitmq.config.js';

export interface OfferCreatedEvent {
  offerId: string;
  shipmentId: string;
  bid: {
    missionId?: string;
    journeyId?: string;
  };
  createdAt: string;
}

export interface OfferUpdatedEvent {
  offerId: string;
  shipmentId: string;
  previousBid?: {
    missionId?: string;
    journeyId?: string;
  };
  updatedFields: Partial<OfferUpdateDto>;
  updatedAt: string;
  changedBy?: string;
}

export interface OfferDeletedEvent {
  offerId: string;
  shipmentId: string;
  deletedAt: string;
  deletedBy?: string;
}

export interface OffersBatchUpdatedEvent {
  shipmentId?: string;
  missionId?: string;
  journeyId?: string;
  filterCriteria: {
    [key: string]: any;
  };
  updateCount: number;
  updatedFields: Partial<OfferUpdateDto>;
  requestedBy: string;
  timestamp: string;
}

export interface OfferBidAcceptedEvent {
  offerId: string;
  shipmentId: string;
  bid: {
    missionId?: string;
    journeyId?: string;
  };
  acceptedBy: string;
  acceptedAt: string;
  metadata?: {
    price?: number;
    terms?: string;
  };
}

export interface OfferBidRejectedEvent {
  offerId: string;
  shipmentId: string;
  bid: {
    missionId?: string;
    journeyId?: string;
  };
  rejectedBy: string;
  rejectedAt: string;
  reason?: string;
}

@Injectable()
export class OfferProducer {
  private readonly logger = new Logger(OfferProducer.name);
  private readonly config = RabbitMQConfig.OFFER;

  constructor(
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  // ==================== EVENT PUBLISHING METHODS ====================

  async publishOfferCreated(offer: Offer): Promise<boolean> {
    const event: OfferCreatedEvent = {
      offerId: offer.id,
      shipmentId: offer.shipmentId,
      bid: {
        missionId: offer.bid.missionId,
        journeyId: offer.bid.journeyId,
      },
      createdAt: offer.createdAt || new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.CREATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'offer',
          'x-event-type': 'created',
          'x-offer-id': offer.id,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.CREATED} for offer ${offer.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.CREATED}:`,
        error,
      );
      return false;
    }
  }

  async publishOfferUpdated(
    offerId: string,
    shipmentId: string,
    previousBid: { missionId?: string; journeyId?: string },
    update: Partial<OfferUpdateDto>,
    changedBy?: string,
  ): Promise<boolean> {
    const event: OfferUpdatedEvent = {
      offerId,
      shipmentId,
      previousBid,
      updatedFields: update,
      updatedAt: new Date().toISOString(),
      changedBy,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'offer',
          'x-event-type': 'updated',
          'x-offer-id': offerId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.UPDATED} for offer ${offerId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishOfferDeleted(
    offerId: string,
    shipmentId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    const event: OfferDeletedEvent = {
      offerId,
      shipmentId,
      deletedAt: new Date().toISOString(),
      deletedBy,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.DELETED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'offer',
          'x-event-type': 'deleted',
          'x-offer-id': offerId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.DELETED} for offer ${offerId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.DELETED}:`,
        error,
      );
      return false;
    }
  }

  async publishOfferBidAccepted(
    offerId: string,
    shipmentId: string,
    bid: { missionId?: string; journeyId?: string },
    acceptedBy: string,
    metadata?: { price?: number; terms?: string },
  ): Promise<boolean> {
    const event: OfferBidAcceptedEvent = {
      offerId,
      shipmentId,
      bid,
      acceptedBy,
      acceptedAt: new Date().toISOString(),
      metadata,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.BID_ACCEPTED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'offer',
          'x-event-type': 'bid_accepted',
          'x-offer-id': offerId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.BID_ACCEPTED} for offer ${offerId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.BID_ACCEPTED}:`,
        error,
      );
      return false;
    }
  }

  async publishOfferBidRejected(
    offerId: string,
    shipmentId: string,
    bid: { missionId?: string; journeyId?: string },
    rejectedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: OfferBidRejectedEvent = {
      offerId,
      shipmentId,
      bid,
      rejectedBy,
      rejectedAt: new Date().toISOString(),
      reason,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.BID_REJECTED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'offer',
          'x-event-type': 'bid_rejected',
          'x-offer-id': offerId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.BID_REJECTED} for offer ${offerId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.BID_REJECTED}:`,
        error,
      );
      return false;
    }
  }

  async publishOffersBatchUpdated(
    updateCount: number,
    filterCriteria: {
      shipmentId?: string;
      missionId?: string;
      journeyId?: string;
      [key: string]: any;
    },
    updatedFields: Partial<OfferUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event: OffersBatchUpdatedEvent = {
      shipmentId: filterCriteria.shipmentId,
      missionId: filterCriteria.missionId,
      journeyId: filterCriteria.journeyId,
      filterCriteria,
      updateCount,
      updatedFields,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.BATCH_UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'offer',
          'x-event-type': 'batch_updated',
          'x-update-count': updateCount.toString(),
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.BATCH_UPDATED} for ${updateCount} offers`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.BATCH_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  // ==================== COMMAND PUBLISHING METHODS ====================

  async sendCreateOfferCommand(
    shipmentId: string,
    bid: { missionId?: string; journeyId?: string },
    createdBy: string,
  ): Promise<boolean> {
    const command = {
      shipmentId,
      bid,
      createdBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(this.config.COMMANDS.CREATE, command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}`,
          'x-shipment-id': shipmentId,
        },
      });
      this.logger.log(
        `Sent ${this.config.COMMANDS.CREATE} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.CREATE}:`,
        error,
      );
      return false;
    }
  }

  async sendAcceptBidCommand(
    offerId: string,
    acceptedBy: string,
    metadata?: { price?: number; terms?: string },
  ): Promise<boolean> {
    const command = {
      offerId,
      acceptedBy,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.ACCEPT_BID,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${offerId}`,
            'x-offer-id': offerId,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.ACCEPT_BID} for offer ${offerId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.ACCEPT_BID}:`,
        error,
      );
      return false;
    }
  }

  async sendRejectBidCommand(
    offerId: string,
    rejectedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      offerId,
      rejectedBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.REJECT_BID,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${offerId}`,
            'x-offer-id': offerId,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.REJECT_BID} for offer ${offerId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.REJECT_BID}:`,
        error,
      );
      return false;
    }
  }

  // ==================== RPC METHODS ====================

  async rpcGetOffers(filters: any): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET_BATCH,
        { filters },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.GET_BATCH} failed:`, error);
      throw error;
    }
  }

  async rpcValidateOffer(
    offerId: string,
    validatorId: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.VALIDATE,
        { offerId, validatorId },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${offerId}`,
            'x-offer-id': offerId,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.VALIDATE} failed:`, error);
      return { valid: false, reason: 'RPC call failed. Service unavailable.' };
    }
  }

  async rpcGetOffer(offerId: string): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET,
        { offerId },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${offerId}`,
            'x-offer-id': offerId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.GET} failed:`, error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  async publishMissionOffersUpdated(
    missionId: string,
    updateCount: number,
    updatedFields: Partial<OfferUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event = {
      missionId,
      updateCount,
      updatedFields,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent('mission.offers.updated', event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-mission-id': missionId,
        },
      });
      this.logger.log(
        `Published mission.offers.updated for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish mission.offers.updated:`, error);
      return false;
    }
  }

  async publishJourneyOffersUpdated(
    journeyId: string,
    updateCount: number,
    updatedFields: Partial<OfferUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event = {
      journeyId,
      updateCount,
      updatedFields,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent('journey.offers.updated', event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-journey-id': journeyId,
        },
      });
      this.logger.log(
        `Published journey.offers.updated for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish journey.offers.updated:`, error);
      return false;
    }
  }
}
