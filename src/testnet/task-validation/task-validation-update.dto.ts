import {
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Entity } from './task-validation.types.js';
import { ParcelHandlingInfoUpdateDto } from '../../logistics/parcel/parcel-update.dto.js';
import { CoordinatesUpdateDto } from '../../common/location/location-update.dto.js';
import { StepState } from '../../onchain/step/step.types.js';
import { UserType } from '../../users/user/user.types.js';

// Constraints DTOs for each entity type
class JourneyConstraintsUpdateDto {
  @ValidateNested()
  @Type(() => ParcelHandlingInfoUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: ParcelHandlingInfoUpdateDto })
  parcel?: ParcelHandlingInfoUpdateDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2,
    description: 'Updated minimum number of journeys',
  })
  minimum?: number;
}

class LocationConstraintsUpdateDto {
  @ValidateNested()
  @Type(() => CoordinatesUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: CoordinatesUpdateDto })
  coordinates?: CoordinatesUpdateDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2000,
    description: 'Updated radius in meters',
  })
  radius?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2,
    description: 'Updated minimum number of locations',
  })
  minimum?: number;
}

class StepConstraintsUpdateDto {
  @IsEnum(StepState)
  @IsOptional()
  @ApiPropertyOptional({
    enum: StepState,
    example: StepState.COMPLETED,
    description: 'Updated required step state',
  })
  state?: StepState;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-456',
    description: 'Updated required recipient ID',
  })
  recipientId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-789',
    description: 'Updated required sender ID',
  })
  senderId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'agent-012',
    description: 'Updated required agent ID',
  })
  agentId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'operator-345',
    description: 'Updated required operator ID',
  })
  operatorId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2,
    description: 'Updated minimum number of steps',
  })
  minimum?: number;
}

class UserConstraintsUpdateDto {
  @IsEnum(UserType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.AGENT,
    description: 'Updated required user type',
  })
  type?: UserType;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description: 'Updated verification requirement',
  })
  verified?: boolean;
}

class OperatorConstraintsUpdateDto {
  @IsEnum(UserType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.OPERATOR,
    description: 'Updated required operator type',
  })
  type?: UserType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    example: ['create', 'read'],
    description: 'Updated required permissions',
  })
  permissions?: string[];
}

class ShipmentConstraintsUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-456',
    description: 'Updated required sender ID',
  })
  senderId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2,
    description: 'Updated minimum number of shipments',
  })
  minimum?: number;
}

// Union type for constraints based on entity
type ConstraintsUpdateDto =
  | JourneyConstraintsUpdateDto
  | LocationConstraintsUpdateDto
  | StepConstraintsUpdateDto
  | UserConstraintsUpdateDto
  | OperatorConstraintsUpdateDto
  | ShipmentConstraintsUpdateDto;

export class TaskValidationUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'task-456',
    description: 'Updated task ID',
  })
  taskId?: string;

  @IsEnum(Entity)
  @IsOptional()
  @ApiPropertyOptional({
    enum: Entity,
    example: Entity.Location,
    description: 'Updated entity type',
  })
  entity?: Entity;

  @ValidateNested()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Updated constraints for the entity type',
  })
  constraints?: ConstraintsUpdateDto;
}
