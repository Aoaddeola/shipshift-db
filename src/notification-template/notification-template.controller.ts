/* eslint-disable @typescript-eslint/no-unsafe-argument */
// notification.orbitdb.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Delete,
  Put,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationTemplateService } from './notification-template.service.js';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './notification-template.dto.js';
import { JwtNodeOpAuthGuard } from '../guards/jwt-nodeOp-auth.guard.js';
import { JwtAdminAuthGuard } from '../guards/jwt-admin-auth.guard.js';

@ApiTags('notification-templates')
@Controller('notification-templates')
export class NotificationTemplateController {
  constructor(
    private readonly notificationService: NotificationTemplateService,
  ) {}

  @UseGuards(JwtAdminAuthGuard) // Uncomment if you want to add authentication
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: CreateNotificationTemplateDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  async createTemplate(
    @Body() createTemplateDto: CreateNotificationTemplateDto,
  ) {
    const template =
      await this.notificationService.createTemplate(createTemplateDto);

    return {
      status: 'success',
      message: 'Template created successfully',
      data: template,
      timestamp: new Date().toISOString(),
    };
  }

  // You can also add update and delete endpoints:

  @UseGuards(JwtAdminAuthGuard)
  @Put(':templateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing notification template' })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    type: CreateNotificationTemplateDto,
  })
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() updateTemplateDto: UpdateNotificationTemplateDto,
  ) {
    // Note: You'll need to implement this method in the service
    // For now, we'll create a new template with updated data
    // You might want to implement a proper update method
    const existingTemplate = await this.notificationService
      .getTemplates({ templateId })
      .then((templates) => templates.find((t) => t.templateId === templateId));

    if (!existingTemplate) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    if (
      existingTemplate.isSystemTemplate &&
      [...new Set(existingTemplate.variables)].every((item) =>
        new Set(existingTemplate.variables).has(item),
      ) === false
      // (new Set(existingTemplate.variables)).has()
    ) {
      throw new BadRequestException(
        'You cannot modify the variables of a template',
      );
    }

    const updatedTemplateData = {
      ...existingTemplate,
      ...updateTemplateDto,
      updatedAt: new Date().toISOString(),
    };

    // Delete old template and create new one
    await this.notificationService.updateTemplate(updatedTemplateData);

    return {
      status: 'success',
      message: 'Template updated successfully',
      data: updatedTemplateData,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtNodeOpAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(@Param('id') id: string) {
    const template = await this.notificationService
      .getTemplates()
      .then((templates) => templates.find((t) => t.id === id));

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    // Prevent deletion of system templates
    if (template.isSystemTemplate) {
      throw new BadRequestException('Cannot delete system templates');
    }

    await this.notificationService.deleteTemplate(id);
  }

  // Update the existing getTemplates endpoint:

  @Get('templates')
  @ApiOperation({ summary: 'Get notification templates' })
  async getTemplates(
    @Query('active') active: string = 'true',
    @Query('language') language?: string,
    @Query('templateId') templateId?: string,
    @Query('system') system?: string,
  ) {
    // const templatess = await this.notificationService.getTemplates();
    // await Promise.all(
    //   templatess.map(
    //     async (t) => await this.notificationService.deleteTemplate(t.id),
    //   ),
    // );
    const filters: any = {};

    if (active !== undefined) {
      filters.isActive = active === 'true';
    }

    if (language) {
      filters.language = language;
    }

    if (templateId) {
      filters.templateId = templateId;
    }

    if (system !== undefined) {
      // You might need to add this filter to your service method
    }

    const templates = await this.notificationService.getTemplates(filters);

    return {
      status: 'success',
      data: templates,
      count: templates.length,
      timestamp: new Date().toISOString(),
    };
  }
}
