// src/auth/dto/oauth-callback.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  redirectUri: string;

  @IsString()
  @IsOptional()
  state?: string;
}

export class OAuthUnlinkDto {
  @IsString()
  @IsNotEmpty()
  provider: string;
}
