/**
 * Agent Interface
 */
export interface Agent {
  id: string;
  name: string;
  contactDetailsId: string;
  operatorId: string; // reference to Operator
  journeyIds: string[]; // published journeys
  createdAt?: string;
  updatedAt?: string;
}
