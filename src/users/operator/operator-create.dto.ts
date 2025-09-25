import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Operator } from './operator.types.js';

// Regex for Cardano addresses (simplified - adjust as needed for your specific format)
export const WALLET_ADDRESS_REGEX = /^addr[0-9a-z]+$/;

export class OperatorCreateDto
  implements Omit<Operator, 'id' | 'createdAt' | 'updatedAt' | 'contactDetails'>
{
  @IsString()
  @IsNotEmpty()
  @Matches(WALLET_ADDRESS_REGEX, {
    message: 'Wallet address must be a valid Cardano address',
  })
  @ApiProperty({
    example: 'addr1q9abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Cardano wallet address of the operator',
  })
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'contact-123',
    description: 'ID of the contact details',
  })
  contactDetailsId: string;
}
