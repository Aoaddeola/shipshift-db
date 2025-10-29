import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';
import { Task } from './task.model.js';
import { Assignment } from '../assignment/assignment.model.js';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../../users/user/user.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([Task, Assignment]),
    JwtModule,
    UserModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
