import { User } from '../users/user/user.types.js';

/**
 * Notification Type Enum
 */
export enum NotificationType {
  MESSAGE = 'message',
  SYSTEM = 'system',
  ALERT = 'alert',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Notification Interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string; // Human-readable time (e.g., "5 min ago")
  timestamp: string; // ISO 8601 timestamp for sorting
  type: NotificationType;
  read: boolean;
  userId?: string; // Optional user ID for personal notifications
  user?: User; // Embedded user
  createdAt?: string;
  updatedAt?: string;
}
