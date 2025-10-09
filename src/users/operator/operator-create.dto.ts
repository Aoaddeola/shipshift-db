import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
  ArrayNotEmpty,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Operator,
  OperatorTypeParams,
  ParticipantTypeParams,
} from './operator.types.js';

// // Custom validator for MinimumCollateralParams
// function IsMinimumCollateralParams(validationOptions?) {
//   return function (object: object, propertyName: string) {
//     const allowedTypes: ParticipantTypeParams[] = [
//       'RequesterType',
//       'RecipientType',
//       'PerformerType',
//       'HolderType',
//       'ComplainantType',
//     ];

//     function validate(value: [ParticipantTypeParams, number][]) {
//       if (!Array.isArray(value)) return false;
//       if (value.length !== 5) return false; // Must have all 5 participant types

//       const foundTypes = new Set();
//       for (const [type, amount] of value) {
//         if (!allowedTypes.includes(type)) return false;
//         if (typeof amount !== 'number' || amount < 0) return false;
//         if (foundTypes.has(type)) return false;
//         foundTypes.add(type);
//       }

//       return true;
//     }

//     classValidator.registerDecorator({
//       name: 'isMinimumCollateralParams',
//       target: object.constructor,
//       propertyName,
//       constraints: [],
//       options: validationOptions,
//       validator: {
//         validate: (value, args) => validate(value),
//         defaultMessage: (args) =>
//           `${args.property} must be an array of 5 tuples with all participant types and non-negative amounts`,
//       },
//     });
//   };
// }

// Nested DTO for OnchainOperator
class OnchainOperatorDto {
  @IsEnum(['ReserveOperatorType', 'DispatchOperatorType', 'CuratorType'])
  @ApiProperty({
    enum: ['ReserveOperatorType', 'DispatchOperatorType', 'CuratorType'],
    example: 'ReserveOperatorType',
    description: 'Role of the operator',
  })
  opRole: OperatorTypeParams;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'addr1q9abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Operator address',
  })
  opAddr: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 5,
    description: 'Curator commission percentage (0-100)',
  })
  opCuratorPercentCommission: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '1a2b3c4d#0',
    description: 'Transaction output reference',
  })
  opTxOutRef: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'policyid.assetname',
    description: 'Collateral asset class identifier',
  })
  opCollateralAssetClass: string;

  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({
    example: [
      ['RequesterType', 1000000],
      ['RecipientType', 1000000],
      ['PerformerType', 1000000],
      ['HolderType', 1000000],
      ['ComplainantType', 1000000],
    ],
    description:
      'Minimum collateral required per participant type as [type, amount] tuples',
  })
  opMinCollateralPerParticipant: [ParticipantTypeParams, number][];
}

// Nested DTO for OffchainOperator
class OffchainOperatorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'colony-node-456',
    description: 'ID of the colony node',
  })
  colonyNodeId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'colony-node-456',
    description: 'ID of the colony node',
  })
  badgeId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 'colony-node-456',
    description: 'Agent',
  })
  agentCommission: number;
}

export class OperatorCreateDto
  implements Omit<Operator, 'id' | 'createdAt' | 'updatedAt'>
{
  @ValidateNested()
  @Type(() => OnchainOperatorDto)
  @ApiProperty({ type: OnchainOperatorDto })
  onchain: OnchainOperatorDto;

  @ValidateNested()
  @Type(() => OffchainOperatorDto)
  @ApiProperty({ type: OffchainOperatorDto })
  offchain: OffchainOperatorDto;
}
