import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Task } from '../task/task.model.js';
import { User } from '../../users/user/user.model.js';
import { AssignmentState } from './assignment.types.js';

@Table({
  tableName: 'assignments',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class Assignment extends Model<Assignment> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Task)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'taskId',
  })
  declare taskId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'performerId',
  })
  declare performerId: string;

  @Column({
    type: DataType.ENUM(...Object.values(AssignmentState)),
    allowNull: false,
    defaultValue: AssignmentState.Pending.toString(),
    field: 'state',
  })
  declare state: AssignmentState;

  @Column({
    type: DataType.DATE,
    field: 'createdAt',
  })
  declare createdAt?: Date;

  @Column({
    type: DataType.DATE,
    field: 'updatedAt',
  })
  declare updatedAt?: Date;

  // // Associations
  // @BelongsTo(() => Task)
  // declare task?: Task;

  @BelongsTo(() => User)
  declare performer?: User;
}
