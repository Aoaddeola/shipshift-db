// src/bug-report/open-project.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBugReportDto } from './bug-report.dto.js';
import {
  BugReportConfigService,
  OpenProjectConfig,
} from './bug-report-config.service.js';
import { FileUploadService } from '../config/files-upload.service.js';

interface OpenProjectWorkPackage {
  subject: string;
  description: {
    format: 'markdown';
    raw: string;
  };
  _type: 'WorkPackage';
  type: {
    _type: 'Type';
    id: string;
  };
  status: {
    _type: 'Status';
    id: string;
  };
  priority: {
    _type: 'Priority';
    id: string;
  };
  customFields?: Array<{
    _type: 'CustomField';
    id: string;
    value: string;
  }>;
}

@Injectable()
export class OpenProjectService {
  private readonly logger = new Logger(OpenProjectService.name);

  constructor(
    private configService: BugReportConfigService,
    private fileUploadService: FileUploadService,
  ) {}

  private formatDescription(bugReport: CreateBugReportDto): string {
    return `# Bug Report

## Description
${bugReport.description}

## Steps to Reproduce
${bugReport.stepsToReproduce || 'N/A'}

## Expected Behavior
${bugReport.expectedBehavior}

## Actual Behavior
${bugReport.actualBehavior}

## Environment
${bugReport.environment || 'N/A'}

## Additional Information
- **Severity**: ${bugReport.severity}
- **Priority**: ${bugReport.priority}
- **Reported via**: ${this.configService.getAppName()} Bug Report API
- **Timestamp**: ${new Date().toISOString()}
- **Frontend URL**: ${this.configService.getFrontendUrl()}
`;
  }

  private createWorkPackagePayload(
    bugReport: CreateBugReportDto,
    config: OpenProjectConfig,
  ): OpenProjectWorkPackage {
    const payload: OpenProjectWorkPackage = {
      subject: '[BUG_REPORT] ' + bugReport.subject,
      description: {
        format: 'markdown',
        raw: this.formatDescription(bugReport),
      },
      _type: 'WorkPackage',
      type: {
        _type: 'Type',
        id: config.typeId,
      },
      status: {
        _type: 'Status',
        id: config.statusId,
      },
      priority: {
        _type: 'Priority',
        id: this.configService.getPriorityId(bugReport.priority),
      },
    };

    // Add custom field for severity if configured
    if (this.configService.useCustomFields() && config.severityFieldId) {
      payload.customFields = [
        {
          _type: 'CustomField',
          id: config.severityFieldId,
          value: bugReport.severity.toUpperCase(),
        },
      ];
    }

    return payload;
  }

  async createWorkPackage(
    bugReport: CreateBugReportDto,
  ): Promise<{ workPackageId: number; workPackageUrl: string }> {
    const config = this.configService.getOpenProjectConfig();

    if (!this.configService.isEnabled()) {
      throw new HttpException(
        'OpenProject integration is not enabled',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const payload = this.createWorkPackagePayload(bugReport, config);

      this.logger.log(`Creating work package for: ${bugReport.subject}`);

      const response = await fetch(
        `${config.baseUrl}/api/v3/projects/${config.projectId}/work_packages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`apikey:${config.apiKey}`).toString('base64')}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(config.uploadTimeout),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Failed to create work package: ${response.status} - ${errorText}`,
        );

        // Handle specific OpenProject error codes
        if (response.status === 401 || response.status === 403) {
          throw new HttpException(
            'OpenProject authentication failed. Please check API key configuration.',
            HttpStatus.UNAUTHORIZED,
          );
        } else if (response.status === 404) {
          throw new HttpException(
            `Project not found (ID: ${config.projectId}). Please check project configuration.`,
            HttpStatus.NOT_FOUND,
          );
        }

        throw new HttpException(
          `OpenProject API error: ${response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const workPackage = await response.json();

      this.logger.log(
        `Created work package #${workPackage.id} in project ${config.projectId}`,
      );

      return {
        workPackageId: workPackage.id,
        workPackageUrl: `${config.baseUrl}/work_packages/${workPackage.id}`,
      };
    } catch (error) {
      this.logger.error('Error creating work package:', error);

      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new HttpException(
          'OpenProject API request timeout',
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create work package in OpenProject',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadAttachment(workPackageId: number, file: Express.Multer.File) {
    const config = this.configService.getOpenProjectConfig();

    const formData = await this.fileUploadService.createFormDataWithFiles(
      [file],
      {
        fileName: file.originalname,
      },
    );

    const headers = {
      Authorization: `Basic ${Buffer.from(`apikey:${config.apiKey}`).toString('base64')}`,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.fileUploadService.uploadToExternalService(
      `${config.baseUrl}/api/v3/work_packages/${workPackageId}/attachments`,
      formData,
      headers,
      config.uploadTimeout,
    );
  }

  async uploadAttachments(
    workPackageId: number,
    files: Express.Multer.File[],
  ): Promise<Array<{ id: number; fileName: string; fileSize: number }>> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map((file) =>
      this.uploadAttachment(workPackageId, file),
    );

    try {
      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads: Array<{
        id: number;
        fileName: string;
        fileSize: number;
      }> = [];
      const failedUploads: Array<{ fileName: string; error: string }> = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulUploads.push(result.value);
        } else {
          const fileName = files[index]?.originalname || 'unknown';
          failedUploads.push({
            fileName,
            error: result.reason.message || 'Unknown error',
          });
          this.logger.error(`Failed to upload ${fileName}:`, result.reason);
        }
      });

      // If all uploads failed, throw an error
      if (failedUploads.length > 0 && successfulUploads.length === 0) {
        throw new HttpException(
          {
            message: 'All attachment uploads failed',
            failedUploads,
          },
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Log warning if some uploads failed
      if (failedUploads.length > 0) {
        this.logger.warn(
          `${failedUploads.length} attachment(s) failed to upload`,
        );
      }

      return successfulUploads;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error during attachment upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
