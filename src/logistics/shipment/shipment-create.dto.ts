import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsEnum,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Shipment, ShipmentStatus } from './shipment.types.js';

export class ShipmentCreateDto
  implements Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user-123', description: 'ID of the sender' })
  senderId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user-456', description: 'ID of the receiver' })
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'mission-789',
    description: 'ID of the associated mission',
  })
  missionId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty({ message: 'stepIds array cannot be empty when provided' })
  @ApiPropertyOptional({
    example: ['step-111', 'step-222'],
    description: 'Array of step IDs associated with this shipment',
  })
  stepIds: string[];

  @IsEnum(ShipmentStatus)
  @ApiProperty({
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
    description: 'Current status of the shipment',
  })
  status: ShipmentStatus = ShipmentStatus.PENDING;
}
