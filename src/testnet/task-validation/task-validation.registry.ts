import {
  ValidationHandler,
  EntityConstraintDefinitions,
  Entity,
} from './task-validation.types.js';

// Validation registry that maps entities to handlers
export class ValidationRegistry<
  T extends
    keyof EntityConstraintDefinitions = keyof EntityConstraintDefinitions,
> {
  private handlers = new Map<Entity, ValidationHandler<T>>();

  register(entity: T, handler: ValidationHandler<T>): void {
    this.handlers.set(entity, handler);
  }

  getHandler(entity: T): ValidationHandler<T> {
    const handler = this.handlers.get(entity);
    if (!handler) {
      throw new Error(`No validation handler for entity: ${entity}`);
    }
    return handler;
  }
}
