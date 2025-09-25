import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.types.js';
import { LocationCreateDto } from '../../common/location/location-create.dto.js';

export class CustomerCreateDto
  implements
    Omit<
      Customer,
      'id' | 'createdAt' | 'updatedAt' | 'contactDetails' | 'address'
    >
{
  // @ValidateNested()
  // @Type(() => LocationCreateDto)
  @ApiProperty({ type: LocationCreateDto })
  address: LocationCreateDto;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'contact-123',
    description: 'ID of the contact details',
  })
  contactDetailsId: string;
}
