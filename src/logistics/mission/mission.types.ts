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
}
