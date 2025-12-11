/**
 * Agent Merkle Patricia Forest Proof Interface
 */
export interface AgentMPFProof {
  id: string;
  operatorId: string;
  rootHash: string;
  proof: object;
  createdAt?: string;
  updatedAt?: string;
}
