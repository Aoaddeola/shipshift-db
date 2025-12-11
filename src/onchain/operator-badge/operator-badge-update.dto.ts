import { IsString, Matches, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ADDRESS_REGEX, POLICY_ID_REGEX } from './operator-badge-create.dto.js';

export class OperatorBadgeUpdateDto {
  @IsString()
  @IsOptional()
  @Matches(ADDRESS_REGEX, {
    message: 'Step address must be a valid Cardano address',
  })
  @ApiPropertyOptional({
    example: 'addr1q9abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated step contract address',
  })
  stepAddress?: string;

  @IsString()
  @IsOptional()
  @Matches(ADDRESS_REGEX, {
    message: 'Treasury address must be a valid Cardano address',
  })
  @ApiPropertyOptional({
    example: 'addr1q8uvwxyz0987654321abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated treasury address',
  })
  treasuryAddress?: string;

  @IsString()
  @IsOptional()
  @Matches(ADDRESS_REGEX, {
    message: 'Operator badge address must be a valid Cardano address',
  })
  @ApiPropertyOptional({
    example: 'addr1q7defghij5678901234abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated operator badge address',
  })
  statusAddress?: string;

  @IsString()
  @IsOptional()
  @Matches(POLICY_ID_REGEX, {
    message: 'Colony minting policy must be a valid hex string',
  })
  @ApiPropertyOptional({
    example: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    description: 'Updated colony minting policy identifier',
  })
  policyId?: string;

  @IsString()
  @IsOptional()
  @Matches(POLICY_ID_REGEX, {
    message: 'Step minting policy must be a valid hex string',
  })
  @ApiPropertyOptional({
    example: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    description: 'Updated step minting policy identifier',
  })
  stepPolicyId?: string;
}
