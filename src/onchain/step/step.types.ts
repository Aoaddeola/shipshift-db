import { Shipment } from '../../logistics/shipment/shipment.types.js';
import { ColonyNode } from '../colony-node/colony-node.types.js';
import { Journey } from '../../logistics/journey/journey.types.js';
import { Operator } from '../../users/operator/operator.types.js';
import { User } from '../../users/user/user.types.js';
import { Agent } from '../../profiles/agent/agent.types.js';
import { Mission } from '../../logistics/mission/mission.types.js';
// import { NotificationType } from '../../notification/notification.types.js';
import { Location } from '../../common/location/location.types.js';

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
  spOperator?: WalletAddress;
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
  offerId?: string;
  operatorId: string;
  colonyId: string;
  agentId: string;
  senderId: string;
  recipientId: string;
  holderId: string;
  reference?: string;
  state: StepState;
  shipment?: Shipment;
  journey?: Journey;
  mission?: Mission;
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

export interface StepEventMessage {
  id: string;
  type: string;
  timestamp: string;
  data: {
    eventType: string;
    stepId: string;
    previousState?: StepState;
    newState?: StepState;
    metadata?: Record<string, any>;
  };
  source: string;
  version: string;
}

// export interface NotificationPayload {
//   templateId: string;
//   userId: string;
//   variables: Record<string, any>;
//   urgency?: 'low' | 'normal' | 'high' | 'critical';
//   channelsToUse?: NotificationType[];
//   metadata?: {
//     sourceEvent: string;
//     stepId: string;
//     shipmentId?: string;
//     journeyId?: string;
//     agentId?: string;
//     senderId?: string;
//     recipientId?: string;
//     state?: string;
//     oldState?: string;
//     newState?: string;
//     timestamp?: string;
//     operatorId?: string;
//     dueDate?: string;
//     completionTime?: string;
//     nextStepId?: string;
//     pickupTime?: string;
//     location?: string;
//     trackingNumber?: string;
//     dropoffTime?: string;
//     recipient?: string;
//     amount?: string;
//     currency?: string;
//     transactionId?: string;
//     paymentTime?: string;
//   };
// }

export type StakeholderRole =
  | 'agent'
  | 'sender'
  | 'recipient'
  | 'holder'
  | 'operator';

export interface Stakeholder {
  userId: string;
  role: StakeholderRole;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    websocket: boolean;
  };
}

export interface StepEventData {
  stepId: string;
  step: Step;
  oldState?: StepState;
  newState?: StepState;
  metadata?: Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepCreatedEventData extends StepEventData {
  // Additional properties for created event
  shipmentId: string;
  journeyId: string;
  agentId: string;
  senderId: string;
  recipientId: string;
  state: string;
}

export interface StepStateChangedEventData extends StepEventData {
  transitionReason?: string;
  shipmentId: string;
  agentId: string;
  timestamp: string;
}

export interface StepAssignedEventData extends StepEventData {
  assignedToId: string;
  assignedById?: string;
  assignmentTimestamp: string;
  shipmentId: string;
  journeyId: string;
  agentId: string;
  operatorId: string;
  dueDate: string;
}

export interface StepMilestoneEventData extends StepEventData {
  location?: Location;
  timestamp: string;
  signature?: string;
  photoUrl?: string;
}

export interface StepPaymentEventData extends StepEventData {
  amount: number;
  currency: string;
  transactionId: string;
  paymentMethod?: string;
  payerId: string;
  recipientId: string;
}

export interface StepEventOptions {
  correlationId?: string;
  headers?: Record<string, any>;
  exchange?: string;
  priority?: number;
}
