/* eslint-disable @typescript-eslint/no-unsafe-return */
// notification.orbitdb.service.ts
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDatabase } from '../db/orbitdb/inject-database.decorator.js';
import { Database } from '../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { MessageBusService } from '../shared/rabbitmq/rabbitmq.service.js';
import { allNotificationTemplates } from './notification-template.config.js';
import { NotificationTemplateEntity } from './notification-template.types.js';

@Injectable()
export class NotificationTemplateService implements OnModuleInit {
  private readonly logger = new Logger(NotificationTemplateService.name);
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    @InjectDatabase('notification-template')
    private templateDatabase: Database<NotificationTemplateEntity>,

    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  async onModuleInit() {
    // Wait a bit for databases to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await this.initializeDefaultTemplates();

      this.logger.log('OrbitDB Notification service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize notification service:', error);
    }
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // ==================== TEMPLATE METHODS ====================

  async mapEventToTemplate(): Promise<number> {
    return 0;
  }

  async getTemplateForEvent(
    event: string,
    locale: string = 'en',
  ): Promise<NotificationTemplateEntity | null> {
    if (!this.templateDatabase) {
      return null;
    }

    try {
      const allTemplates = await this.templateDatabase.all();

      // First priority: exact match for event and locale
      let template = allTemplates.find(
        (t) => t.templateId === event && t.language === locale && t.isActive,
      );

      // Second priority: event match with any locale
      if (!template) {
        template = allTemplates.find(
          (t) => t.templateId === event && t.isActive,
        );
      }

      // Third priority: generic template for locale
      if (!template) {
        template = allTemplates.find(
          (t) =>
            t.templateId === 'generic' && t.language === locale && t.isActive,
        );
      }

      // Fourth priority: any generic template
      if (!template) {
        template = allTemplates.find(
          (t) => t.templateId === 'generic' && t.isActive,
        );
      }

      return template || null;
    } catch (error) {
      this.logger.error('Failed to get template:', error);
      return null;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.templateDatabase.del(id);
    this.logger.log(`Deleted template ${id} successfully`);
  }

  async updateTemplate(template: NotificationTemplateEntity): Promise<void> {
    await this.templateDatabase.put(template);
    this.logger.log(`Updated template ${template.id} successfully`);
  }

  async getTemplates(filters?: {
    isActive?: boolean;
    language?: string;
    templateId?: string;
  }): Promise<NotificationTemplateEntity[]> {
    if (!this.templateDatabase) {
      throw new Error('Template database not initialized');
    }

    const allTemplates = await this.templateDatabase.all();

    if (!filters) return allTemplates;

    return allTemplates.filter((template) => {
      if (
        filters.isActive !== undefined &&
        template.isActive !== filters.isActive
      )
        return false;
      if (filters.language && template.language !== filters.language)
        return false;
      if (filters.templateId && template.templateId !== filters.templateId)
        return false;
      return true;
    });
  }

  // ==================== INITIALIZATION ====================

  async initializeDefaultTemplates(): Promise<void> {
    if (!this.templateDatabase) {
      this.logger.warn('Template database not ready, skipping initialization');
      return;
    }

    try {
      const existingTemplates = await this.getTemplates();

      if (existingTemplates.length === 0) {
        this.logger.log('Initializing default notification templates');

        const defaultTemplates: Array<
          Omit<NotificationTemplateEntity, 'id' | 'createdAt' | 'updatedAt'>
        > = allNotificationTemplates;

        for (const template of defaultTemplates) {
          await this.createTemplate(template);
        }

        this.logger.log(`Created ${defaultTemplates.length} default templates`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize default templates:', error);
    }
  }

  async getTemplateByTemplateId(
    templateId: string,
  ): Promise<NotificationTemplateEntity | null> {
    if (!this.templateDatabase) {
      return null;
    }

    const allTemplates = await this.templateDatabase.all();
    return allTemplates.find((t) => t.templateId === templateId) || null;
  }

  // Update the createTemplate method to check for duplicates:

  async createTemplate(
    template: Omit<
      NotificationTemplateEntity,
      'id' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<NotificationTemplateEntity> {
    if (!this.templateDatabase) {
      throw new Error('Template database not initialized');
    }

    // Check for duplicate templateId
    const existingTemplate = await this.getTemplateByTemplateId(
      template.templateId,
    );

    if (existingTemplate) {
      throw new Error(
        `Template with templateId '${template.templateId}' already exists`,
      );
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const newTemplate: NotificationTemplateEntity = {
      id,
      createdAt: now,
      updatedAt: now,
      ...template,
    };

    await this.templateDatabase.put(newTemplate);

    this.logger.log(`Created new template: ${template.templateId} (${id})`);
    return newTemplate;
  }
}
