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
import { TaskService } from './task.service.js';
import { TaskCreateDto } from './task-create.dto.js';
import { TaskUpdateDto } from './task-update.dto.js';
import { Task } from './task.model.js';
import { JwtAdminAuthGuard } from '../../guards/jwt-admin-auth.guard.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post()
  async createTask(@Body() task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.taskService.createTask(task);
  }

  @Get(':id')
  async getTask(@Param('id') id: string, @Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.taskService.getTask(id, includeArray);
  }

  @Get()
  async getTasks(
    @Query('minReward') minReward?: number,
    @Query('maxReward') maxReward?: number,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const filters: any = {};

    if (minReward !== undefined) filters.minReward = minReward;
    if (maxReward !== undefined) filters.maxReward = maxReward;

    return this.taskService.getTasks(filters, includeArray);
  }

  @Get('reward/:reward')
  async getTasksByReward(
    @Param('reward') reward: number,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.taskService.getTasksByReward(reward, includeArray);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() task: TaskCreateDto) {
    return this.taskService.updateTask(id, task);
  }

  @Patch(':id')
  async partialUpdateTask(
    @Param('id') id: string,
    @Body() update: TaskUpdateDto,
  ) {
    return this.taskService.partialUpdateTask(id, update);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }
}
