import { ContactDetails } from '../../common/contact-details/contact-details.types.js';

/**
 * Operator Interface
 */
export interface Operator {
  id: string;
  walletAddress: string;
  contactDetailsId: string;
  contactDetails?: ContactDetails; // Embedded contact details
  createdAt?: string;
  updatedAt?: string;
}
