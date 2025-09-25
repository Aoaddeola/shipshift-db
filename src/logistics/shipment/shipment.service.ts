import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Shipment, ShipmentStatus } from './shipment.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { ShipmentCreateDto } from './shipment-create.dto.js';
import { ShipmentUpdateDto } from './shipment-update.dto.js';
import { MissionService } from '../mission/mission.service.js';
import { StepService } from '../../onchain/step/step.service.js';
import { CustomerService } from '../../users/customer/customer.service.js';

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  constructor(
    @InjectDatabase('shipment') private database: Database<Shipment>,
    @Inject(MissionService) private missionService: MissionService,
    @Inject(StepService) private stepService: StepService,
    @Inject(CustomerService) private customerService: CustomerService,
  ) {}

  async createShipment(
    shipment: Omit<
      Shipment,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'mission'
      | 'steps'
      | 'sender'
      | 'receiver'
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
      stepIds: shipment.stepIds || [],
      status: shipment.status || ShipmentStatus.PENDING,
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

  async getShipmentsByReceiver(
    receiverId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) => shipment.receiverId === receiverId,
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

  async getShipmentsBySenderAndReceiver(
    senderId: string,
    receiverId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId && shipment.receiverId === receiverId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderAndMission(
    senderId: string,
    missionId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId && shipment.missionId === missionId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByReceiverAndMission(
    receiverId: string,
    missionId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.receiverId === receiverId && shipment.missionId === missionId,
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

  async getShipmentsByReceiverAndStatus(
    receiverId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.receiverId === receiverId && shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByMissionAndStatus(
    missionId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.missionId === missionId && shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderReceiverAndMission(
    senderId: string,
    receiverId: string,
    missionId: string,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.receiverId === receiverId &&
        shipment.missionId === missionId,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderReceiverAndStatus(
    senderId: string,
    receiverId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.receiverId === receiverId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsBySenderMissionAndStatus(
    senderId: string,
    missionId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.missionId === missionId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByReceiverMissionAndStatus(
    receiverId: string,
    missionId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.receiverId === receiverId &&
        shipment.missionId === missionId &&
        shipment.status === status,
    );

    return Promise.all(
      shipments.map((shipment) => this.populateRelations(shipment, include)),
    );
  }

  async getShipmentsByAllFilters(
    senderId: string,
    receiverId: string,
    missionId: string,
    status: ShipmentStatus,
    include?: string[],
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    const shipments = all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.receiverId === receiverId &&
        shipment.missionId === missionId &&
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

    // Handle mission population
    if (include?.includes('mission')) {
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

    // Handle steps population
    if (include?.includes('steps')) {
      try {
        const steps = await Promise.all(
          shipment.stepIds.map((stepId) =>
            this.stepService.getStep(stepId).catch(() => null),
          ),
        );
        populatedShipment.steps = steps.filter((step) => step !== null);
      } catch (error) {
        this.logger.warn(
          `Could not fetch steps for shipment ${shipment.id}`,
          error,
        );
      }
    }

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

    // Handle receiver population
    if (include?.includes('receiver')) {
      try {
        const receiver = await this.customerService.getCustomer(
          shipment.receiverId,
        );
        if (receiver) {
          populatedShipment.receiver = receiver;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch receiver for ${shipment.receiverId}`,
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
      createdAt: now,
      updatedAt: now,
      ...shipment,
      stepIds: shipment.stepIds || [],
      status: shipment.status || ShipmentStatus.PENDING,
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
      stepIds:
        update.stepIds !== undefined
          ? update.stepIds
          : existingShipment.stepIds,
    };

    this.logger.log(`Partially updating shipment: ${id}`);
    await this.database.put(updatedShipment);
    return updatedShipment;
  }

  async deleteShipment(id: string): Promise<{ message: string }> {
    const shipment = await this.getShipment(id);
    await this.database.del(id);
    return {
      message: `Shipment "${id}" from ${shipment.senderId} to ${shipment.receiverId} deleted successfully`,
    };
  }
}
