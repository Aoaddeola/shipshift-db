/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/modules/offer/offer.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Offer } from './offer.types.js';
import { randomUUID } from 'node:crypto';
import { OfferCreateDto } from './offer-create.dto.js';
import { OfferUpdateDto } from './offer-update.dto.js';
import { Database } from '../db/orbitdb/database.js';
import { InjectDatabase } from '../db/orbitdb/inject-database.decorator.js';
import { OfferProducer } from './producers/offer.producer.js';
import { MissionService } from '../logistics/mission/mission.service.js';
import { JourneyService } from '../logistics/journey/journey.service.js';
import { ShipmentService } from '../logistics/shipment/shipment.service.js';
import { AgentService } from '../profiles/agent/agent.service.js';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);

  constructor(
    @InjectDatabase('offer') private database: Database<Offer>,
    @Inject(OfferProducer) private offerProducer: OfferProducer,
    @Inject(MissionService) private missionService: MissionService,
    @Inject(JourneyService) private journeyService: JourneyService,
    @Inject(ShipmentService) private shipmentService: ShipmentService,
    @Inject(AgentService) private agentService: AgentService,
  ) {}

  async createOffer(
    offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Offer> {
    // Validation: ensure at least one of missionId or journeyId is provided
    if (!offer.bid.missionId && !offer.bid.journeyId) {
      throw new BadRequestException(
        'Bid must include at least one of missionId or journeyId',
      );
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating offer: ${id}`);
    const newOffer: Offer = {
      id,
      createdAt: now,
      updatedAt: now,
      ...offer,
    };

    if (newOffer.bid.journeyId !== undefined) {
      await this.journeyService.getJourney(newOffer.bid.journeyId);
    }

    if (newOffer.bid.missionId !== undefined) {
      await this.missionService.getMission(newOffer.bid.missionId);
    }

    await this.database.put(newOffer);

    // Publish offer created event
    await this.offerProducer.publishOfferCreated(newOffer);

    return newOffer;
  }

  async getOffer(id: string, include?: string[]): Promise<Offer> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Offer not found');
    }

    return this.populateRelations(entry, include);
  }

  async updateOffer(
    id: string,
    offer: OfferCreateDto,
    updatedBy?: string,
  ): Promise<Offer> {
    // First check if offer exists
    const existingOffer = await this.getOffer(id);

    // Validation: ensure at least one of missionId or journeyId is provided
    if (!offer.bid.missionId && !offer.bid.journeyId) {
      throw new BadRequestException(
        'Bid must include at least one of missionId or journeyId',
      );
    }

    const now = new Date().toISOString();

    // Create updated offer with ID preserved
    const updatedOffer: Offer = {
      id,
      createdAt: now,
      updatedAt: now,
      ...offer,
    };

    this.logger.log(`Updating offer: ${id}`);
    await this.database.put(updatedOffer);

    // Publish offer updated event
    await this.offerProducer.publishOfferUpdated(
      id,
      existingOffer.shipmentId,
      existingOffer.bid,
      offer,
      updatedBy || 'system',
    );

    return updatedOffer;
  }

  async partialUpdateOffer(
    id: string,
    update: OfferUpdateDto,
    updatedBy?: string,
    publish: boolean = true,
  ): Promise<Offer> {
    const existingOffer = await this.getOffer(id);
    const now = new Date().toISOString();

    // Handle nested bid update
    let updatedBid = existingOffer.bid;
    if (update.bid) {
      updatedBid = {
        ...existingOffer.bid,
        ...update.bid,
      };

      // Validation: ensure at least one of missionId or journeyId is provided
      if (!updatedBid.missionId && !updatedBid.journeyId) {
        throw new BadRequestException(
          'Bid must include at least one of missionId or journeyId',
        );
      }
    }

    // Create updated offer by merging existing with update
    const updatedOffer = {
      ...existingOffer,
      ...update,
      bid: updatedBid,
      updatedAt: now,
    };

    this.logger.log(`Partially updating offer: ${id}`);
    await this.database.put(updatedOffer);

    if (publish) {
      // Publish offer updated event
      await this.offerProducer.publishOfferUpdated(
        id,
        existingOffer.shipmentId,
        existingOffer.bid,
        update,
        updatedBy || 'system',
      );
    }

    return updatedOffer;
  }

  async getOffersByShipment(
    shipmentId: string,
    include?: string[],
  ): Promise<Offer[]> {
    const all = await this.database.all();
    const offers = all.filter((offer) => offer.shipmentId === shipmentId);

    return Promise.all(
      offers.map((offer) => this.populateRelations(offer, include)),
    );
  }

  async getOffersByStakeHolder(stakeholderId: string): Promise<Offer[]> {
    const all = await this.getOffers(['shipment', 'mission', 'journey']);
    const filteredOffers: Offer[] = [];

    for (const offer of all) {
      if (!offer.shipment) continue;

      let valid = false;

      if (offer.journey) {
        const agent = await this.agentService.getAgentsByOwner(
          offer.journey.agentId,
        );
        valid =
          offer.journey.agentId === stakeholderId ||
          agent[0].operatorId === stakeholderId;
      }

      if (offer.mission) {
        valid = valid || offer.mission.curatorId === stakeholderId;
      }

      valid = valid || offer.shipment.senderId === stakeholderId;

      if (valid) {
        filteredOffers.push(offer);
      }
    }

    return filteredOffers;
  }

  async getOffersByMission(
    missionId: string,
    include?: string[],
  ): Promise<Offer[]> {
    const all = await this.database.all();
    const offers = all.filter((offer) => offer.bid.missionId === missionId);

    return Promise.all(
      offers.map((offer) => this.populateRelations(offer, include)),
    );
  }

  async getOffersByJourney(
    journeyId: string,
    include?: string[],
  ): Promise<Offer[]> {
    const all = await this.database.all();
    const offers = all.filter((offer) => offer.bid.journeyId === journeyId);

    return Promise.all(
      offers.map((offer) => this.populateRelations(offer, include)),
    );
  }

  async getOffers(include?: string[]): Promise<Offer[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((offer) => this.populateRelations(offer, include)),
    );
  }

  private async populateRelations(
    offer: Offer,
    include?: string[],
  ): Promise<Offer> {
    // Clone the offer to avoid modifying the original
    const populatedOffer = { ...offer };

    // Handle shipment population
    if (include?.includes('shipment')) {
      try {
        const shipment = await this.shipmentService.getShipment(
          offer.shipmentId,
        );
        if (shipment) {
          populatedOffer.shipment = shipment;
        }
      } catch (error) {
        this.logger.warn(`Could not fetch shipment for ${offer.shipmentId}`);
      }
    }

    // Handle journey population (if journeyId is present in bid)
    if (include?.includes('journey') && offer.bid.journeyId) {
      try {
        const journey = await this.journeyService.getJourney(
          offer.bid.journeyId,
        );
        if (journey) {
          populatedOffer.journey = journey;
        }
      } catch (error) {
        this.logger.warn(`Could not fetch journey for ${offer.bid.journeyId}`);
      }
    }

    // Handle mission population (if missionId is present in bid)
    if (include?.includes('mission') && offer.bid.missionId) {
      try {
        const mission = await this.missionService.getMission(
          offer.bid.missionId,
        );
        if (mission) {
          populatedOffer.mission = mission;
        }
      } catch (error) {
        this.logger.warn(`Could not fetch mission for ${offer.bid.missionId}`);
      }
    }

    return populatedOffer;
  }

  async getOffersByShipmentAndMission(
    shipmentId: string,
    missionId: string,
  ): Promise<Offer[]> {
    const all = await this.database.all();
    return all.filter(
      (offer) =>
        offer.shipmentId === shipmentId && offer.bid.missionId === missionId,
    );
  }

  async getOffersByShipmentAndJourney(
    shipmentId: string,
    journeyId: string,
  ): Promise<Offer[]> {
    const all = await this.database.all();
    return all.filter(
      (offer) =>
        offer.shipmentId === shipmentId && offer.bid.journeyId === journeyId,
    );
  }

  async deleteOffer(
    id: string,
    deletedBy?: string,
  ): Promise<{ message: string }> {
    const offer = await this.getOffer(id);
    await this.database.del(id);

    // Publish offer deleted event
    await this.offerProducer.publishOfferDeleted(
      id,
      offer.shipmentId,
      deletedBy || 'system',
    );

    return {
      message: `Offer for shipment ${offer.shipmentId} deleted successfully`,
    };
  }

  async acceptOfferBid(
    id: string,
    acceptedBy: string,
    metadata?: { price?: number; terms?: string },
  ): Promise<{ success: boolean; message: string; offer?: Offer }> {
    try {
      const offer = await this.getOffer(id);

      // Send accept bid command via producer
      await this.offerProducer.sendAcceptBidCommand(id, acceptedBy, metadata);

      // You could also update the offer with acceptance status here
      // const updatedOffer = await this.partialUpdateOffer(id, {
      //   // Add acceptance fields if needed
      // }, acceptedBy);

      return {
        success: true,
        message: 'Bid acceptance processed',
        offer,
      };
    } catch (error) {
      this.logger.error(`Failed to accept bid for offer ${id}:`, error);
      return {
        success: false,
        message: `Failed to accept bid: ${error.message}`,
      };
    }
  }

  async rejectOfferBid(
    id: string,
    rejectedBy: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.getOffer(id);

      // Send reject bid command via producer
      await this.offerProducer.sendRejectBidCommand(id, rejectedBy, reason);

      return {
        success: true,
        message: 'Bid rejection processed',
      };
    } catch (error) {
      this.logger.error(`Failed to reject bid for offer ${id}:`, error);
      return {
        success: false,
        message: `Failed to reject bid: ${error.message}`,
      };
    }
  }

  async batchUpdateOffers(
    filter: {
      shipmentId?: string;
      missionId?: string;
      journeyId?: string;
      [key: string]: any;
    },
    update: OfferUpdateDto,
    requestedBy: string,
  ): Promise<{ updatedCount: number; offers: Offer[] }> {
    const allOffers = await this.database.all();

    // Filter offers
    const filteredOffers = allOffers.filter((offer) => {
      if (filter.shipmentId && offer.shipmentId !== filter.shipmentId)
        return false;
      if (filter.missionId && offer.bid.missionId !== filter.missionId)
        return false;
      if (filter.journeyId && offer.bid.journeyId !== filter.journeyId)
        return false;
      return true;
    });

    // Update each offer
    const updatedOffers: Offer[] = [];
    for (const offer of filteredOffers) {
      const updatedOffer = await this.partialUpdateOffer(
        offer.id,
        update,
        requestedBy,
      );
      updatedOffers.push(updatedOffer);
    }

    // Publish batch update event
    await this.offerProducer.publishOffersBatchUpdated(
      updatedOffers.length,
      filter,
      update,
      requestedBy,
    );

    return {
      updatedCount: updatedOffers.length,
      offers: updatedOffers,
    };
  }

  async getOffersWithRPC(filters: any): Promise<Offer[]> {
    // Use RPC to get offers from other services if needed
    try {
      const rpcResponse = await this.offerProducer.rpcGetOffers(filters);
      if (rpcResponse.success) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return rpcResponse.data;
      }
    } catch (error) {
      this.logger.warn(`RPC call failed, falling back to local query:`, error);
    }

    // Fallback to local query based on filters
    if (filters.shipmentId && filters.missionId) {
      return this.getOffersByShipmentAndMission(
        filters.shipmentId,
        filters.missionId,
      );
    } else if (filters.shipmentId && filters.journeyId) {
      return this.getOffersByShipmentAndJourney(
        filters.shipmentId,
        filters.journeyId,
      );
    } else if (filters.shipmentId) {
      return this.getOffersByShipment(filters.shipmentId);
    } else if (filters.missionId) {
      return this.getOffersByMission(filters.missionId);
    } else if (filters.journeyId) {
      return this.getOffersByJourney(filters.journeyId);
    } else {
      return this.getOffers();
    }
  }

  async validateOffer(
    id: string,
  ): Promise<{ valid: boolean; reasons: string[] }> {
    try {
      const offer = await this.getOffer(id);
      const reasons: string[] = [];

      // Basic validation
      if (!offer.shipmentId) {
        reasons.push('Offer must have a shipmentId');
      }

      if (!offer.bid.missionId && !offer.bid.journeyId) {
        reasons.push('Offer bid must have either missionId or journeyId');
      }

      // You could add more business rules here

      return {
        valid: reasons.length === 0,
        reasons,
      };
    } catch (error) {
      return {
        valid: false,
        reasons: [`Offer validation failed: ${error.message}`],
      };
    }
  }
}
