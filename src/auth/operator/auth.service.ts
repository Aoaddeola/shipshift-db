// src/auth/auth.service.ts
import { checkSignature, DataSignature, generateNonce } from '@meshsdk/core';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Operator } from '../../users/operator/operator.types.js';
import { ColonyNode } from '../../onchain/colony-node/colony-node.types.js';
// import { checkSignature } from '@meshsdk/common';

@Injectable()
export class AuthService {
  // In-memory storage for challenges (address -> challenge)
  private readonly challengeStore = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates and stores a unique challenge for a wallet address
   * @param walletAddress - The wallet address to associate the challenge with
   * @returns The generated challenge
   */
  generateChallenge(walletAddress: string): string {
    const challenge = generateNonce('shpshft', 50);
    this.challengeStore.set(walletAddress, challenge);
    return challenge;
  }

  /**
   * Validates a wallet signature against a stored challenge
   * @param walletAddress - The wallet address to verify
   * @param signature - The cryptographic signature provided by the wallet
   * @returns Boolean indicating success/failure
   */
  async validateWallet(
    walletAddress: string,
    signature: DataSignature,
  ): Promise<boolean> {
    const storedChallenge = this.challengeStore.get(walletAddress);
    if (!storedChallenge) return false;

    try {
      // Verify using MeshJS [[meshjs.dev]]
      // eslint-disable-next-line prettier/prettier
      const isValid = Promise.resolve(
        checkSignature(storedChallenge, signature, walletAddress),
      );

      if (await isValid) this.challengeStore.delete(walletAddress);

      return isValid;
    } catch (error) {
      console.error('Error validating wallet', error);
      return false;
    }
  }

  /**
   * Generates a JWT token for an authenticated wallet
   * @param walletAddress - The wallet address to encode in the token
   * @returns Signed JWT token
   */
  async generateToken(operator: Operator) {
    try {
      return this.jwtService.signAsync({
        sub: operator?.id,
        walletAddress: operator?.onchain.opAddr,
        userType: 'operator',
      });
    } catch (error) {
      console.error('User does not exist', error);
      return '';
    }
  }

  /**
   * Generates a JWT token for an authenticated node operator wallet
   * @param walletAddress - The wallet address to encode in the token
   * @returns Signed JWT token
   */
  async generateNodeOperatorToken(
    walletAddress: string,
    colonyNode: ColonyNode,
  ) {
    try {
      return this.jwtService.signAsync({
        sub: colonyNode?.id,
        walletAddress: walletAddress,
        userType: 'nodeOperator',
      });
    } catch (error) {
      console.error('User does not exist', error);
      return '';
    }
  }
}
