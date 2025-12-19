// src/bug-report/bug-report-config.service.ts
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service.js';

export interface OpenProjectConfig {
  baseUrl: string;
  apiKey: string;
  projectId: string;
  typeId: string;
  statusId: string;
  severityFieldId: string;
  priorityMapping: Record<string, string>;
  maxFileSize: number;
  maxFiles: number;
  uploadTimeout: number;
}

@Injectable()
export class BugReportConfigService {
  constructor(private appConfigService: AppConfigService) {}

  getFrontendUrl(): string {
    return this.appConfigService.frontendUrl;
  }

  getAppName(): string {
    return this.appConfigService.appName;
  }

  getOpenProjectConfig(): OpenProjectConfig {
    return {
      baseUrl: this.appConfigService.openProjectUrl,
      apiKey: this.appConfigService.openProjectApiKey,
      projectId: this.appConfigService.openProjectProjectId,
      typeId: this.appConfigService.openProjectTypeId,
      statusId: this.appConfigService.openProjectStatusId,
      severityFieldId: this.appConfigService.openProjectSeverityFieldId,
      priorityMapping: this.appConfigService.openProjectPriorityMapping,
      maxFileSize: this.appConfigService.openProjectMaxFileSize,
      maxFiles: this.appConfigService.openProjectMaxFiles,
      uploadTimeout: this.appConfigService.openProjectUploadTimeout,
    };
  }

  validateConfig(): { isValid: boolean; missingFields: string[] } {
    return this.appConfigService.validateOpenProjectConfig();
  }

  isEnabled(): boolean {
    return this.appConfigService.openProjectEnabled;
  }

  // Helper method to check if we should use custom fields
  useCustomFields(): boolean {
    return !!this.appConfigService.openProjectSeverityFieldId;
  }

  // Get priority ID from mapping
  getPriorityId(priority: string): string {
    const mapping = this.appConfigService.openProjectPriorityMapping;
    return mapping[priority] || mapping.normal || '4';
  }
}
