import { Coordinates, ParcelHandlingInfo, StepState } from '../../types.js';
import { UserType } from '../../users/user/user.types.js';

export enum Entity {
  Journey = 'journey',
  Location = 'location',
  Step = 'request',
  User = 'user',
  Operator = 'operator',
  Shipment = 'shipment',
}

// More specific constraint definitions
export interface EntityConstraintDefinitions {
  [Entity.Journey]: {
    parcel?: ParcelHandlingInfo;
    minimum?: number;
  };
  [Entity.Location]: {
    coordinates?: Coordinates;
    radius?: number; // meters
    minimum?: number;
  };
  [Entity.Step]: {
    state?: StepState;
    recipientId?: string;
    senderId?: string;
    agentId?: string;
    operatorId?: string;
    minimum?: number;
  };
  [Entity.User]: {
    type?: UserType;
    verified?: boolean;
  };
  [Entity.Operator]: {
    type?: UserType;
    permissions?: string[];
  };
  [Entity.Shipment]: {
    senderId?: string;
    minimum?: number;
  };
}

export interface TaskValidation<
  T extends
    keyof EntityConstraintDefinitions = keyof EntityConstraintDefinitions,
> {
  taskId: string;
  entity: T;
  constraints: Partial<EntityConstraintDefinitions[T]>;
  createdAt?: string;
  updatedAt?: string;
}

// Define a validation handler interface
export interface ValidationHandler<
  T extends
    keyof EntityConstraintDefinitions = keyof EntityConstraintDefinitions,
> {
  validate(
    userId: string,
    constraints: Partial<EntityConstraintDefinitions[T]>,
  ): Promise<boolean>;
}
