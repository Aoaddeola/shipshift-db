import { User } from '../../users/user/user.types.js';

/**
 * Coordinates Interface
 */
export interface Coordinates {
  longitude: number;
  latitude: number;
}

/**
 * Location Interface
 */
export interface Location {
  id: string;
  ownerId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode?: number;
  country: string;
  owner?: User;
  coordinates: Coordinates;
  createdAt?: string;
  updatedAt?: string;
}
