import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentCreateDto } from './assignment-create.dto.js';
import { AssignmentUpdateDto } from './assignment-update.dto.js';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from '../task/task.model.js';
import { User } from '../../users/user/user.model.js';
import { AssignmentState } from './assignment.types.js';
import { Assignment } from './assignment.model.js';
import { TaskValidationService } from '../task-validation/task-validation.service.js';

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    @InjectModel(Assignment)
    private assignmentModel: typeof Assignment,
    @InjectModel(Task)
    private taskModel: typeof Task,
    private taskValidation: TaskValidationService,
  ) {}

  async createAssignment(
    assignment: Omit<
      AssignmentCreateDto,
      'id' | 'createdAt' | 'updatedAt' | 'task' | 'performer'
    >,
  ): Promise<Assignment> {
    this.logger.log(`Creating assignment`);

    if (
      (
        await this.getAssignments({
          taskId: assignment.taskId,
          performerId: assignment.performerId,
        })
      ).length > 0
    ) {
      throw new ConflictException('Assignment already exists');
    }

    try {
      const assignmentModel = await this.assignmentModel.create(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        assignment as any,
      );
      return assignmentModel.toJSON();
    } catch (error) {
      this.logger.error('Failed to create assignment', error.stack);
      throw error;
    }
  }

  async getAssignment(id: string, include?: string[]): Promise<Assignment> {
    const includeOptions = this.buildIncludeOptions(include);

    const assignmentModel = await this.assignmentModel.findByPk(
      id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      includeOptions,
    );
    if (!assignmentModel) {
      throw new NotFoundException('Assignment not found');
    }

    return assignmentModel.toJSON();
  }

  async determineState(assignment: Assignment): Promise<AssignmentState> {
    const taskId = assignment.taskId;
    const userId = assignment.performerId;
    const task = await this.taskModel.findOne({ where: { id: taskId } });
    if (task !== null) {
      console.log('After..dsafasdf', task);
      const passed = await this.taskValidation.validateSuccess(
        userId,
        task.validation,
      );
      return passed ? AssignmentState.Completed : AssignmentState.Pending;
    }
    return AssignmentState.Pending;
  }

  async getAssignments(
    filters: any = {},
    include?: string[],
  ): Promise<Assignment[]> {
    const where: any = {};
    const includeOptions = this.buildIncludeOptions(include);

    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters.performerId) {
      where.performerId = filters.performerId;
    }

    if (filters.state !== undefined) {
      where.state = filters.state;
    }

    const assignmentModels = await this.assignmentModel.findAll({
      where,
      include: includeOptions.include,
    });

    return assignmentModels.map((assignmentModel) => assignmentModel.toJSON());
  }

  async getAssignmentsByTask(
    taskId: string,
    include?: string[],
  ): Promise<Assignment[]> {
    const includeOptions = this.buildIncludeOptions(include);

    const assignmentModels = await this.assignmentModel.findAll({
      where: { taskId },
      include: includeOptions.include,
    });

    return assignmentModels.map((assignmentModel) => assignmentModel.toJSON());
  }

  async getAssignmentsByPerformer(
    performerId: string,
    include?: string[],
  ): Promise<Assignment[]> {
    const includeOptions = this.buildIncludeOptions(include);

    const assignmentModels = await this.assignmentModel.findAll({
      where: { performerId },
      include: includeOptions.include,
    });

    return assignmentModels.map((assignmentModel) => assignmentModel.toJSON());
  }

  async getAssignmentsByState(
    state: AssignmentState,
    include?: string[],
  ): Promise<Assignment[]> {
    const includeOptions = this.buildIncludeOptions(include);

    const assignmentModels = await this.assignmentModel.findAll({
      where: { state },
      include: includeOptions.include,
    });

    return assignmentModels.map((assignmentModel) => assignmentModel.toJSON());
  }

  private buildIncludeOptions(include?: string[]) {
    const includeOptions: any = {
      include: [],
    };

    if (include?.includes('task')) {
      includeOptions.include.push({
        model: Task,
        as: 'task',
      });
    }

    if (include?.includes('performer')) {
      includeOptions.include.push({
        model: User,
        as: 'performer',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return includeOptions;
  }

  async updateAssignment(
    id: string,
    assignment: AssignmentCreateDto,
  ): Promise<Assignment> {
    // First check if assignment exists
    await this.getAssignment(id);

    if (assignment.state === AssignmentState.Completed) {
      assignment.state = await this.determineState(assignment as Assignment);
    }

    try {
      const [affectedCount] = await this.assignmentModel.update(assignment, {
        where: { id },
      });

      if (affectedCount === 0) {
        throw new NotFoundException('Assignment not found');
      }

      return this.getAssignment(id);
    } catch (error) {
      this.logger.error(`Failed to update assignment ${id}`, error.stack);
      throw error;
    }
  }

  async partialUpdateAssignment(
    id: string,
    update: AssignmentUpdateDto,
  ): Promise<Assignment> {
    // First check if assignment exists
    await this.getAssignment(id);

    try {
      const [affectedCount] = await this.assignmentModel.update(update, {
        where: { id },
      });

      if (affectedCount === 0) {
        throw new NotFoundException('Assignment not found');
      }

      return this.getAssignment(id);
    } catch (error) {
      this.logger.error(
        `Failed to partially update assignment ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<{ message: string }> {
    const assignment = await this.getAssignment(id);

    const deleted = await this.assignmentModel.destroy({
      where: { id },
    });

    if (deleted === 0) {
      throw new NotFoundException('Assignment not found');
    }

    return {
      message: `Assignment for task ${assignment.taskId} to performer ${assignment.performerId} deleted successfully`,
    };
  }
}
