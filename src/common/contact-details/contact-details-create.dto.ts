import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEmail } from 'class-validator';
import { ContactDetails } from './contact-details.types.js';

export class ContactDetailsCreateDto implements Omit<ContactDetails, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user-123' })
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +1234567890)',
  })
  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,16}$/, {
    message: 'SMS number must be in E.164 format (e.g., +1234567890)',
  })
  @ApiProperty({ example: '+1234567890' })
  sms: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'session-789' })
  session: string;
}
