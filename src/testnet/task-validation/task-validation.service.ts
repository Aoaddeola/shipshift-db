import { Injectable, Logger } from '@nestjs/common';
import { TaskValidation, Entity } from './task-validation.types.js';
import { LocationService } from '../../common/location/location.service.js';
import { JourneyService } from '../../logistics/journey/journey.service.js';
import { ShipmentService } from '../../logistics/shipment/shipment.service.js';
import { StepService } from '../../onchain/step/step.service.js';
import { JourneyValidationHandler } from '../../testnet/task-validation/handler/journey-validation.handler.js';
import { LocationValidationHandler } from '../../testnet/task-validation/handler/location-validation.handler.js';
import { OperatorValidationHandler } from '../../testnet/task-validation/handler/operator-validation.handler.js';
import { ShipmentValidationHandler } from '../../testnet/task-validation/handler/shipment-validation.handler.js';
import { StepValidationHandler } from '../../testnet/task-validation/handler/step-validation.handler.js';
import { UserValidationHandler } from '../../testnet/task-validation/handler/user-validation.handler.js';
import { ValidationRegistry } from '../../testnet/task-validation/task-validation.registry.js';
import { OperatorService } from '../../users/operator/operator.service.js';
import { UserService } from '../../users/user/user.service.js';

@Injectable()
export class TaskValidationService {
  private readonly logger = new Logger(TaskValidationService.name);
  private registry = new ValidationRegistry();

  constructor(
    private userService: UserService,
    private locationService: LocationService,
    private journeyService: JourneyService,
    private operatorService: OperatorService,
    private stepService: StepService,
    private shipmentService: ShipmentService,
  ) {
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.registry.register(
      Entity.Journey,
      new JourneyValidationHandler(this.journeyService),
    );
    this.registry.register(
      Entity.Location,
      new LocationValidationHandler(this.locationService),
    );
    this.registry.register(
      Entity.Step,
      new StepValidationHandler(this.stepService),
    );
    this.registry.register(
      Entity.User,
      new UserValidationHandler(this.userService),
    );
    this.registry.register(
      Entity.Operator,
      new OperatorValidationHandler(this.operatorService),
    );
    this.registry.register(
      Entity.Shipment,
      new ShipmentValidationHandler(this.shipmentService),
    );
  }

  async validateSuccess<T extends Entity>(
    userId: string,
    taskValidation: TaskValidation<T>,
  ): Promise<boolean> {
    const { entity, constraints } = taskValidation;
    const handler = this.registry.getHandler(entity);
    return handler.validate(userId, constraints);
  }
}
