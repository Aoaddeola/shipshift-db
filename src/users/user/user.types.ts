/**
 * User Type Enum
 */
export enum UserType {
  OPERATOR = 'operator',
  AGENT = 'agent',
  ADMIN = 'admin',
  USER = 'user',
  TESTNET = 'testnet',
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
