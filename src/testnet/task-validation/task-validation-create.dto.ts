import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Entity } from './task-validation.types.js';
import { StepState } from '../../onchain/step/step.types.js';
import { UserType } from '../../users/user/user.types.js';
import { ParcelHandlingInfoDto } from '../../logistics/parcel/parcel-create.dto.js';
import { CoordinatesDto } from '../../common/location/location-create.dto.js';

// Constraints DTOs for each entity type
export class JourneyConstraintsDto {
  @ValidateNested()
  @Type(() => ParcelHandlingInfoDto)
  @IsOptional()
  @ApiPropertyOptional({ type: ParcelHandlingInfoDto })
  parcel?: ParcelHandlingInfoDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
    description: 'Minimum number of journeys',
  })
  minimum?: number;
}

export class LocationConstraintsDto {
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  @ApiPropertyOptional({ type: CoordinatesDto })
  coordinates?: CoordinatesDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 1000,
    description: 'Radius in meters',
  })
  radius?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
    description: 'Minimum number of locations',
  })
  minimum?: number;
}

class StepConstraintsDto {
  @IsEnum(StepState)
  @IsOptional()
  @ApiPropertyOptional({
    enum: StepState,
    example: StepState.PENDING,
    description: 'Required step state',
  })
  state?: StepState;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-123',
    description: 'Required recipient ID',
  })
  recipientId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-456',
    description: 'Required sender ID',
  })
  senderId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'agent-789',
    description: 'Required agent ID',
  })
  agentId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'operator-012',
    description: 'Required operator ID',
  })
  operatorId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
    description: 'Minimum number of steps',
  })
  minimum?: number;
}

class UserConstraintsDto {
  @IsEnum(UserType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.USER,
    description: 'Required user type',
  })
  type?: UserType;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user must be verified',
  })
  verified?: boolean;
}

class OperatorConstraintsDto {
  @IsEnum(UserType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.OPERATOR,
    description: 'Required operator type',
  })
  type?: UserType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    example: ['create', 'read', 'update', 'delete'],
    description: 'Required permissions',
  })
  permissions?: string[];
}

class ShipmentConstraintsDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-123',
    description: 'Required sender ID',
  })
  senderId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
    description: 'Minimum number of shipments',
  })
  minimum?: number;
}

// Union type for constraints based on entity
type ConstraintsDto =
  | JourneyConstraintsDto
  | LocationConstraintsDto
  | StepConstraintsDto
  | UserConstraintsDto
  | OperatorConstraintsDto
  | ShipmentConstraintsDto;

export class TaskValidationCreateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'task-123',
    description: 'ID of the task this validation belongs to',
  })
  taskId: string;

  @IsEnum(Entity)
  @ApiProperty({
    enum: Entity,
    example: Entity.Journey,
    description: 'Entity type this validation applies to',
  })
  entity: Entity;

  @ValidateNested()
  @ApiProperty({
    description: 'Constraints for the specified entity type',
  })
  constraints: ConstraintsDto;
}
