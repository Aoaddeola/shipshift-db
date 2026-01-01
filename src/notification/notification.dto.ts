// notification.dto.ts
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

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

export class RenderedContentDto {
  @IsString()
  @ApiProperty({ example: 'Welcome to our service!' })
  subject?: string;

  @IsString()
  @ApiProperty({ example: 'Hello John, your booking has been confirmed...' })
  body: string;

  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  isHtml?: boolean;

  @IsString()
  @ApiProperty({ example: 'email' })
  channel: NotificationType;

  @IsObject()
  @ApiPropertyOptional()
  metadata?: Record<string, any>;
}

export class RenderedNotificationDto {
  @ApiProperty({ example: 'notif_123' })
  notificationId: string;

  @ApiProperty({ example: 'booking_confirmed' })
  event: string;

  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ApiProperty({ example: 'Alice' })
  userName: string;

  @ApiProperty({ example: 'en' })
  locale: string;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  createdAt: string;

  @ApiProperty({ example: 'sent' })
  status: string;

  @ApiProperty({ type: RenderedContentDto })
  renderedContent: RenderedContentDto;
}

export class GetRenderedNotificationsDto {
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @ApiProperty({
    enum: NotificationType,
    isArray: true,
    example: ['email', 'push'],
  })
  channels: NotificationType[];

  @IsOptional()
  @Type(() => Boolean)
  @ApiPropertyOptional({ example: true })
  includeHtml?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'en' })
  preferredLanguage?: string;
}
// Add this after the existing DTOs in notification.dto.ts

export class EmailContentDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '🎉 Booking Confirmed!' })
  subject?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '<h2>Booking Confirmed</h2>' })
  htmlBody?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Your booking has been confirmed.' })
  textBody?: string;
}

export class SmsContentDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Booking confirmed for {{event}}' })
  body?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 160 })
  maxLength?: number;
}

export class PushContentDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Booking Confirmed!' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Your booking has been confirmed' })
  body?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: Object, example: { type: 'booking' } })
  data?: Record<string, any>;
}

export class SessionContentDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Your booking has been confirmed' })
  message?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: Object, example: { type: 'booking' } })
  data?: Record<string, any>;
}

export class WebSocketContentDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'notification.received' })
  event?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: Object, example: { type: 'booking' } })
  data?: Record<string, any>;
}

export class TemplateMetadataDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'admin_user_id' })
  createdBy?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'admin_user_id' })
  lastModifiedBy?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'booking' })
  category?: string;
}

export class ChannelSpecificContentDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailContentDto)
  @ApiPropertyOptional({ type: EmailContentDto })
  email?: EmailContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SmsContentDto)
  @ApiPropertyOptional({ type: SmsContentDto })
  sms?: SmsContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PushContentDto)
  @ApiPropertyOptional({ type: PushContentDto })
  push?: PushContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SessionContentDto)
  @ApiPropertyOptional({ type: SessionContentDto })
  session?: SessionContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WebSocketContentDto)
  @ApiPropertyOptional({ type: WebSocketContentDto })
  websocket?: WebSocketContentDto;
}

export class CreateNotificationTemplateDto {
  @IsString()
  @ApiProperty({ example: 'booking_confirmed' })
  templateId: string;

  @IsString()
  @ApiProperty({ example: 'Booking Confirmed' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Notification when a booking is confirmed' })
  description?: string;

  @IsString()
  @ApiProperty({ example: 'Booking Confirmed - {{event}}' })
  defaultSubject: string;

  @IsString()
  @ApiProperty({
    example: 'Hello {{userName}}, your booking has been confirmed.',
  })
  defaultBody: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    example: ['userName', 'event', 'date', 'time'],
  })
  variables: string[];

  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @ApiProperty({
    enum: NotificationType,
    isArray: true,
    example: ['email', 'push', 'sms'],
  })
  supportedChannels: NotificationType[];

  @IsString()
  @ApiProperty({ example: 'en' })
  language: string;

  @IsString()
  @ApiProperty({ example: '1.0' })
  version: string;

  @IsBoolean()
  @ApiProperty({ example: true })
  isActive: boolean;

  @IsBoolean()
  @ApiProperty({ example: false })
  isSystemTemplate: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelSpecificContentDto)
  @ApiPropertyOptional({ type: ChannelSpecificContentDto })
  channelSpecificContent?: ChannelSpecificContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateMetadataDto)
  @ApiPropertyOptional({ type: TemplateMetadataDto })
  metadata?: TemplateMetadataDto;
}

export class UpdateNotificationTemplateDto extends PartialType(
  CreateNotificationTemplateDto,
) {}
