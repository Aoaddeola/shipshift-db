import { Operator } from '../../users/operator/operator.types.js';

/**
 * Agent Type Enum
 */
export enum AgentType {
  Business = 0,
  Private,
}

/**
 * Conveyance Means Enum
 */
export enum ConveyanceMeans {
  Car = 0,
  Bus,
  Aircraft,
  Ship,
  Bicycle,
  Foot,
  Train,
  Drone,
}

/**
 * Agent Interface
 */
export interface Agent {
  id: string;
  name: string;
  operatorId: string; // reference to Operator
  weightLimit: number;
  openToDestinationsOutOfScope: boolean; // Open to deliveries to locations that is not specificially listed by the agent
  meansOfConveyance: ConveyanceMeans;
  type: AgentType;
  operator?: Operator; // Embedded operator
  createdAt?: string;
  updatedAt?: string;
}
