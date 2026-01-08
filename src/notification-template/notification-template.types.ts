import { NotificationType } from '../notification/notification.types.js';

export interface ChannelSpecificContent {
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

  channelSpecificContent?: ChannelSpecificContent;

  metadata?: {
    createdBy?: string;
    lastModifiedBy?: string;
    category?: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface INotificationTemplateVariable {
  getVariables: () => Record<string, any>;
}
