/**
 * Contact Details Interface
 */
export interface ContactDetails {
  id: string;
  ownerId: string;
  phone: string; // Phone numbers should be strings to preserve formatting
  sms: string; // SMS notification number (can be same as phone)
  email: string;
  session: string;
}
