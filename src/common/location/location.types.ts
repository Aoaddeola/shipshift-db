/**
 * Location Interface
 */
export interface Location {
  id: string;
  street: string;
  city: string;
  state: string;
  coordinates: [number, number]; // [longitude, latitude]
}
