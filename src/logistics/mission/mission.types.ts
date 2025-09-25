import { Curator } from '../../users/curator/curator.types.js';
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
  journeyIds: string[];
  status: MissionStatus;
  curator?: Curator; // Embedded curator
  journeys?: Journey[]; // Embedded journeys
  createdAt?: string;
  updatedAt?: string;
}
