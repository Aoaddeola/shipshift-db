export interface ColonyParams {
  id: string;
  cpColonyOf: string[]; // Array of colony identifiers
  cpCreators: string[]; // Array of creator addresses
  cpMinActiveSignatory: number;
  cpTxOutRef: string; // Transaction output reference
}
