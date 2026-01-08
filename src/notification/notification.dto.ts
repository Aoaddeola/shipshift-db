// notification.dto.ts
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
  IsDateString,
  IsNumber,
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

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  variables?: Record<string, any>;
}

export class BatchNotificationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleNotificationDto)
  @ApiProperty({ type: [SingleNotificationDto] })
  notifications: SingleNotificationDto[];
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

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  PARTIALLY_SENT = 'partially_sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class ChannelStatusDto {
  @IsBoolean()
  @ApiProperty({ example: true })
  sent: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'msg-123' })
  messageId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Failed to send' })
  error?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01T12:00:00Z' })
  sentAt?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 1 })
  attempts?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01T12:00:00Z' })
  lastAttempt?: string;
}

export class ChannelStatusMapDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelStatusDto)
  @ApiPropertyOptional({ type: ChannelStatusDto })
  email?: ChannelStatusDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelStatusDto)
  @ApiPropertyOptional({ type: ChannelStatusDto })
  sms?: ChannelStatusDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelStatusDto)
  @ApiPropertyOptional({ type: ChannelStatusDto })
  push?: ChannelStatusDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelStatusDto)
  @ApiPropertyOptional({ type: ChannelStatusDto })
  session?: ChannelStatusDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelStatusDto)
  @ApiPropertyOptional({ type: ChannelStatusDto })
  websocket?: ChannelStatusDto;
}

export class ErrorDetailsDto {
  @IsString()
  @ApiProperty({ example: 'Failed to connect to email service' })
  message: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'CONNECTION_ERROR' })
  code?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Error stack trace...' })
  stack?: string;
}

export class MetadataDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'corr-123' })
  correlationId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'booking-service' })
  sourceService?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Mozilla/5.0' })
  userAgent?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 1 })
  priority?: number;
}

export class SingleNotificationEntityDto {
  @IsString()
  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ValidateNested()
  @Type(() => RecipientMapDto)
  @ApiProperty({ type: RecipientMapDto })
  recipientMap: RecipientMapDto;

  @IsEnum(NotificationUrgency)
  @ApiProperty({ enum: NotificationUrgency, example: NotificationUrgency.HIGH })
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

  @IsEnum(NotificationStatus)
  @ApiProperty({ enum: NotificationStatus, example: NotificationStatus.SENT })
  status: NotificationStatus;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01T12:00:00Z' })
  sentAt?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01T12:05:00Z' })
  deliveredAt?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01T12:10:00Z' })
  readAt?: string;

  @IsNumber()
  @ApiProperty({ example: 0 })
  retryCount: number;

  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @ApiProperty({
    enum: NotificationType,
    isArray: true,
    example: [NotificationType.Email, NotificationType.Push],
  })
  channelsToUse: NotificationType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelStatusMapDto)
  @ApiPropertyOptional({ type: ChannelStatusMapDto })
  channelStatus?: ChannelStatusMapDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ErrorDetailsDto)
  @ApiPropertyOptional({ type: ErrorDetailsDto })
  errorDetails?: ErrorDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  @ApiPropertyOptional({ type: MetadataDto })
  metadata?: MetadataDto;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    example: { bookingId: 'book_123', date: '2024-01-01' },
  })
  variables?: Record<string, any>;
}

export class BatchNotificationEntityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleNotificationEntityDto)
  @ApiProperty({ type: [SingleNotificationEntityDto] })
  notifications: SingleNotificationEntityDto[];

  @IsNumber()
  @ApiProperty({ example: 5 })
  total: number;

  @IsNumber()
  @ApiProperty({ example: 0 })
  page: number;

  @IsNumber()
  @ApiProperty({ example: 10 })
  limit: number;

  @IsNumber()
  @ApiProperty({ example: 100 })
  totalPages: number;
}

export class CreateSingleNotificationDto {
  @IsString()
  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ValidateNested()
  @Type(() => RecipientMapDto)
  @ApiProperty({ type: RecipientMapDto })
  recipientMap: RecipientMapDto;

  @IsEnum(NotificationUrgency)
  @ApiProperty({ enum: NotificationUrgency, example: NotificationUrgency.HIGH })
  urgency: 'low' | 'medium' | 'high';

  @IsString()
  @ApiProperty({ example: 'booking_confirmed' })
  event: string;

  @IsString()
  @ApiProperty({ example: 'Alice' })
  userName: string;

  @IsString()
  @ApiProperty({ example: 'en' })
  locale: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    example: { bookingId: 'book_123', date: '2024-01-01' },
  })
  variables?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  @ApiPropertyOptional({ type: MetadataDto })
  metadata?: MetadataDto;
}

export class CreateBatchNotificationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSingleNotificationDto)
  @ApiProperty({ type: [CreateSingleNotificationDto] })
  notifications: CreateSingleNotificationDto[];
}

export class UpdateNotificationStatusDto {
  @IsEnum(NotificationStatus)
  @ApiProperty({
    enum: NotificationStatus,
    example: NotificationStatus.DELIVERED,
  })
  status: NotificationStatus;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Additional status details' })
  message?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelStatusMapDto)
  @ApiPropertyOptional({ type: ChannelStatusMapDto })
  channelStatus?: ChannelStatusMapDto;
}

export class NotificationRuleDto {
  @IsString()
  @ApiProperty({ example: 'booking_confirmed' })
  event: string;

  @IsString()
  @ApiProperty({ example: 'template_123' })
  templateId: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    example: {
      userPreferences: ['email', 'push'],
      isUserOnline: true,
      urgency: ['high', 'medium'],
      locale: ['en', 'fr'],
    },
  })
  conditions?: {
    userPreferences?: string[];
    isUserOnline?: boolean;
    urgency?: ('low' | 'medium' | 'high')[];
    locale?: string[];
  };

  @IsNumber()
  @ApiProperty({ example: 1 })
  priority: number;

  @IsBoolean()
  @ApiProperty({ example: true })
  isActive: boolean;

  @IsBoolean()
  @ApiProperty({ example: false })
  isSystemRule: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Rule for booking confirmations' })
  description?: string;
}
