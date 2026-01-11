import { ContactDetails } from '../settings/contact-details/contact-details.types.js';

// notification.orbitdb.types.ts
export enum NotificationType {
  Email = 'email',
  SMS = 'sms',
  Push = 'push',
  Session = 'session',
  WebSocket = 'websocket',
}

export type RecipientMap = Partial<{
  [NotificationType.Email]: string;
  [NotificationType.SMS]: string;
  [NotificationType.Push]: string;
  [NotificationType.Session]: string;
  [NotificationType.WebSocket]: string;
}>;

export interface ChannelStatus {
  sent: boolean;
  messageId?: string;
  error?: string;
  sentAt?: string;
  attempts?: number;
  lastAttempt?: string;
}

export interface NotificationEntity {
  id: string;
  userId: string;

  recipientMap: RecipientMap;
  urgency: 'low' | 'medium' | 'high';
  userPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    session: boolean;
    websocket: boolean;
  };
  isUserOnline: boolean;
  event: string;
  userName: string;
  locale: string;

  // Delivery tracking
  status:
    | 'pending'
    | 'processing'
    | 'sent'
    | 'partially_sent'
    | 'delivered'
    | 'failed'
    | 'read';

  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  retryCount: number;
  channelsToUse: NotificationType[];

  // Channel-specific delivery status
  channelStatus?: {
    email?: ChannelStatus;
    sms?: ChannelStatus;
    push?: ChannelStatus;
    session?: ChannelStatus;
    websocket?: ChannelStatus;
  };

  errorDetails?: {
    message: string;
    code?: string;
    stack?: string;
  };

  metadata?: {
    correlationId?: string;
    sourceService?: string;
    ipAddress?: string;
    userAgent?: string;
    priority?: number;
  };

  variables?: Record<string, any>; // For template rendering

  createdAt: string;
  updatedAt: string;
}

export interface NotificationRuleEntity {
  id: string;
  event: string;
  templateId: string;
  conditions?: {
    userPreferences?: string[];
    isUserOnline?: boolean;
    urgency?: ('low' | 'medium' | 'high')[];
    locale?: string[];
  };
  priority: number;
  isActive: boolean;
  isSystemRule: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Add these to existing enums
export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  PARTIALLY_SENT = 'partially_sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export function createRecipientMapConcise(
  contact: ContactDetails,
): RecipientMap {
  const preferenceMapping = {
    [NotificationType.Email]: {
      enabled: contact.preference.email,
      value: contact.email,
    },
    [NotificationType.SMS]: {
      enabled: contact.preference.sms,
      value: contact.sms || contact.phone,
    },
    [NotificationType.Push]: {
      enabled: contact.preference.push,
      value: contact.id, // Adjust as needed
    },
    [NotificationType.Session]: {
      enabled: contact.preference.session,
      value: contact.session,
    },
    [NotificationType.WebSocket]: {
      enabled: contact.preference.websocket,
      value: contact.session, // Adjust as needed
    },
  };

  const recipientMap: RecipientMap = {};

  (Object.keys(preferenceMapping) as NotificationType[]).forEach((type) => {
    const mapping = preferenceMapping[type];
    if (mapping.enabled && mapping.value) {
      recipientMap[type] = mapping.value;
    }
  });

  return recipientMap;
}
