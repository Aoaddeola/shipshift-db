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
  expiryDate: Date; // Date is ISO8281 string
  createdAt?: Date;
  updatedAt?: Date;
}
