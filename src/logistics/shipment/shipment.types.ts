import { Step } from '../../onchain/step/step.types.js';
import { Mission } from '../../logistics/mission/mission.types.js';
import { Customer } from '../../users/customer/customer.types.js';

/**
 * Shipment Status Enum
 */
export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

/**
 * Shipment Interface
 */
export interface Shipment {
  id: string;
  senderId: string;
  receiverId: string;
  missionId: string;
  stepIds: string[];
  status: ShipmentStatus;
  mission?: Mission; // Embedded mission
  steps?: Step[]; // Embedded steps
  sender?: Customer; // Embedded sender
  receiver?: Customer; // Embedded receiver
  createdAt?: string;
  updatedAt?: string;
}
