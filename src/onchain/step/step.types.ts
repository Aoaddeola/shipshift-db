import { Shipment } from '../../logistics/shipment/shipment.types.js';
import { ColonyNode } from '../colony-node/colony-node.types.js';
import { Journey } from '../../logistics/journey/journey.types.js';
import { Operator } from '../../users/operator/operator.types.js';
import { User } from '../../users/user/user.types.js';
import { Agent } from '../../profiles/agent/agent.types.js';

/**
 * Step State Enum (numeric values)
 */
export enum StepState {
  PENDING = 0,
  INITIALIZED,
  COMMITTED,
  COMMENCED,
  COMPLETED,
  DELEGATED,
  FULFILLED,
  CLAIMED,
  CANCELLED,
  REJECTED,
  ACCEPTED,
  REFUNDED,
  PICKED_UP, // New types
  DROPPED_OFF, // New types
  // HANDED_OVER, // New types
  // RECEIVED,     // New types
}

/**
 * Wallet Address Type
 */
export type WalletAddress = string;

/**
 * Minting Policy ID Type
 */
export type MintingPolicyId = string;

/**
 * Requester Type
 */
export type Requester = [WalletAddress, MintingPolicyId | null];

/**
 * Performer Type
 */
export type Performer = [WalletAddress, MintingPolicyId];

/**
 * Step OnChain Interface
 */
export interface StepOnChain {
  spCost: number;
  spDelegate?: WalletAddress;
  spETA?: string; // ISO 8601 date string
  spHolder?: WalletAddress;
  spPerformer: Performer;
  spRecipient?: WalletAddress;
  spRequester: Requester;
  spStartTime?: string; // ISO 8601 date string
  spTxOutRef?: string;
}

/**
 * Step Interface
 */
export interface Step {
  id: string;
  index: number;
  stepParams: StepOnChain;
  shipmentId: string;
  journeyId: string;
  operatorId: string;
  colonyId: string;
  agentId: string;
  senderId: string;
  recipientId: string;
  holderId: string;
  state: StepState;
  shipment?: Shipment;
  journey?: Journey;
  operator?: Operator;
  colony?: ColonyNode;
  agent?: Agent;
  sender?: User; // Assuming sender is a User, not Agent
  recipient?: User; // Optional embedded recipient
  holder?: User; // Optional embedded holder
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}
