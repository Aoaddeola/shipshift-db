// src/auth/dto/auth.dto.ts
import { DataSignature } from '@meshsdk/common';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Wallet address is required' })
  address: string;

  @IsString({ message: 'DataSignature is required' })
  signature: DataSignature;
}
