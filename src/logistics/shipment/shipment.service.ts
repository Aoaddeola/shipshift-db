import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { ShipmentCreateDto } from './shipment-create.dto.js';
import { ShipmentUpdateDto } from './shipment-update.dto.js';
import { Shipment, ShipmentStatus } from './shipment.types.js';

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  constructor(
    @InjectDatabase('shipment') private database: Database<Shipment>,
  ) {}

  async createShipment(
    shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Shipment> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating shipment: ${id}`);
    const newShipment: Shipment = {
      ...shipment,
      id,
      createdAt: now,
      updatedAt: now,
      stepIds: shipment.stepIds || [],
      status: shipment.status || ShipmentStatus.PENDING,
    };

    await this.database.put(newShipment);
    return newShipment;
  }

  async getShipment(id: string): Promise<Shipment> {
    const shipment = await this.database.get(id);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
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
      ...shipment,
      id,
      createdAt: now,
      updatedAt: now,
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
      // Handle special cases if needed
      stepIds:
        update.stepIds !== undefined
          ? update.stepIds
          : existingShipment.stepIds,
    };

    this.logger.log(`Partially updating shipment: ${id}`);
    await this.database.put(updatedShipment);
    return updatedShipment;
  }

  async getShipments(): Promise<Shipment[]> {
    return this.database.all();
  }

  async getShipmentsBySender(senderId: string): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter((shipment) => shipment.senderId === senderId);
  }

  async getShipmentsByReceiver(receiverId: string): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter((shipment) => shipment.receiverId === receiverId);
  }

  async getShipmentsByMission(missionId: string): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter((shipment) => shipment.missionId === missionId);
  }

  async getShipmentsByStatus(status: ShipmentStatus): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter((shipment) => shipment.status === status);
  }

  async getShipmentsBySenderAndReceiver(
    senderId: string,
    receiverId: string,
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter(
      (shipment) =>
        shipment.senderId === senderId && shipment.receiverId === receiverId,
    );
  }

  async getShipmentsBySenderAndMission(
    senderId: string,
    missionId: string,
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter(
      (shipment) =>
        shipment.senderId === senderId && shipment.missionId === missionId,
    );
  }

  async getShipmentsByReceiverAndMission(
    receiverId: string,
    missionId: string,
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter(
      (shipment) =>
        shipment.receiverId === receiverId && shipment.missionId === missionId,
    );
  }

  async getShipmentsBySenderReceiverAndMission(
    senderId: string,
    receiverId: string,
    missionId: string,
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.receiverId === receiverId &&
        shipment.missionId === missionId,
    );
  }

  async getShipmentsByMissionAndStatus(
    missionId: string,
    status: ShipmentStatus,
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter(
      (shipment) =>
        shipment.missionId === missionId && shipment.status === status,
    );
  }

  async getShipmentsByAllFilters(
    senderId: string,
    receiverId: string,
    missionId: string,
    status: ShipmentStatus,
  ): Promise<Shipment[]> {
    const all = await this.database.all();
    return all.filter(
      (shipment) =>
        shipment.senderId === senderId &&
        shipment.receiverId === receiverId &&
        shipment.missionId === missionId &&
        shipment.status === status,
    );
  }

  async deleteShipment(id: string): Promise<{ message: string }> {
    const shipment = await this.getShipment(id);
    await this.database.del(id);
    return {
      message: `Shipment "${id}" from ${shipment.senderId} to ${shipment.receiverId} deleted successfully`,
    };
  }
}
