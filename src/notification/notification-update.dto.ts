import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from './notification.types.js';

export class NotificationUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Updated notification title' })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Updated notification message' })
  message?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '10 min ago',
    description: 'Updated human-readable time',
  })
  time?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: NotificationType,
    description: 'Updated notification type',
  })
  type?: NotificationType;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'Updated read status' })
  read?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'user-456', description: 'Updated user ID' })
  userId?: string;
}
