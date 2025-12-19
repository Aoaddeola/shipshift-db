// src/bug-report/bug-report.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BugReportService } from './bug-report.service.js';

@Injectable()
export class BugReportScheduler {
  private readonly logger = new Logger(BugReportScheduler.name);

  constructor(private bugReportService: BugReportService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    this.logger.log('Running daily cleanup of old bug reports');
    const deletedCount = this.bugReportService.cleanupOldReports(24);
    this.logger.log(`Cleaned up ${deletedCount} old bug reports`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkServiceStatus() {
    const status = await this.bugReportService.getStatus();
    if (!status.configStatus.isValid) {
      this.logger.warn(
        `OpenProject configuration incomplete. Missing: ${status.configStatus.missingFields.join(', ')}`,
      );
    }
  }
}
