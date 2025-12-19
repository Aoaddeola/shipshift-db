// src/bug-report/bug-report.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BugReportController } from './bug-report.controller.js';
import { BugReportService } from './bug-report.service.js';
import { OpenProjectService } from './open-project.service.js';
import { BugReportConfigService } from './bug-report-config.service.js';
import { BugReportScheduler } from './bug-report.scheduler.js';
import { FileUploadService } from '../config/files-upload.service.js';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [BugReportController],
  providers: [
    BugReportService,
    OpenProjectService,
    BugReportConfigService,
    FileUploadService,
    BugReportScheduler,
  ],
  exports: [BugReportService],
})
export class BugReportModule {}
