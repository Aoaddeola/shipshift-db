import { IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV: string;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  @IsOptional()
  IPFS_HOST: string;

  @IsNumber()
  @IsOptional()
  IPFS_PORT: number;

  @IsString()
  @IsOptional()
  IPFS_PROTOCOL: string;

  @IsString()
  @IsOptional()
  ORBITDB_DIRECTORY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
