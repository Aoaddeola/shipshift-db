import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service.js';
import { AssignmentCreateDto } from './assignment-create.dto.js';
import { AssignmentUpdateDto } from './assignment-update.dto.js';
import { Assignment, AssignmentState } from './assignment.types.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  async createAssignment(
    @Body()
    assignment: Omit<
      Assignment,
      'id' | 'createdAt' | 'updatedAt' | 'task' | 'performer'
    >,
  ) {
    return this.assignmentService.createAssignment(assignment);
  }

  @Get(':id')
  async getAssignment(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.assignmentService.getAssignment(id, includeArray);
  }

  @Get()
  async getAssignments(
    @Query('taskId') taskId?: string,
    @Query('performerId') performerId?: string,
    @Query('state') state?: AssignmentState,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const filters: any = {};

    if (taskId) filters.taskId = taskId;
    if (performerId) filters.performerId = performerId;
    if (state !== undefined) filters.state = state;

    return this.assignmentService.getAssignments(filters, includeArray);
  }

  @Get('task/:taskId')
  async getAssignmentsByTask(
    @Param('taskId') taskId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.assignmentService.getAssignmentsByTask(taskId, includeArray);
  }

  @Get('performer/:performerId')
  async getAssignmentsByPerformer(
    @Param('performerId') performerId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.assignmentService.getAssignmentsByPerformer(
      performerId,
      includeArray,
    );
  }

  @Get('state/:state')
  async getAssignmentsByState(
    @Param('state') state: AssignmentState,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.assignmentService.getAssignmentsByState(state, includeArray);
  }

  @Put(':id')
  async updateAssignment(
    @Param('id') id: string,
    @Body() assignment: AssignmentCreateDto,
  ) {
    return this.assignmentService.updateAssignment(id, assignment);
  }

  @Patch(':id')
  async partialUpdateAssignment(
    @Param('id') id: string,
    @Body() update: AssignmentUpdateDto,
  ) {
    return this.assignmentService.partialUpdateAssignment(id, update);
  }

  @Delete(':id')
  async deleteAssignment(@Param('id') id: string) {
    return this.assignmentService.deleteAssignment(id);
  }
}
