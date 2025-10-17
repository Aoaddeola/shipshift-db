// src/planning/algorithms/journey-planner.algorithm.ts
import { Injectable } from '@nestjs/common';
import { GeoUtils } from '../../common/utils/geo.utils.js';
import { PriorityQueue } from '../../common/utils/priority-queue.js';
import { Journey } from '../../logistics/journey/journey.types.js';
import { Location } from '../../common/location/location.types.js';

interface PriorityQueueItem {
  fScore: number;
  gScore: number;
  location: Location; // Store actual location, not just ID
  path: Journey[];
  currentTime: Date;
}

interface LocationCluster {
  centroid: Location;
  locations: Location[];
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
      journey.toLocation!.coordinates,
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

  /**
   * Group locations by geographical proximity
   */
  private clusterLocations(
    locations: Location[],
    clusterRadiusKm: number = 2,
  ): LocationCluster[] {
    const clusters: LocationCluster[] = [];
    const visited = new Set<string>();

    for (const location of locations) {
      if (visited.has(location.id)) continue;

      // Find all locations within cluster radius
      const nearbyLocations = locations.filter(
        (loc) =>
          !visited.has(loc.id) &&
          this.geoUtils.haversineDistance(
            location.coordinates,
            loc.coordinates,
          ) <= clusterRadiusKm,
      );

      // Use the first location as centroid, or calculate actual centroid
      const centroid = nearbyLocations[0];

      clusters.push({
        centroid,
        locations: nearbyLocations,
      });

      // Mark all as visited
      nearbyLocations.forEach((loc) => visited.add(loc.id));
    }

    return clusters;
  }

  /**
   * Build graph using location clusters instead of individual IDs
   */
  private buildCoordinateAwareGraph(
    journeys: Journey[],
    clusterRadiusKm: number = 2,
  ): Map<string, { location: Location; journeys: Journey[] }> {
    const allLocations = this.extractAllLocations(journeys);
    const clusters = this.clusterLocations(allLocations, clusterRadiusKm);

    const graph = new Map<
      string,
      { location: Location; journeys: Journey[] }
    >();

    // Create graph nodes for each cluster centroid
    clusters.forEach((cluster) => {
      graph.set(cluster.centroid.id, {
        location: cluster.centroid,
        journeys: [],
      });
    });

    // Map journeys to cluster centroids
    for (const journey of journeys) {
      if (!journey.fromLocation || !journey.toLocation) continue;

      // Find which cluster the fromLocation belongs to
      const fromCluster = clusters.find((cluster) =>
        cluster.locations.some((loc) => loc.id === journey.fromLocation!.id),
      );

      // Find which cluster the toLocation belongs to
      const toCluster = clusters.find((cluster) =>
        cluster.locations.some((loc) => loc.id === journey.toLocation!.id),
      );

      if (fromCluster && toCluster) {
        // Add journey to the fromCluster's centroid node
        const centroidId = fromCluster.centroid.id;
        if (!graph.has(centroidId)) {
          graph.set(centroidId, {
            location: fromCluster.centroid,
            journeys: [],
          });
        }
        graph.get(centroidId)!.journeys.push(journey);
      }
    }

    return graph;
  }

  /**
   * Find the cluster centroid for a given location
   */
  private findClusterForLocation(
    location: Location,
    clusters: LocationCluster[],
  ): Location | null {
    for (const cluster of clusters) {
      const isInCluster = cluster.locations.some(
        (clusterLoc) =>
          clusterLoc.id === location.id ||
          this.geoUtils.haversineDistance(
            location.coordinates,
            clusterLoc.coordinates,
          ) <= 2, // Same cluster radius
      );

      if (isInCluster) {
        return cluster.centroid;
      }
    }
    return null;
  }

