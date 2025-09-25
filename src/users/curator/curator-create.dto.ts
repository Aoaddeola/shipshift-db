import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Curator } from './curator.types.js';

export class CuratorCreateDto
  implements Omit<Curator, 'id' | 'createdAt' | 'updatedAt' | 'contactDetails'>
{
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Curator John',
    description: 'Name of the curator',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'contact-123',
    description: 'ID of the contact details',
  })
  contactDetailsId: string;
}
