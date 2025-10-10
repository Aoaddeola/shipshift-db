import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OperatorBadge } from './operator-badge.types.js';

// Regex for Cardano addresses (simplified - adjust as needed for your specific format)
export const ADDRESS_REGEX = /^addr[0-9a-z]+$/;
// Regex for policy IDs (hex format)
export const POLICY_ID_REGEX = /^[a-f0-9]{56}$/;

export class OperatorBadgeCreateDto
  implements Omit<OperatorBadge, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @ApiProperty({
    example: 'operator-id',
    description: 'operator id',
  })
  operatorId: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(ADDRESS_REGEX, {
  //   message: 'Step address must be a valid Cardano address',
  // })
  @ApiProperty({
    example: 'addr1q9abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Step contract address',
  })
  stepAddress: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(ADDRESS_REGEX, {
  //   message: 'Treasury address must be a valid Cardano address',
  // })
  @ApiProperty({
    example: 'addr1q8uvwxyz0987654321abcdef1234567890abcdef1234567890abcdef',
    description: 'Treasury address',
  })
  treasuryAddress: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(ADDRESS_REGEX, {
  //   message: 'Operator badge address must be a valid Cardano address',
  // })
  @ApiProperty({
    example: 'addr1q7defghij5678901234abcdef1234567890abcdef1234567890abcdef',
    description: 'Operator badge address',
  })
  operatorBadgeAddress: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(ADDRESS_REGEX, {
  //   message: 'Operator badge address must be a valid Cardano address',
  // })
  @ApiProperty({
    example: 'addr1q7defghij5678901234abcdef1234567890abcdef1234567890abcdef',
    description: 'Operator wallet address',
  })
  opWalletAddress: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(POLICY_ID_REGEX, {
  //   message: 'Colony minting policy must be a valid hex string',
  // })
  @ApiProperty({
    example: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    description: 'Colony minting policy identifier',
  })
  colonyMintingPolicy: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(POLICY_ID_REGEX, {
  //   message: 'Step minting policy must be a valid hex string',
  // })
  @ApiProperty({
    example: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    description: 'Step minting policy identifier',
  })
  stepMintingPolicy: string;
}
