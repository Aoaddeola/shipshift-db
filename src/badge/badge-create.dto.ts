// src/colony-badge/colony-badge-create.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ColonyBadgeParams, Address, PolicyId } from './types.js';

export class ColonyBadgeCreateDto implements Omit<ColonyBadgeParams, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Counter contract address (hex format)',
    example: 'addr1q9abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  cbpCounterAddress: Address;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Minting policy identifier (hex format)',
    example: 'policy1abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  cbpMintingPolicyId: PolicyId;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Role designation (e.g., "admin", "member")',
    example: 'admin',
  })
  cbpRole: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Step contract address (hex format)',
    example: 'addr1q8uvwxyz0987654321abcdef1234567890abcdef1234567890abcdef',
  })
  cbpStepAddress: Address;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Treasury address (hex format)',
    example: 'addr1q7defghij5678901234abcdef1234567890abcdef1234567890abcdef',
  })
  cbpTreasuryAddress: Address;
}