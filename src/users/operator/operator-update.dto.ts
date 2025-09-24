import { IsString, Matches, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WALLET_ADDRESS_REGEX } from './operator-create.dto.js';

export class OperatorUpdateDto {
  @IsString()
  @IsOptional()
  @Matches(WALLET_ADDRESS_REGEX, {
    message: 'Wallet address must be a valid Cardano address',
  })
  @ApiPropertyOptional({
    example: 'addr1q8uvwxyz0987654321abcdef1234567890abcdef1234567890abcdef',
    description: 'Updated wallet address',
  })
  walletAddress?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'contact-456',
    description: 'Updated contact details ID',
  })
  contactDetailsId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'colony-node-789',
    description: 'Updated colony node ID',
  })
  colonyNodeId?: string;
}
