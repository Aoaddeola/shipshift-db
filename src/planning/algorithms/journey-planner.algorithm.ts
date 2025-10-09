// src/planning/algorithms/journey-planner.algorithm.ts
import { Injectable } from '@nestjs/common';
import { GeoUtils } from '../../common/utils/geo.utils.js';
import { PriorityQueue } from '../../common/utils/priority-queue.js';
import { Journey } from '../../logistics/journey/journey.types.js';
import { Location } from '../../common/location/location.types.js';

interface PriorityQueueItem {
  fScore: number;
  gScore: number;
  locationId: string;
  path: Journey[];
  currentTime: Date;
}

@Injectable()
export class JourneyPlannerAlgorithm {
  constructor(private readonly geoUtils: GeoUtils) {}

  private weightedCost(
    journey: Journey,
    alpha: number = 1.0,
    beta: number = 0.1,
    gamma: number = 0.05,
  ): number {
    const durationHours =
      (new Date(journey.availableTo).getTime() -
        new Date(journey.availableFrom).getTime()) /
      (1000 * 3600);
    const distanceKm = this.geoUtils.haversineDistance(
      journey.fromLocation!.coordinates,
      journey.fromLocation!.coordinates,
    );

    return alpha * journey.price + beta * distanceKm + gamma * durationHours;
  }

  private heuristic(
    currentLoc: Location,
    destination: Location,
    costPerKm: number = 0.5,
  ): number {
    const distanceKm = this.geoUtils.haversineDistance(
      currentLoc.coordinates,
      destination.coordinates,
    );
    return distanceKm * costPerKm;
  }

  private buildGraph(journeys: Journey[]): Map<string, Journey[]> {
    const graph = new Map<string, Journey[]>();

    for (const journey of journeys) {
      const fromId = journey.fromLocation?.id ?? '';
      if (!graph.has(fromId)) {
        graph.set(fromId, []);
      }
      graph.get(fromId)!.push(journey);
    }

    return graph;
  }

  findOptimalJourney(
    journeys: Journey[],
    start: Location,
    end: Location,
    demand: number,
    alpha: number = 1.0,
    beta: number = 0.1,
    gamma: number = 0.05,
  ): { path: Journey[] | null; totalCost: number } {
    const graph = this.buildGraph(journeys);
    const pq = new PriorityQueue<PriorityQueueItem>(
      (a, b) => a.fScore - b.fScore,
    );

    pq.push({
      fScore: 0,
      gScore: 0,
      locationId: start.id,
      path: [],
      currentTime: new Date(0),
    });

    const bestCost = new Map<string, number>();
    bestCost.set(start.id, 0);

    while (!pq.isEmpty()) {
      const { gScore, locationId, path, currentTime } = pq.pop()!;

      if (locationId === end.id) {
        return { path, totalCost: gScore };
      }

      const availableJourneys = graph.get(locationId) || [];

      for (const journey of availableJourneys) {
        if (journey.capacity < demand) continue;
        if (new Date(journey.availableFrom) < currentTime) continue;

        const nextLoc = journey.toLocation!;
        const journeyCost = this.weightedCost(journey, alpha, beta, gamma);
        const newGCost = gScore + journeyCost;

        if (!bestCost.has(nextLoc.id) || newGCost < bestCost.get(nextLoc.id)!) {
          bestCost.set(nextLoc.id, newGCost);

          const hCost = this.heuristic(nextLoc, end);
          const newFCost = newGCost + hCost;

          pq.push({
            fScore: newFCost,
            gScore: newGCost,
            locationId: nextLoc.id,
            path: [...path, journey],
            currentTime: new Date(journey.availableTo),
          });
        }
      }
    }

    return { path: null, totalCost: Number.POSITIVE_INFINITY };
  }
}
