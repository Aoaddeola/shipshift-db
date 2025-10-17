// src/planning/planning.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { GeoUtils } from '../common/utils/geo.utils.js';
import { JourneyService } from '../logistics/journey/journey.service.js';
import { JourneyPlannerAlgorithm } from './algorithms/journey-planner.algorithm.js';
import { PlanJourneyRequestDto } from './plan-journey-request.dto.js';
import { PlanJourneyResponseDto } from './plan-journey-response.dto.js';
import { LocationService } from '../common/location/location.service.js';
import { JourneyStatus } from '../logistics/journey/journey.types.js';

@Injectable()
export class PlanningService {
  constructor(
    @Inject(JourneyService)
    private readonly journeysService: JourneyService,
    @Inject(LocationService)
    private readonly locationsService: LocationService,
    private readonly journeyPlanner: JourneyPlannerAlgorithm,
    private readonly geoUtils: GeoUtils,
  ) {}

  async planJourney(
    request: PlanJourneyRequestDto,
  ): Promise<PlanJourneyResponseDto> {
    const startLocation = await this.locationsService.getLocation(
      request.startLocationId,
    );
    const endLocation = await this.locationsService.getLocation(
      request.endLocationId,
    );
    console.log('111111111111111111111', startLocation, endLocation);

    if (!startLocation || !endLocation) {
      return new PlanJourneyResponseDto({
        success: false,
        path: null,
        totalCost: 0,
        totalDistance: 0,
        totalPrice: 0,
        totalDurationHours: 0,
        message: 'Start or end location not found',
      });
    }
    console.log('222222222222222222222222', startLocation, endLocation);

    const activeJourneys = await this.journeysService.getJourneysByStatus(
      'available' as JourneyStatus,
    );
    // console.log('3333333333333333333333 activeJourneys', activeJourneys);

    if (activeJourneys.length === 0) {
      return new PlanJourneyResponseDto({
        success: false,
        path: null,
        totalCost: 0,
        totalDistance: 0,
        totalPrice: 0,
        totalDurationHours: 0,
        message: 'No active journeys available',
      });
    }

    const { path, totalCost } = this.journeyPlanner.findOptimalJourney(
      activeJourneys,
      startLocation,
      endLocation,
      request.demand,
      request.alpha,
      request.beta,
      request.gamma,
    );
    console.log('4444444444444444444444', path, totalCost);

    if (!path) {
      return new PlanJourneyResponseDto({
        success: false,
        path: null,
        totalCost,
        totalDistance: 0,
        totalPrice: 0,
        totalDurationHours: 0,
        message: 'No valid path found for the given constraints',
      });
    }

    const totalDistance = path.reduce(
      (sum, journey) =>
        sum +
        this.geoUtils.haversineDistance(
          journey.fromLocation!.coordinates,
          journey.toLocation!.coordinates,
        ),
      0,
    );

    const totalPrice = path.reduce((sum, journey) => sum + journey.price, 0);

    let totalDurationHours = 0;
    if (path.length > 0) {
      const firstStart = new Date(path[0].availableFrom);
      const lastEnd = new Date(path[path.length - 1].availableTo);
      totalDurationHours =
        (lastEnd.getTime() - firstStart.getTime()) / (1000 * 3600);
    }

    return new PlanJourneyResponseDto({
      success: true,
      path,
      totalCost: this.round(totalCost, 2),
      totalDistance: this.round(totalDistance, 2),
      totalPrice: this.round(totalPrice, 2),
      totalDurationHours: this.round(totalDurationHours, 2),
      message: 'Optimal journey path found',
    });
  }

  private round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
