// src/colony/colony.types.ts

import { OperatorType } from '../availability/types.js';

/**
 * Operator on Chain Interface
 */
export interface OperatorOnChain {
  opAddr: string;
  opRole: OperatorType;
}

/**
 * Participant Type Enum
 */
export enum ParticipantType {
  RequesterType = 'RequesterType',
  RecipientType = 'RecipientType',
  PerformerType = 'PerformerType',
  HolderType = 'HolderType',
  ComplainantType = 'ComplainantType',
}

/**
 * Minimum Collateral Type (Tuple: [ParticipantType, Record<string, number>])
 */
export interface MinimumCollateral {
  participantType: ParticipantType;
  assetClass: string;
  amount: number;
}

/**
 * Inner Colony Parameters Interface
 */
export interface ColonyParams {
  cpOperators: OperatorOnChain[];
  cpMinActiveSignatory: number;
  cpTxOutRef: string;
}

/**
 * Colony Info Interface
 */
export interface ColonyInfo {
  id: string;
  colonyName: string;
  colonyInfo: {
    icpColonyParams: ColonyParams;
    icpMinCollateral: MinimumCollateral[];
  };
}

export interface MinimumCollateral {
  participantType: ParticipantType;
  assetClass: string;
  amount: number;
}
