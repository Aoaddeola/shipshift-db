// src/bug-report/bug-report.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBugReportDto, BugReportResponseDto } from './bug-report.dto.js';
import { OpenProjectService } from './open-project.service.js';
import { BugReportConfigService } from './bug-report-config.service.js';
import { v4 as uuidv4 } from 'uuid';

export interface BugReportRecord {
  id: string;
  subject: string;
  workPackageId: number;
  status: 'pending' | 'submitted' | 'failed';
  submittedAt: Date;
  attachmentsCount: number;
  error?: string;
}

@Injectable()
export class BugReportService {
  private readonly logger = new Logger(BugReportService.name);
  private readonly reports: Map<string, BugReportRecord> = new Map();

  constructor(
    private openProjectService: OpenProjectService,
    private configService: BugReportConfigService,
  ) {}

  async submitBugReport(
    bugReport: CreateBugReportDto,
    files: Express.Multer.File[],
  ): Promise<BugReportResponseDto> {
    // Validate configuration
    const configValidation = this.configService.validateConfig();
    if (!configValidation.isValid) {
      throw new HttpException(
        {
          message: 'OpenProject configuration is incomplete',
          missingFields: configValidation.missingFields,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const reportId = uuidv4();

    // Create initial record
    const reportRecord: BugReportRecord = {
      id: reportId,
      subject: bugReport.subject,
      workPackageId: 0,
      status: 'pending',
      submittedAt: new Date(),
      attachmentsCount: files?.length || 0,
    };

    this.reports.set(reportId, reportRecord);
    this.logger.log(`Starting bug report submission: ${reportId}`);

    try {
      // Create work package in OpenProject
      const workPackageResult =
        await this.openProjectService.createWorkPackage(bugReport);

      // Update record with work package ID
      reportRecord.workPackageId = workPackageResult.workPackageId;
      reportRecord.status = 'submitted';
      this.reports.set(reportId, reportRecord);

      // Upload attachments if any
      let uploadedAttachments: any[] = [];
      if (files && files.length > 0) {
        this.logger.log(
          `Uploading ${files.length} attachment(s) for report ${reportId}`,
        );
        uploadedAttachments = await this.openProjectService.uploadAttachments(
          workPackageResult.workPackageId,
          files,
        );

        // Update attachments count with successful uploads
        reportRecord.attachmentsCount = uploadedAttachments.length;
        this.reports.set(reportId, reportRecord);
      }

      // Return response
      return {
        id: reportId,
        subject: bugReport.subject,
        workPackageId: workPackageResult.workPackageId,
        status: 'submitted',
        submittedAt: reportRecord.submittedAt,
        attachmentsCount: uploadedAttachments.length,
        workPackageUrl: workPackageResult.workPackageUrl,
      } as BugReportResponseDto;
    } catch (error) {
      // Update record with error
      reportRecord.status = 'failed';
      reportRecord.error = error.message;
      this.reports.set(reportId, reportRecord);

      this.logger.error(`Failed to submit bug report ${reportId}:`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to submit bug report',
          reportId,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReport(reportId: string): Promise<BugReportRecord | null> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new HttpException(
        `Bug report ${reportId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return report;
  }

  async getReports(
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ reports: BugReportRecord[]; total: number }> {
    const allReports = Array.from(this.reports.values());
    const paginatedReports = allReports
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      .slice(offset, offset + limit);

    return {
      reports: paginatedReports,
      total: allReports.length,
    };
  }

  async getStatus(): Promise<{
    enabled: boolean;
    totalReports: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
    configStatus: { isValid: boolean; missingFields: string[] };
  }> {
    const allReports = Array.from(this.reports.values());
    const configStatus = this.configService.validateConfig();

    return {
      enabled: this.configService.isEnabled(),
      totalReports: allReports.length,
      successCount: allReports.filter((r) => r.status === 'submitted').length,
      failedCount: allReports.filter((r) => r.status === 'failed').length,
      pendingCount: allReports.filter((r) => r.status === 'pending').length,
      configStatus,
    };
  }

  cleanupOldReports(maxAgeHours: number = 24): number {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours);

    let deletedCount = 0;
    for (const [id, report] of this.reports.entries()) {
      if (report.submittedAt < cutoffTime) {
        this.reports.delete(id);
        deletedCount++;
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} old bug reports`);
    return deletedCount;
  }
}
