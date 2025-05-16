import { OperatorOnChain } from 'src/colony/types.js';

// src/step/step.types.ts
export interface StepParams {
  id: string;
  spCost: {
    [key: string]: number;
  };
  spDelegate: string;
  spETA: string;
  spHolder: string;
  spPerformer: OperatorOnChain;
  spRecipient: string;
  spRequester: string;
  spStartTime: string;
  spTxOutRef: string;
}
