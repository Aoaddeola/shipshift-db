import { OperatorTypeParams } from '../../users/operator/operator.types.js';

export interface ColonyNode {
  id: string;
  name: string;
  platformAssetClass: string;
  nodeOperatorAddresses: string[];
  minimumActiveSignatory: number;
  commissionPercent: number;
  maximumActiveStepsCount: number;
  peerId: string;
  createdAt?: string;
  updatedAt?: string;
}
