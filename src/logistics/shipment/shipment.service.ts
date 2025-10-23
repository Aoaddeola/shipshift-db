import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { Shipment, ShipmentStatus } from './shipment.types.js';
import { Database } from '../../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { ShipmentCreateDto } from './shipment-create.dto.js';
import { ShipmentUpdateDto } from './shipment-update.dto.js';
import { CustomerService } from '../../profiles/customer/customer.service.js';
import { ParcelService } from '../parcel/parcel.service.js';
import { LocationService } from '../../common/location/location.service.js';
import { MissionService } from '../mission/mission.service.js';
import { JourneyService } from '../journey/journey.service.js';

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  constructor(
    @InjectDatabase('shipment') private database: Database<Shipment>,
    @Inject(CustomerService) private customerService: CustomerService,
    @Inject(ParcelService) private parcelService: ParcelService,
    @Inject(LocationService) private locationService: LocationService,
    @Inject(MissionService) private missionService: MissionService,
    @Inject(JourneyService) private journeyService: JourneyService,
  ) {}

  async createShipment(
    shipment: Omit<
      Shipment,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'fromLocation'
      | 'toLocation'
      | 'mission'
      | 'parcel'
      | 'journey'
      | 'sender'
    >,
  ): Promise<Shipment> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating shipment: ${id}`);
    const newShipment: Shipment = {
      id,
      createdAt: now,
      updatedAt: now,
      ...shipment,
    };

    await this.database.put(newShipment);
    return newShipment;
  }

  async getShipment(id: string, include?: string[]): Promise<Shipment> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Shipment not found');
    }

    return this.populateRelations(entry, include);
  }

  async getShipments(include?: string[]): Promise<Shipment[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySender(
    senderId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter((shipment) => shipment.senderId === senderId);

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByParcel(
    parcelId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter((shipment) => shipment.parcelId === parcelId);

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByFromLocation(
    fromLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) => shipment.fromLocationId === fromLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByToLocation(
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) => shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByMission(
    missionId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) => shipment.missionId === missionId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByJourney(
    journeyId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) => shipment.journeyId === journeyId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByStatus(
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter((shipment) => shipment.status === status);

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderAndParcel(
    senderId: string,
    parcelId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId && shipment.parcelId === parcelId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderAndFromLocation(
    senderId: string,
    fromLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.fromLocationId === fromLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderAndToLocation(
    senderId: string,
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderAndStatus(
    senderId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId && shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByParcelAndFromLocation(
    parcelId: string,
    fromLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.parcelId === parcelId &&
        shipment.fromLocationId === fromLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByParcelAndToLocation(
    parcelId: string,
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.parcelId === parcelId &&
        shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByParcelAndStatus(
    parcelId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.parcelId === parcelId && shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByLocations(
    fromLocationId: string,
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.fromLocationId === fromLocationId &&
        shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByFromLocationAndStatus(
    fromLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.fromLocationId === fromLocationId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByToLocationAndStatus(
    toLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.toLocationId === toLocationId && shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderParcelAndFromLocation(
    senderId: string,
    parcelId: string,
    fromLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.parcelId === parcelId &&
        shipment.fromLocationId === fromLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderParcelAndToLocation(
    senderId: string,
    parcelId: string,
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.parcelId === parcelId &&
        shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderParcelAndStatus(
    senderId: string,
    parcelId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.parcelId === parcelId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderAndLocations(
    senderId: string,
    fromLocationId: string,
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.fromLocationId === fromLocationId &&
        shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderFromLocationAndStatus(
    senderId: string,
    fromLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.fromLocationId === fromLocationId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderToLocationAndStatus(
    senderId: string,
    toLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.toLocationId === toLocationId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByParcelAndLocations(
    parcelId: string,
    fromLocationId: string,
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.parcelId === parcelId &&
        shipment.fromLocationId === fromLocationId &&
        shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByParcelFromLocationAndStatus(
    parcelId: string,
    fromLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.parcelId === parcelId &&
        shipment.fromLocationId === fromLocationId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByParcelToLocationAndStatus(
    parcelId: string,
    toLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.parcelId === parcelId &&
        shipment.toLocationId === toLocationId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByLocationsAndStatus(
    fromLocationId: string,
    toLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.fromLocationId === fromLocationId &&
        shipment.toLocationId === toLocationId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderParcelAndLocations(
    senderId: string,
    parcelId: string,
    fromLocationId: string,
    toLocationId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.parcelId === parcelId &&
        shipment.fromLocationId === fromLocationId &&
        shipment.toLocationId === toLocationId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByAllFilters(
    senderId: string,
    parcelId: string,
    fromLocationId: string,
    toLocationId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.parcelId === parcelId &&
        shipment.fromLocationId === fromLocationId &&
        shipment.toLocationId === toLocationId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  private async populateRelations(
    shipment: Shipment,
    include?: string[],
  ): Promise<Shipment> {
    // Clone the shipment to avoid modifying the original
    const populatedShipment = { ...shipment };

    // Handle sender population
    if (include?.includes('sender')) {
      try {
        const sender = await this.customerService.getCustomer(
          shipment.senderId,
        );
        if (sender) {
          populatedShipment.sender = sender;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch sender for ${shipment.senderId}`,
          error,
        );
      }
    }

    // Handle parcel population
    if (include?.includes('parcel')) {
      try {
        const parcel = await this.parcelService.getParcel(shipment.parcelId);
        if (parcel) {
          populatedShipment.parcel = parcel;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch parcel for ${shipment.parcelId}`,
          error,
        );
      }
    }

    // Handle fromLocation population
    if (include?.includes('fromLocation')) {
      try {
        const fromLocation = await this.locationService.getLocation(
          shipment.fromLocationId,
        );
        if (fromLocation) {
          populatedShipment.fromLocation = fromLocation;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch from location for ${shipment.fromLocationId}`,
          error,
        );
      }
    }

    // Handle toLocation population
    if (include?.includes('toLocation')) {
      try {
        const toLocation = await this.locationService.getLocation(
          shipment.toLocationId,
        );
        if (toLocation) {
          populatedShipment.toLocation = toLocation;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch to location for ${shipment.toLocationId}`,
          error,
        );
      }
    }

    // Handle mission population
    if (include?.includes('mission') && shipment.missionId) {
      try {
        const mission = await this.missionService.getMission(
          shipment.missionId,
        );
        if (mission) {
          populatedShipment.mission = mission;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch mission for ${shipment.missionId}`,
          error,
        );
      }
    }

    // Handle journey population
    if (include?.includes('journey') && shipment.journeyId) {
      try {
        const journey = await this.journeyService.getJourney(
          shipment.journeyId,
        );
        if (journey) {
          populatedShipment.journey = journey;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch journey for ${shipment.journeyId}`,
          error,
        );
      }
    }

    return populatedShipment;
  }

  async updateShipment(
    id: string,
    shipment: ShipmentCreateDto,
  ): Promise<Shipment> {
    // First check if shipment exists
    await this.getShipment(id);

    const now = new Date().toISOString();

    // Create updated shipment with ID preserved
    const updatedShipment: Shipment = {
      id,
      ...shipment,
      createdAt: now,
      updatedAt: now,
    };

    this.logger.log(`Updating shipment: ${id}`);
    await this.database.put(updatedShipment);
    return updatedShipment;
  }

  async partialUpdateShipment(
    id: string,
    update: ShipmentUpdateDto,
  ): Promise<Shipment> {
    const existingShipment = await this.getShipment(id);
    const now = new Date().toISOString();

    // Create updated shipment by merging existing with update
    const updatedShipment = {
      ...existingShipment,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating shipment: ${id}`);
    await this.database.put(updatedShipment);
    return updatedShipment;
  }

  async deleteShipment(id: string): Promise<{ message: string }> {
    const shipment = await this.getShipment(id);
    await this.database.del(id);
    return {
      message: `Shipment from ${shipment.fromLocationId} to ${shipment.toLocationId} deleted successfully`,
    };
  }
}
