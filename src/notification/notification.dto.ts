// notification.dto.ts
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  Email = 'email',
  SMS = 'sms',
  Push = 'push',
  Session = 'session',
  WebSocket = 'websocket',
}

export type NotificationResult = {
  channel: NotificationType;
  address: string;
  success: boolean;
  error?: string;
};

export class RecipientMapDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'user@example.com' })
  [NotificationType.Email]?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '+1234567890' })
  [NotificationType.SMS]?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'device-token-123' })
  [NotificationType.Push]?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'session-id-123' })
  [NotificationType.Session]?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'socket-id-123' })
  [NotificationType.WebSocket]?: string;
}

export class UserPreferencesDto {
  @IsBoolean()
  @ApiProperty({ example: true })
  email: boolean;

  @IsBoolean()
  @ApiProperty({ example: false })
  sms: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  push: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  session: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  websocket: boolean;
}

export class SingleNotificationDto {
  @IsString()
  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ValidateNested()
  @Type(() => RecipientMapDto)
  @ApiProperty({ type: RecipientMapDto })
  recipientMap: RecipientMapDto;

  @IsEnum(['low', 'medium', 'high'])
  @ApiProperty({ enum: ['low', 'medium', 'high'], example: 'high' })
  urgency: 'low' | 'medium' | 'high';

  @ValidateNested()
  @Type(() => UserPreferencesDto)
  @ApiProperty({ type: UserPreferencesDto })
  userPreferences: UserPreferencesDto;

  @IsBoolean()
  @ApiProperty({ example: true })
  isUserOnline: boolean;

  @IsString()
  @ApiProperty({ example: 'booking_confirmed' })
  event: string;

  @IsString()
  @ApiProperty({ example: 'Alice' })
  userName: string;

  @IsString()
  @ApiProperty({ example: 'en' })
  locale: string;
}

export class BatchNotificationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleNotificationDto)
  @ApiProperty({ type: [SingleNotificationDto] })
  notifications: Array<SingleNotificationDto>;
}

export class NotificationResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Notification processed successfully' })
  message: string;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  timestamp: string;

  @ApiPropertyOptional({ example: 'notif_123' })
  notificationId?: string;

  @ApiPropertyOptional({ example: ['email', 'push'] })
  channelsProcessed?: string[];

  @ApiPropertyOptional({ example: 2 })
  channelsCount?: number;
}
