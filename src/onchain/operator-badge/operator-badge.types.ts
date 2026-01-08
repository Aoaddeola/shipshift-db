/**
 * Operator Badge Interface
 */
export interface OperatorBadge {
  id: string;
  walletAddress: string;
  stepAddress: string;
  treasuryAddress: string;
  statusAddress: string;
  operatorAgentAddr?: string;
  policyId: string;
  stepPolicyId: string;
  createdAt?: string;
  updatedAt?: string;
}
