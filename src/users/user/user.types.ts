/**
 * User Type Enum
 */
export type UserType = 'customer' | 'agent' | 'user';

/**
 * User Interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Note: This should be hashed in the database
  avatar: string;
  isVerified: boolean;
  userType: UserType;
  createdAt?: Date;
  updatedAt?: Date;
}
