import { Mission } from '../logistics/mission/mission.types.js';
import { Journey } from '../logistics/journey/journey.types.js';
import { Shipment } from '../logistics/shipment/shipment.types.js';

/**
 * Offer Interface
 */
export interface Offer {
  id: string;
  shipmentId: string;
  bid: {
    missionId?: string;
    journeyId?: string;
  };
  shipment?: Shipment;
  journey?: Journey;
  mission?: Mission;
  createdAt?: string;
  updatedAt?: string;
}
