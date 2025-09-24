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
  CANCELLED,
  REJECTED,
  CLAIMED,
}

/**
 * Step On Chain Parameters Interface
 */
export interface StepOnChain {
  spRecipient: string;
  spRequester: string;
  spHolder: string;
  spPerformer: string;
  spDelegate: string;
  spCost: number;
  spTxOutRef: string;
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
