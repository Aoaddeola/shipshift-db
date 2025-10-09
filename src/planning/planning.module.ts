// src/planning/planning.module.ts
import { Module } from '@nestjs/common';
import { LocationModule } from '../common/location/location.module.js';
import { GeoUtils } from '../common/utils/geo.utils.js';
import { JourneyModule } from '../logistics/journey/journey.module.js';
import { JourneyPlannerAlgorithm } from './algorithms/journey-planner.algorithm.js';
import { PlanningController } from './planning.controller.js';
import { PlanningService } from './planning.service.js';

@Module({
  imports: [JourneyModule, LocationModule],
  controllers: [PlanningController],
  providers: [PlanningService, JourneyPlannerAlgorithm, GeoUtils],
})
export class PlanningModule {}
