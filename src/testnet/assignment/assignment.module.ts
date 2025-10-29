import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AssignmentController } from './assignment.controller.js';
import { AssignmentService } from './assignment.service.js';
import { Assignment } from './assignment.model.js';
import { Task } from '../task/task.model.js';
import { User } from '../../users/user/user.model.js';
import { JwtModule } from '@nestjs/jwt';
import { TaskValidationModule } from '../task-validation/task-validation.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([Assignment, Task, User]),
    JwtModule,
    TaskValidationModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
