// src/journey/journey-create.dto.ts

import { IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OperatorAvailability } from 'src/availability/types.js';
import { Journey } from './types.js';

export class JourneyCreateDto implements Omit<Journey, 'id'> {
  @ApiProperty({ description: 'Start of the journey' })
  @IsObject()
  @IsNotEmpty()
  start: OperatorAvailability;

  @ApiProperty({ description: 'End of the journey' })
  @IsObject()
  @IsNotEmpty()
  end: OperatorAvailability;

  @ApiProperty({
    description: 'Cost breakdown',
    example: { lovelace: 5000000, ada: 5 }
  })
  @IsObject()
  @IsNotEmpty()
  cost: Record<string, number>;
}