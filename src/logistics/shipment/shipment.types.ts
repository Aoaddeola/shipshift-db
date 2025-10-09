import { Mission } from '../mission/mission.types.js';
import { Parcel } from '../parcel/parcel.types.js';
import { Journey } from '../journey/journey.types.js';
import { Customer } from '../../profiles/customer/customer.types.js';
import { Location } from '../../common/location/location.types.js';

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
  parcelId: string;
  quantity: string;
  pickupDate: string; // ISO 8601 date string
  etaDate: string; // ISO 8601 date string
  fromLocation: Omit<Location, 'id'>;
  toLocation: Omit<Location, 'id'>;
  missionId?: string;
  journeyId?: string;
  status: ShipmentStatus;
  mission?: Mission; // Embedded mission
  parcel?: Parcel; // Embedded parcel
  journey?: Journey; // Embedded journey
  sender?: Customer; // Embedded sender
  createdAt?: string;
  updatedAt?: string;
}
