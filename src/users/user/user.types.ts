/**
 * User Type Enum
 */
export enum UserType {
  OPERATOR = 'operator',
  AGENT = 'agent',
  USER = 'user',
}

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
