import { Location } from '../../common/location/location.types.js';
import { Curator } from '../../users/operator/operator.types.js';
import { Journey } from '../journey/journey.types.js';

/**
 * Mission Status Enum
 */
export enum MissionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/**
 * Mission Interface
 */
export interface Mission {
  id: string;
  curatorId: string;
  fromLocationId: string;
  toLocationId: string;
  journeyIds: string[];
  status: MissionStatus;
  curator?: Curator; // Embedded curator
  journeys?: Journey[]; // Embedded journeys
  fromLocation?: Location; // Embedded from location
  toLocation?: Location; // Embedded to location
  createdAt?: string;
  updatedAt?: string;
}
