import { Logger } from '@nestjs/common';
import { StepState } from '../../onchain/step/step.types.js';
import { ShipmentStatus } from './shipment.types.js';

/**
 * Enhanced shipment state manager with proper type safety
 */
export class ShipmentManager {
  private readonly logger = new Logger(ShipmentManager.name);
  private steps: Map<number, StepState> = new Map();
  private totalSteps: number;

  constructor(
    totalSteps: number,
    initialStates: { index: number; state: StepState }[] = [],
  ) {
    this.totalSteps = totalSteps;
    initialStates.forEach(({ index, state }) => {
      this.steps.set(index, state);
    });
  }

  /**
   * Updates a specific step and returns the overall status
   */
  updateStep(stepIndex: number, newState: StepState): ShipmentStatus {
    this.logger.log(
      `Updating step ${stepIndex} to state ${StepState[newState]}`,
    );
    if (stepIndex < 0 || stepIndex >= this.totalSteps) {
      throw new Error(`Step index ${stepIndex} is out of bounds`);
    }

    this.steps.set(stepIndex, newState);
    return this.calculateOverallStatus();
  }

  /**
   * Calculates overall status based on step positions and states
   */
  public calculateOverallStatus(): ShipmentStatus {
    this.logger.log(
      'Calculating overall shipment status for a total of ' +
        this.totalSteps +
        ' steps.',
    );
    if (this.totalSteps === 0) {
      return ShipmentStatus.PENDING;
    }

    // Check for terminal states first (highest priority)
    for (let i = 0; i < this.totalSteps; i++) {
      const state = this.steps.get(i);

      if (state === StepState.CANCELLED || state === StepState.REFUNDED) {
        return ShipmentStatus.ABORTED;
      }
      if (state === StepState.REJECTED) {
        return ShipmentStatus.FAILED;
      }
    }

    // Count completed steps and track progress
    let completedCount = 0;
    let hasActiveStep = false;
    let hasInitializedStep = false;

    for (let i = 0; i < this.totalSteps; i++) {
      const state = this.steps.get(i);

      // Handle undefined state (step not started)
      if (state === undefined) {
        // If this is the first step and it's not started, shipment is pending
        if (i === 0) {
          return ShipmentStatus.PENDING;
        }
        continue;
      }

      // Track step completion
      if (this.isCompletedState(state)) {
        completedCount++;
      }

      // Track active steps
      if (this.isActiveState(state)) {
        hasActiveStep = true;
      }

      // Track initialization
      if (state !== StepState.PENDING && state !== StepState.ACCEPTED) {
        hasInitializedStep = true;
      }
    }

    // Progress-based status determination
    if (completedCount === this.totalSteps) {
      return ShipmentStatus.DELIVERED;
    } else if (completedCount > 0 || hasActiveStep) {
      return ShipmentStatus.IN_TRANSIT;
    }

    return hasInitializedStep
      ? ShipmentStatus.INITIALIZED
      : ShipmentStatus.PENDING;
  }

  /**
   * Type-safe check for active states
   */
  private isActiveState(state: StepState): boolean {
    return [
      StepState.PICKED_UP,
      StepState.DROPPED_OFF,
      StepState.COMMENCED,
      StepState.DELEGATED,
    ].includes(state);
  }

  /**
   * Type-safe check if a step is in terminal state
   */
  private isTerminalStepState(state: StepState): boolean {
    return [
      StepState.CANCELLED,
      StepState.REJECTED,
      StepState.REFUNDED,
      StepState.ACCEPTED,
    ].includes(state);
  }

  /**
   * Type-safe check if a step is completed
   */
  private isCompletedState(state: StepState): boolean {
    return (
      state === StepState.COMPLETED ||
      state === StepState.FULFILLED ||
      state === StepState.CLAIMED
    );
  }

  /**
   * Gets the current progress (0-100%)
   */
  getProgress(): number {
    let completed = 0;
    for (let i = 0; i < this.totalSteps; i++) {
      const state = this.steps.get(i);
      if (state !== undefined && this.isCompletedState(state)) {
        completed++;
      }
    }
    return (completed / this.totalSteps) * 100;
  }

  /**
   * Gets the current step that's being processed (type-safe)
   */
  getCurrentStepIndex(): number {
    for (let i = 0; i < this.totalSteps; i++) {
      const state = this.steps.get(i);

      // Handle undefined state
      if (state === undefined) {
        return i;
      }

      // Check if step is not yet processing
      if (
        state === StepState.PENDING ||
        state === StepState.INITIALIZED ||
        this.isTerminalStepState(state)
      ) {
        return i;
      }
    }
    return this.totalSteps; // All steps completed or in active states
  }

  /**
   * Gets step state safely
   */
  getStepState(stepIndex: number): StepState | undefined {
    return this.steps.get(stepIndex);
  }

  /**
   * Checks if all steps are completed
   */
  isFullyCompleted(): boolean {
    for (let i = 0; i < this.totalSteps; i++) {
      const state = this.steps.get(i);
      if (!state || !this.isCompletedState(state)) {
        return false;
      }
    }
    return true;
  }
}
