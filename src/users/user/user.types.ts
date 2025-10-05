/**
 * User Type Enum
 */
export type UserType = 'customer' | 'agent';

/**
 * User Interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Note: This should be hashed in the database
  type: UserType;
  createdAt?: string;
  updatedAt?: string;
}
