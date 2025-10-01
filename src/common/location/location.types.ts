/**
 * Location Interface
 */
export interface Location {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode?: number;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
}
