import { UserType } from '../../users/user/user.types.js';

export interface UserJwt {
  sub: string; // Unique identifier (e.g., user ID)
  username?: string;
  email?: string;
  walletAddress?: string;
  userType: UserType;
}
