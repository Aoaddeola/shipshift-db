import { Operator } from '../../users/operator/operator.types.js';
import { User } from '../../users/user/user.types.js';

/**
 * Agent Type Enum
 */
export enum AgentType {
  Business = 'Business',
  Private = 'Private',
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
  None,
}

/**
 * Agent Interface
 */
export interface Agent {
  id: string;
  name: string;
  operatorId: string; // reference to Operator
  ownerId: string; // reference to User
  openToDestinationsOutOfScope: boolean; // Open to deliveries to locations that is not specificially listed by the agent
  meansOfConveyance: ConveyanceMeans;
  onChainAddress: string;
  verified?: boolean;
  active?: boolean;
  type: AgentType;
  owner?: User;
  operator?: Operator; // Embedded operator
  createdAt?: string;
  updatedAt?: string;
}
