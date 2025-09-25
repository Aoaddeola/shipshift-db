/**
 * Multi-Signature Witness Interface
 */
export interface MultiSigWitness {
  id: string;
  txId: string; // Unique transaction ID this witness belongs to
  signedTx: string; // Hex-encoded signed transaction
  signer: string; // Wallet address of the signer
}
