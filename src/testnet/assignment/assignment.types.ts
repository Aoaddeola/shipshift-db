import { Task } from '../task/task.types.js';
import { User } from '../../users/user/user.types.js';

/**
 * Assignment State Enum (numeric)
 */
export enum AssignmentState {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

/**
 * Assignment Interface
 */
export interface Assignment {
  id: string;
  taskId: string;
  performerId: string;
  state: AssignmentState;
  task?: Task;
  performer?: User;
  createdAt?: Date;
  updatedAt?: Date;
}
