import { Step } from '../../../onchain/step/step.types.js';
import { StepService } from '../../../onchain/step/step.service.js';
import {
  ValidationHandler,
  Entity,
  EntityConstraintDefinitions,
} from '../task-validation.types.js';

// Create concrete handlers
export class StepValidationHandler implements ValidationHandler<Entity.Step> {
  constructor(private stepService: StepService) {}

  async validate(
    userId: string,
    constraints: Partial<EntityConstraintDefinitions[Entity.Step]>,
  ): Promise<boolean> {
    // If no constraints provided, return false (matching original behavior)
    if (Object.keys(constraints).length === 0) {
      return false;
    }

    const { state, recipientId, senderId, agentId, operatorId, minimum } =
      constraints;

    // Determine which data source to use based on the most specific constraint
    let userSteps: Step[];
    if (recipientId) {
      userSteps = await this.stepService.getStepsByRecipient(userId);
    } else if (senderId) {
      userSteps = await this.stepService.getStepsBySender(userId);
    } else if (operatorId) {
      userSteps = await this.stepService.getStepsByOperator(userId);
    } else {
      userSteps = await this.stepService.getStepsByAgent(userId);
    }

    // Check all constraints against the fetched steps
    return (
      (minimum === undefined || userSteps.length >= minimum) &&
      userSteps.some(
        (step) =>
          (state === undefined || step.state === state) &&
          (recipientId === undefined || step.recipientId === recipientId) &&
          (senderId === undefined || step.senderId === senderId) &&
          (agentId === undefined || step.agentId === agentId),
      )
    );
  }
}
