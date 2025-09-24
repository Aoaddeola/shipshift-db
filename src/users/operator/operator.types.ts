/**
 * Operator Interface
 */
export interface Operator {
  id: string;
  walletAddress: string;
  contactDetailsId: string;
  colonyNodeId: string;
  createdAt?: string;
  updatedAt?: string;
}
