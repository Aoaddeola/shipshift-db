import { ColonyNode } from '../../onchain/colony-node/colony-node.types.js';

/**
 * Operator Type Parameters
 */
export type OperatorTypeParams =
  | 'ReserveOperatorType'
  | 'DispatchOperatorType'
  | 'CuratorType';

/**
 * Participant Type Parameters
 */
export type ParticipantTypeParams =
  | 'RequesterType'
  | 'RecipientType'
  | 'PerformerType'
  | 'HolderType'
  | 'ComplainantType';

/**
 * Minimum Collateral Parameters
 */
export type MinimumCollateralParams = [ParticipantTypeParams, number][];

/**
 * Onchain Operator Parameters
 */
export interface OnchainOperator {
  opRole: OperatorTypeParams;
  opAddr: string;
  opCuratorPercentCommission: number;
  opTxOutRef: string;
  opCollateralAssetClass: string;
  opMinCollateralPerParticipant: MinimumCollateralParams;
}

/**
 * Offchain Operator Parameters
 */
export interface OffchainOperator {
  colonyNodeId: string;
  colonyNode?: ColonyNode;
}

/**
 * Operator Parameters Interface
 */
export interface Operator {
  id: string;
  onchain: OnchainOperator;
  offchain: OffchainOperator;
  createdAt?: string;
  updatedAt?: string;
}

export type Curator = Operator;
