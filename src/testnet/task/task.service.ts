import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TaskCreateDto } from './task-create.dto.js';
import { TaskUpdateDto } from './task-update.dto.js';
import { Task } from './task.model.js';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Assignment } from '../assignment/assignment.model.js';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
  ) {}

  async createTask(
    task: Pick<Task, 'description' | 'goal' | 'reward'> & {
      validation?: any; // Adjust type based on your validation structure
    },
  ): Promise<Task> {
    this.logger.log(`Creating task`);

    try {
      // Use 'as any' to bypass TypeScript strict checking for create
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const taskModel = await this.taskModel.create(task as any);
      return taskModel.toJSON();
    } catch (error) {
      this.logger.error('Failed to create task', error.stack);
      throw error;
    }
  }

  async getTask(id: string, include?: string[]): Promise<Task> {
    const includeOptions = this.buildIncludeOptions(include);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const taskModel = await this.taskModel.findByPk(id, includeOptions);
    if (!taskModel) {
      throw new NotFoundException('Task not found');
    }

    return taskModel.toJSON();
  }

  async getTasks(filters: any = {}, include?: string[]): Promise<Task[]> {
    const where: any = {};
    const includeOptions = this.buildIncludeOptions(include);

    if (filters.minReward !== undefined) {
      where.reward = { [Op.gte]: filters.minReward };
    }

    if (filters.maxReward !== undefined) {
      where.reward = {
        ...where.reward,
        [Op.lte]: filters.maxReward,
      };
    }

    const taskModels = await this.taskModel.findAll({
      where,
      include: includeOptions.include,
    });

    return taskModels.map((taskModel) => taskModel.toJSON());
  }

  async getTasksByReward(reward: number, include?: string[]): Promise<Task[]> {
    const includeOptions = this.buildIncludeOptions(include);

    const taskModels = await this.taskModel.findAll({
      where: { reward },
      include: includeOptions.include,
    });

    return taskModels.map((taskModel) => taskModel.toJSON());
  }

  private buildIncludeOptions(include?: string[]) {
    const includeOptions: any = {
      include: [],
    };

    if (include?.includes('assignments')) {
      includeOptions.include.push({
        model: Assignment,
        as: 'assignments',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return includeOptions;
  }

  async updateTask(id: string, task: TaskCreateDto): Promise<Task> {
    // First check if task exists
    await this.getTask(id);

    try {
      const [affectedCount] = await this.taskModel.update(task, {
        where: { id },
      });

      if (affectedCount === 0) {
        throw new NotFoundException('Task not found');
      }

      return this.getTask(id);
    } catch (error) {
      this.logger.error(`Failed to update task ${id}`, error.stack);
      throw error;
    }
  }

  async partialUpdateTask(id: string, update: TaskUpdateDto): Promise<Task> {
    // First check if task exists
    await this.getTask(id);

    try {
      const [affectedCount] = await this.taskModel.update(update, {
        where: { id },
      });

      if (affectedCount === 0) {
        throw new NotFoundException('Task not found');
      }

      return this.getTask(id);
    } catch (error) {
      this.logger.error(`Failed to partially update task ${id}`, error.stack);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    const task = await this.getTask(id);

    const deleted = await this.taskModel.destroy({
      where: { id },
    });

    if (deleted === 0) {
      throw new NotFoundException('Task not found');
    }

    return {
      message: `Task "${task.description}" with reward ${task.reward} deleted successfully`,
    };
  }
}
