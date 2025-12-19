/* eslint-disable @typescript-eslint/no-unused-vars */
// src/bug-report/bug-report.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFiles,
  UseInterceptors,
  Param,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateBugReportDto, BugReportResponseDto } from './bug-report.dto.js';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { BugReportService } from './bug-report.service.js';

@ApiTags('bug-report')
@Controller('bug-report')
export class BugReportController {
  constructor(private readonly bugReportService: BugReportService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new bug report' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string' },
        description: { type: 'string' },
        stepsToReproduce: { type: 'string', nullable: true },
        expectedBehavior: { type: 'string' },
        actualBehavior: { type: 'string' },
        severity: {
          type: 'string',
          enum: ['low', 'normal', 'high', 'critical'],
        },
        priority: {
          type: 'string',
          enum: ['low', 'normal', 'high', 'immediate'],
        },
        environment: { type: 'string', nullable: true },
        attachments: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: [
        'subject',
        'description',
        'expectedBehavior',
        'actualBehavior',
      ],
    },
  })
  @ApiResponse({ status: 201, type: BugReportResponseDto })
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tempDir = fs.mkdtempSync(os.tmpdir() + '/bug-report-');
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10, // Max 10 files
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              `File type ${file.mimetype} not allowed`,
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
    }),
  )
  async submitBugReport(
    @Body() createBugReportDto: CreateBugReportDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<BugReportResponseDto> {
    try {
      // Read files into memory for OpenProject upload
      const filesWithBuffers = await Promise.all(
        (files || []).map(async (file) => {
          const buffer = await fs.promises.readFile(file.path);
          // Clean up temp file
          await fs.promises.unlink(file.path);

          return {
            ...file,
            buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          };
        }),
      );

      // Clean up temp directory if exists
      if (files && files.length > 0 && files[0].destination) {
        try {
          await fs.promises.rm(files[0].destination, { recursive: true });
        } catch (err) {
          // Ignore cleanup errors
        }
      }

      const result = await this.bugReportService.submitBugReport(
        createBugReportDto,
        filesWithBuffers,
      );

      return result;
    } catch (error) {
      // Cleanup any remaining files
      if (files) {
        for (const file of files) {
          try {
            if (file.path) await fs.promises.unlink(file.path);
          } catch (err) {
            // Ignore cleanup errors
          }
        }
      }
      throw error;
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get bug report service status' })
  async getStatus() {
    return await this.bugReportService.getStatus();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get recent bug reports' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getReports(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return await this.bugReportService.getReports(limit, offset);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get bug report by ID' })
  async getReport(@Param('id') id: string) {
    return await this.bugReportService.getReport(id);
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up old bug reports' })
  @ApiQuery({ name: 'maxAgeHours', required: false, type: Number })
  async cleanup(
    @Query('maxAgeHours', new ParseIntPipe({ optional: true }))
    maxAgeHours?: number,
  ) {
    const deleted = this.bugReportService.cleanupOldReports(maxAgeHours);
    return {
      message: `Cleaned up ${deleted} old bug reports`,
      deletedCount: deleted,
    };
  }
}
