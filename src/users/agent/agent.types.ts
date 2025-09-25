import { ContactDetails } from '../../common/contact-details/contact-details.types.js';
import { Operator } from '../operator/operator.types.js';

/**
 * Agent Interface
 */
export interface Agent {
  id: string;
  name: string;
  contactDetailsId: string;
  operatorId: string; // reference to Operator
  contactDetails?: ContactDetails; // Embedded contact details
  operator?: Operator; // Embedded operator
  createdAt?: string;
  updatedAt?: string;
}
