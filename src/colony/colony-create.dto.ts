// src/colony/colony-create.dto.ts
import { IsArray, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ColonyParams } from './types.js';

export class ColonyCreateDto implements Omit<ColonyParams, 'id'> {
  @ApiProperty({ description: 'List of parent colonies', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  cpColonyOf: string[];

  @ApiProperty({ description: 'List of creators of the colony', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  cpCreators: string[];

  @ApiProperty({ description: 'Minimum number of active signatories required' })
  @IsNumber()
  @IsNotEmpty()
  cpMinActiveSignatory: number;

  @ApiProperty({ description: 'Reference to the transaction output' })
  @IsString()
  @IsNotEmpty()
  cpTxOutRef: string;
}