  private extractAllLocations(journeys: Journey[]): Location[] {
    const locationMap = new Map<string, Location>();

    for (const journey of journeys) {
      if (journey.fromLocation) {
        locationMap.set(journey.fromLocation.id, journey.fromLocation);
      }
      if (journey.toLocation) {
        locationMap.set(journey.toLocation.id, journey.toLocation);
      }
    }

    return Array.from(locationMap.values());
  }

  findOptimalJourney(
    journeys: Journey[],
    start: Location,
    end: Location,
    demand: number,
    alpha: number = 1.0,
    beta: number = 0.1,
    gamma: number = 0.05,
    clusterRadiusKm: number = 2,
  ): { path: Journey[] | null; totalCost: number } {
    // Build coordinate-aware graph
    const graph = this.buildCoordinateAwareGraph(journeys, clusterRadiusKm);
    const allLocations = this.extractAllLocations(journeys);
    const clusters = this.clusterLocations(allLocations, clusterRadiusKm);

    // Find cluster centroids for start and end
    const startCluster = this.findClusterForLocation(start, clusters);
    const endCluster = this.findClusterForLocation(end, clusters);

    if (!startCluster || !endCluster) {
      console.log('No cluster found for start or end location');
      return { path: null, totalCost: Number.POSITIVE_INFINITY };
    }

    console.log(
      `Start cluster: ${startCluster.id}, End cluster: ${endCluster.id}`,
    );

    const pq = new PriorityQueue<PriorityQueueItem>(
      (a, b) => a.fScore - b.fScore,
    );

    // Initialize with start cluster centroid
    pq.push({
      fScore: this.heuristic(startCluster, endCluster),
      gScore: 0,
      location: startCluster,
      path: [],
      currentTime: new Date(0),
    });

    const bestCost = new Map<string, number>();
    bestCost.set(startCluster.id, 0);

    while (!pq.isEmpty()) {
      const { gScore, location, path, currentTime } = pq.pop()!;

      console.log(`Exploring from: ${location.id}`);

      // Check if we reached the destination cluster
      if (location.id === endCluster.id) {
        console.log('Reached destination cluster!');
        return { path, totalCost: gScore };
      }

      const currentNode = graph.get(location.id);
      if (!currentNode) {
        console.log(`No graph node for: ${location.id}`);
        continue;
      }

      const availableJourneys = currentNode.journeys;
      console.log(
        `Available journeys from ${location.id}: ${availableJourneys.length}`,
      );

      for (const journey of availableJourneys) {
        if (!journey.toLocation) continue;

        // Capacity check
        if (journey.capacity < demand) {
          console.log(`Capacity insufficient: ${journey.capacity} < ${demand}`);
          continue;
        }

        // Time availability check
        const journeyStartTime = new Date(journey.availableFrom);
        if (journeyStartTime < currentTime) {
          console.log('Journey not available at current time');
          continue;
        }

        // Find the cluster centroid for the journey's destination
        const toLocationCluster = this.findClusterForLocation(
          journey.toLocation,
          clusters,
        );
        if (!toLocationCluster) {
          console.log(
            `No cluster found for journey destination: ${journey.toLocation.id}`,
          );
          continue;
        }

        const journeyCost = this.weightedCost(journey, alpha, beta, gamma);
        const newGCost = gScore + journeyCost;

        const nextStateKey = `${toLocationCluster.id}_${new Date(journey.availableTo).getTime()}`;

        if (
          !bestCost.has(nextStateKey) ||
          newGCost < bestCost.get(nextStateKey)!
        ) {
          bestCost.set(nextStateKey, newGCost);

          const hCost = this.heuristic(toLocationCluster, endCluster);
          const newFCost = newGCost + hCost;

          console.log(
            `Adding to queue: ${toLocationCluster.id} with cost ${newFCost}`,
          );

          pq.push({
            fScore: newFCost,
            gScore: newGCost,
            location: toLocationCluster,
            path: [...path, journey],
            currentTime: new Date(journey.availableTo),
          });
        }
      }
    }

    console.log('No path found after exhaustive search');
    return { path: null, totalCost: Number.POSITIVE_INFINITY };
  }
}
