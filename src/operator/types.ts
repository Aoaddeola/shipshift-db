// src/operator/operator.types.ts

import { OperatorType, Availability } from '../availability/types.js';

/**
 * Operator Interface
 */
export interface Operator {
  id: string;
  colonyId: string;
  walletAddress: string;
  sessionID: string;
  roles: OperatorType[];
  availability?: Availability[];
}
