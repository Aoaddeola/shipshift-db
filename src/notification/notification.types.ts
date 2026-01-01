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
    email?: {
      sent: boolean;
      messageId?: string;
      error?: string;
      sentAt?: string;
      attempts?: number;
      lastAttempt?: string;
    };
    sms?: {
      sent: boolean;
      messageId?: string;
      error?: string;
      sentAt?: string;
      attempts?: number;
      lastAttempt?: string;
    };
    push?: {
      sent: boolean;
      messageId?: string;
      error?: string;
      sentAt?: string;
      attempts?: number;
      lastAttempt?: string;
    };
    session?: {
      sent: boolean;
      messageId?: string;
      error?: string;
      sentAt?: string;
      attempts?: number;
      lastAttempt?: string;
    };
    websocket?: {
      sent: boolean;
      messageId?: string;
      error?: string;
      sentAt?: string;
      attempts?: number;
      lastAttempt?: string;
    };
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

export interface NotificationTemplateEntity {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  defaultSubject: string;
  defaultBody: string;
  variables: string[];
  supportedChannels: NotificationType[];
  language: string;
  version: string;
  isActive: boolean;
  isSystemTemplate: boolean;

  channelSpecificContent?: {
    email?: {
      subject?: string;
      htmlBody?: string;
      textBody?: string;
    };
    sms?: {
      body?: string;
      maxLength?: number;
    };
    push?: {
      title?: string;
      body?: string;
      data?: Record<string, any>;
    };
    session?: {
      message?: string;
      data?: Record<string, any>;
    };
    websocket?: {
      event?: string;
      data?: Record<string, any>;
    };
  };

  metadata?: {
    createdBy?: string;
    lastModifiedBy?: string;
    category?: string;
  };

  createdAt: string;
  updatedAt: string;
}
