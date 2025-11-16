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

    const { coordinates, radius, city, state, country, minimum } = constraints;
    const userLocations =
      await this.locationService.getLocationsByOwner(userId);

    let meetsAllConstraints = true;

    // Check minimum constraint if provided
    if (minimum !== undefined) {
      meetsAllConstraints =
        meetsAllConstraints && userLocations.length >= minimum;
    }

    // Check if we have any location-based constraints to validate against user locations
    const hasLocationConstraints =
      coordinates !== undefined ||
      city !== undefined ||
      state !== undefined ||
      country !== undefined;

    if (hasLocationConstraints && userLocations.length > 0) {
      let hasMatchingLocation = false;

      // Check each user location against the constraints
      for (const location of userLocations) {
        let matchesCurrentLocation = true;

        // Check coordinate radius constraint if provided
        if (coordinates !== undefined && radius !== undefined) {
          matchesCurrentLocation =
            matchesCurrentLocation &&
            areCoordinatesWithinRadius(
              location.coordinates,
              coordinates,
              radius,
            );
        }

        // Check city constraint if provided
        if (city !== undefined) {
          matchesCurrentLocation =
            matchesCurrentLocation &&
            location.city?.toLowerCase() === city.toLowerCase();
        }

        // Check state constraint if provided
        if (state !== undefined) {
          matchesCurrentLocation =
            matchesCurrentLocation &&
            location.state?.toLowerCase() === state.toLowerCase();
        }

        // Check country constraint if provided
        if (country !== undefined) {
          matchesCurrentLocation =
            matchesCurrentLocation &&
            location.country?.toLowerCase() === country.toLowerCase();
        }

        // If this location matches all provided constraints, we're good
        if (matchesCurrentLocation) {
          hasMatchingLocation = true;
          break;
        }
      }

      meetsAllConstraints = meetsAllConstraints && hasMatchingLocation;
    } else if (hasLocationConstraints && userLocations.length === 0) {
      // If we have location constraints but no user locations, validation fails
      meetsAllConstraints = false;
    }

    return meetsAllConstraints;
  }
}
