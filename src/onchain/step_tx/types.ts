import { Step, StepState } from '../step/step.types.js';

/**
 * Step Transaction Database Entry Interface
 */
export interface StepTxDbEntry {
  id: string;
  stepId: string;
  transactionHash: string;
  state: StepState;
  step?: Step;
  transaction?: Transaction;
  createdAt?: string;
  updatedAt?: string;
}

interface Transaction {
  hash: string;
}
