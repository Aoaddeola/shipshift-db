import { Mission } from '../logistics/mission/mission.types.js';
import { Journey } from '../logistics/journey/journey.types.js';
import { Shipment } from '../logistics/shipment/shipment.types.js';

export enum OfferState {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

/**
 * Offer Interface
 */
export interface Offer {
  id: string;
  shipmentId: string;
  state: OfferState;
  bid: {
    missionId?: string;
    journeyId?: string;
  };
  stepCount?: number;
  shipment?: Shipment;
  journey?: Journey;
  mission?: Mission;
  createdAt?: string;
  updatedAt?: string;
}
