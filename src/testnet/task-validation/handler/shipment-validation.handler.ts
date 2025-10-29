import { ShipmentService } from '../../../logistics/shipment/shipment.service.js';
import {
  ValidationHandler,
  Entity,
  EntityConstraintDefinitions,
} from '../task-validation.types.js';

// Create concrete handlers
export class ShipmentValidationHandler
  implements ValidationHandler<Entity.Shipment>
{
  constructor(private shipmentService: ShipmentService) {}

  async validate(
    userId: string,
    constraints: Partial<EntityConstraintDefinitions[Entity.Shipment]>,
  ): Promise<boolean> {
    const { senderId, minimum } = constraints;

    if (senderId) {
      const shipments = await this.shipmentService.getShipmentsBySender(userId);
      return senderId === userId && (!minimum || shipments.length >= minimum);
    }
    return false;
  }
}
