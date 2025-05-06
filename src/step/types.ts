// src/step/step.types.ts
export interface StepParams {
  id: string;
  spCost: {
    [key: string]: number;
  };
  spDelegate: string;
  spETA: string;
  spHolder: string;
  spPerformer: string[];
  spRecipient: string;
  spRequester: string;
  spStartTime: string;
  spTxOutRef: string;
}
