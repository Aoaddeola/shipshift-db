import { ApiPropertyOptional, ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  ValidateNested,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { NotificationType } from '..//notification/notification.types.js';

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
