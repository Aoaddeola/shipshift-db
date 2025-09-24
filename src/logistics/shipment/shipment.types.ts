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
  createdAt?: string;
  updatedAt?: string;
}
