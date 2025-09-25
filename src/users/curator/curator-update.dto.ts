import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CuratorUpdateDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({
    example: 'Updated Curator Name',
    description: 'Updated name of the curator',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'contact-456',
    description: 'Updated contact details ID',
  })
  contactDetailsId?: string;
}
