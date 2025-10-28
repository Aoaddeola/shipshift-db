import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Assignment } from '../assignment/assignment.model.js';
import { EntityConstraintDefinitions } from '../task-validation/task-validation.types.js';

@Table({
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class Task extends Model<Task> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare goal: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare reward: number;

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

  // Associations
  @HasMany(() => Assignment)
  declare assignments?: Assignment[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  validation: {
    id: string;
    taskId: string;
    entity: keyof EntityConstraintDefinitions;
    constraints: Partial<
      EntityConstraintDefinitions[keyof EntityConstraintDefinitions]
    >;
    createdAt?: string;
    updatedAt?: string;
  };
}
