// src/colony-badge/colony-badge.types.ts

/**
 * Blockchain address (hex format)
 */
export type Address = string;

/**
 * Minting policy ID (hexadecimal string)
 */
export type PolicyId = string;

/**
 * Colony Badge Parameters Interface
 */
export interface ColonyBadgeParams {
  id: string;
  cbpCounterAddress: Address;
  cbpMintingPolicyId: PolicyId;
  cbpRole: string;
  cbpStepAddress: Address;
  cbpTreasuryAddress: Address;
}
