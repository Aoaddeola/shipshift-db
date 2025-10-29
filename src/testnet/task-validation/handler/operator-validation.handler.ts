import { OperatorService } from '../../../users/operator/operator.service.js';
import {
  ValidationHandler,
  Entity,
  EntityConstraintDefinitions,
} from '../task-validation.types.js';

// Create concrete handlers
export class OperatorValidationHandler
  implements ValidationHandler<Entity.Operator>
{
  constructor(private operatorService: OperatorService) {}

  async validate(
    walletAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constraints: Partial<EntityConstraintDefinitions[Entity.Operator]>,
  ): Promise<boolean> {
    try {
      const operator =
        await this.operatorService.getOperatorByAddress(walletAddress);
      return !!operator;
    } catch {
      return false;
    }
  }
}
