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
  state: StepState;
  createdAt?: string;
  updatedAt?: string;
}

type WalletAddress = string;
type MintingPolicyId = string;

interface StepOnChain {
  spCost: number;
  spDelegate: WalletAddress;
  spETA: string; // ISO 8601 date string
  spHolder: WalletAddress;
  spPerformer: [WalletAddress, MintingPolicyId];
  spRecipient: WalletAddress;
  spRequester: [WalletAddress, MintingPolicyId];
  spStartTime: string; // ISO 8601 date string
  spTxOutRef: string;
}
