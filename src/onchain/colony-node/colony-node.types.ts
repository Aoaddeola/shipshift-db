/**
 * Colony Node Interface
 */
export interface ColonyNode {
  id: string;
  name: string;
  nodeOperatorAddresses: string[];
  minimumActiveSignatory: number;
  commissionPercent: number;
  maximumActiveStepsCount: number;
  peerId: string;
  createdAt?: string;
  updatedAt?: string;
}
