// src/bug-report/dto/bug-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export enum Severity {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  IMMEDIATE = 'immediate',
}

export class CreateBugReportDto {
  @ApiProperty({ example: 'Button not working on login page' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @ApiProperty({
    example: 'When clicking the login button, nothing happens...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    required: false,
    example: '1. Go to login page\n2. Enter credentials\n3. Click login button',
  })
  @IsString()
  @IsOptional()
  stepsToReproduce?: string;

  @ApiProperty({ example: 'User should be redirected to dashboard' })
  @IsString()
  @IsNotEmpty()
  expectedBehavior: string;

  @ApiProperty({ example: 'Nothing happens, page stays the same' })
  @IsString()
  @IsNotEmpty()
  actualBehavior: string;

  @ApiProperty({ enum: Severity, default: Severity.NORMAL })
  @IsEnum(Severity)
  severity: Severity;

  @ApiProperty({ enum: Priority, default: Priority.NORMAL })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ example: 'Chrome 119, Windows 11, https://example.com/login' })
  @IsString()
  @IsOptional()
  environment?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsArray()
  @IsOptional()
  attachments?: any[];
}

export class BugReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  workPackageId: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty({ required: false })
  attachmentsCount?: number;
}

export class OpenProjectConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  typeId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  statusId?: string;
}
