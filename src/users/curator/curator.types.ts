import { ContactDetails } from '../../common/contact-details/contact-details.types.js';

/**
 * Curator Interface
 */
export interface Curator {
  id: string;
  name: string;
  contactDetailsId: string;
  contactDetails?: ContactDetails; // Embedded contact details
  createdAt?: string;
  updatedAt?: string;
}
