/**
 * Step State Enum
 */
export enum StepState {
  PENDING = 'PENDING',
  INITIALIZED = 'INITIALIZED',
  COMMITTED = 'COMMITTED',
  COMMENCED = 'COMMENCED',
  DELEGATED = 'DELEGATED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  CLAIMED = 'CLAIMED',
}

/**
 * Step Transaction Database Entry Interface
 */
export interface StepTxDbEntry {
  id: string;
  stepId: string;
  transactionHash: string;
  state: StepState;
}
