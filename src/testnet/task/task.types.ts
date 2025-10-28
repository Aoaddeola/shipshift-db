import { TaskValidation } from '../task-validation/task-validation.types.js';

/**
 * Task Interface
 */
export interface Task {
  id: string;
  description: string;
  goal: string;
  reward: number;
  validation: TaskValidation;
  createdAt?: Date;
  updatedAt?: Date;
}
