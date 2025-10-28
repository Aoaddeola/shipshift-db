// src/common/utils/geo.utils.ts
import { Injectable } from '@nestjs/common';

export interface Coordinates {
  longitude: number;
  latitude: number;
}

@Injectable()
export class GeoUtils {
  private static readonly EARTH_RADIUS_KM = 6371;

  haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
    const lon1 = coord1.longitude;
    const lat1 = coord1.latitude;
    const lon2 = coord2.longitude;
    const lat2 = coord2.latitude;

    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return GeoUtils.EARTH_RADIUS_KM * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export function areCoordinatesWithinRadius(
  coord1: Coordinates,
  coord2: Coordinates,
  radiusMeters: number,
): boolean {
  const earthRadiusMeters = 6371000; // Earth's radius in meters

  // Convert degrees to radians
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lon1Rad = (coord1.longitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const lon2Rad = (coord2.longitude * Math.PI) / 180;

  // Differences in coordinates
  const latDiff = lat2Rad - lat1Rad;
  const lonDiff = lon2Rad - lon1Rad;

  // Haversine formula
  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate distance
  const distance = earthRadiusMeters * c;

  return distance <= radiusMeters;
}
