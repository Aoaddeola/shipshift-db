import { ContactDetails } from '../../settings/contact-details/contact-details.types.js';
import { LocationCreateDto } from '../../common/location/location-create.dto.js';

/**
 * Customer Interface
 */
export interface Customer {
  id: string;
  address: LocationCreateDto; // Embedded location
  contactDetailsId: string;
  contactDetails?: ContactDetails; // Embedded contact details
  createdAt?: string;
  updatedAt?: string;
}
