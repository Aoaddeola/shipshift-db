import { JourneyService } from '../../../logistics/journey/journey.service.js';
import {
  ValidationHandler,
  Entity,
  EntityConstraintDefinitions,
} from '../task-validation.types.js';

// Create concrete handlers
export class JourneyValidationHandler
  implements ValidationHandler<Entity.Journey>
{
  constructor(private journeyService: JourneyService) {}

  async validate(
    userId: string,
    constraints: Partial<EntityConstraintDefinitions[Entity.Journey]>,
  ): Promise<boolean> {
    const userJourneys = await this.journeyService.getJourneysByAgent(userId);

    // Check minimum constraint if present
    if (
      constraints.minimum !== undefined &&
      userJourneys.length < constraints.minimum
    ) {
      return false;
    }

    // Check parcel constraint if present
    if (constraints.parcel) {
      const { fragile, perishable, sealed, size, weight } = constraints.parcel;

      return userJourneys.some((journey) => {
        const parcelInfo = journey.parcelHandlingInfo;

        return (
          fragile === parcelInfo.fragile &&
          perishable === parcelInfo.perishable &&
          sealed === parcelInfo.sealed &&
          (size === undefined || (parcelInfo.size ?? 0) >= size) &&
          (weight === undefined || (parcelInfo.weight ?? 0) >= weight)
        );
      });
    }

    return constraints.minimum === undefined ? false : true;
  }
}
