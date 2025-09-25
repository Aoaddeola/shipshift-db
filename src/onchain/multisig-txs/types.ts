/**
 * Multi-Signature Transaction Interface
 */
export interface MultiSigTx {
    id: string;
    txId: string;            // Unique transaction ID
    unsignedTx: string;      // Hex-encoded unsigned transaction
    signers: string[];       // List of signer addresses
    mininumSigner: number;   // Minimum number of signatures required
    entityDbName: string;    // Database name for the associated entity
    entityId: string;        // ID of the associated entity
  }