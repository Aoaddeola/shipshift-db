import { UserService } from '../../../users/user/user.service.js';
import {
  ValidationHandler,
  Entity,
  EntityConstraintDefinitions,
} from '../task-validation.types.js';

// Create concrete handlers
export class UserValidationHandler implements ValidationHandler<Entity.User> {
  constructor(private userService: UserService) {}

  async validate(
    userId: string,
    constraints: Partial<EntityConstraintDefinitions[Entity.User]>,
  ): Promise<boolean> {
    if (constraints) {
      const user = await this.userService.findById(userId);

      return (
        (constraints.type === undefined ||
          user?.userType === constraints.type) &&
        (constraints.verified === undefined ||
          user?.isVerified === constraints.verified)
      );
    }
    return false;
  }
}
