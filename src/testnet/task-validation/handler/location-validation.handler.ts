import { areCoordinatesWithinRadius } from '../../../common/utils/geo.utils.js';
import { LocationService } from '../../../common/location/location.service.js';
import {
  ValidationHandler,
  Entity,
  EntityConstraintDefinitions,
} from '../task-validation.types.js';

// Create concrete handlers
export class LocationValidationHandler
  implements ValidationHandler<Entity.Location>
{
  constructor(private locationService: LocationService) {}

  async validate(
    userId: string,
    constraints: Partial<EntityConstraintDefinitions[Entity.Location]>,
  ): Promise<boolean> {
    if (Object.values(constraints).length === 0) {
      return false;
    }

    const { coordinates, radius, minimum } = constraints;
    const userLocations =
      await this.locationService.getLocationsByOwner(userId);

    let meetsAllConstraints = true;

    // Check minimum constraint if provided
    if (minimum !== undefined) {
      meetsAllConstraints =
        meetsAllConstraints && userLocations.length >= minimum;
    }

    // Check radius constraint if both coordinates and radius are provided
    if (coordinates !== undefined && radius !== undefined) {
      meetsAllConstraints =
        meetsAllConstraints &&
        userLocations.some((location) =>
          areCoordinatesWithinRadius(location.coordinates, coordinates, radius),
        );
    }

    return meetsAllConstraints;
  }
}
