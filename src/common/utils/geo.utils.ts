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
