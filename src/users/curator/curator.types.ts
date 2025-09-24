/**
 * Curator Interface
 */
export interface Curator {
  id: string;
  name: string;
  contactDetailsId: string;
  missionIds: string[];
  createdAt?: string;
  updatedAt?: string;
}
