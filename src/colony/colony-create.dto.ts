// src/colony/colony-create.dto.ts

import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ColonyInfo, ParticipantType } from './types.js';
import { OperatorType } from '../availability/types.js';

// Nested DTOs

class OperatorOnChainDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q9abcdef1234567890' })
  opAddr: string;

  @IsEnum(OperatorType)
  @ApiProperty({ enum: OperatorType })
  opRole: OperatorType;
}

class ColonyParamsDto {
  @IsArray()
  @ApiProperty({ type: OperatorOnChainDto, isArray: true })
  cpOperators: OperatorOnChainDto[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 2 })
  cpMinActiveSignatory: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1a2b3c4d#0' })
  cpTxOutRef: string;
}

class MinimumCollateralDto {
  @IsEnum(ParticipantType)
  @ApiProperty({ enum: ParticipantType })
  participantType: ParticipantType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'fiat' })
  assetClass: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 5000000 })
  amount: number;
}

export class ColonyCreateDto implements Omit<ColonyInfo, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'My Awesome Colony' })
  colonyName: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty({ type: ColonyParamsDto })
  colonyInfo: {
    icpColonyParams: ColonyParamsDto;
    icpMinCollateral: MinimumCollateralDto[];
  };
}
