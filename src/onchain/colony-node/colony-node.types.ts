/**
 * Asset Class Interface
 */
export interface AssetClass {
  policy_id: string;
  asset_name: string;
}

/**
 * Colony Node Interface
 */
export interface ColonyNode {
  id: string;
  name: string;
  platformAssetClass: AssetClass;
  nodeOperatorAddresses: string[];
  minimumActiveSignatory: number;
  commissionPercent: number;
  maximumActiveStepsCount: number;
  peerId: string;
  platformAssetClassDetails?: AssetClass; // Embedded asset class details
  createdAt?: string;
  updatedAt?: string;
}
