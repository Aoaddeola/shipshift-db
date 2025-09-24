/**
 * Operator Badge Interface
 */
export interface OperatorBadge {
  id: string;
  stepAddress: string;
  treasuryAddress: string;
  operatorBadgeAddress: string;
  colonyMintingPolicy: string;
  stepMintingPolicy: string;
  createdAt?: string;
  updatedAt?: string;
}
