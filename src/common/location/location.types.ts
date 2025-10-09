import { User } from '../../users/user/user.types.js';

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
  coordinates: [number, number]; // [longitude, latitude]
}
