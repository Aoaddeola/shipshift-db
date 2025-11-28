import { OperatorTypeParams } from '../../users/operator/operator.types.js';

export interface ColonyNode {
  id: string;
  name: string;
  platformAssetClass: string;
  nodeOperatorAddresses: string[];
  operatorTypes: OperatorTypeParams[];
  minimumActiveSignatory: number;
  commissionPercent: number;
  maximumActiveStepsCount: number;
  peerId: string;
  createdAt?: string;
  updatedAt?: string;
}
