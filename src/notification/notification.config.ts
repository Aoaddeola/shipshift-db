/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// import { RabbitMQConfig } from '../rabbitmq/config/rabbitmq.config.js';

import { RabbitMQConfig } from 'src/shared/rabbitmq/config/rabbitmq.config.js';

export const NotificationConfig = {
  // ==================== ENTITY NOTIFICATION RULES ====================
  ENTITIES: {
    STEP: {
      EVENTS_TO_NOTIFY: [
        RabbitMQConfig.STEP.EVENTS.CREATED,
        RabbitMQConfig.STEP.EVENTS.STATE_CHANGED,
        RabbitMQConfig.STEP.EVENTS.COMPLETED,
        RabbitMQConfig.STEP.EVENTS.MILESTONE.PICKED_UP,
        RabbitMQConfig.STEP.EVENTS.MILESTONE.DROPPED_OFF,
        RabbitMQConfig.STEP.EVENTS.PAYMENT_PROCESSED,
        RabbitMQConfig.STEP.EVENTS.PAYMENT_FAILED,
      ],
      STAKEHOLDERS: ['agent', 'operator', 'customer', 'admin'],
      DEFAULT_CHANNELS: ['email', 'in_app'],
      PRIORITY: 'medium',
    },

    SHIPMENT: {
      EVENTS_TO_NOTIFY: [
        RabbitMQConfig.SHIPMENT.EVENTS.STATUS_CHANGED,
        RabbitMQConfig.SHIPMENT.EVENTS.PICKED_UP,
        RabbitMQConfig.SHIPMENT.EVENTS.DELIVERED,
        RabbitMQConfig.SHIPMENT.EVENTS.PAYMENT_PROCESSED,
        RabbitMQConfig.SHIPMENT.EVENTS.PAYMENT_FAILED,
        RabbitMQConfig.SHIPMENT.EVENTS.READY_FOR_PICKUP,
        RabbitMQConfig.SHIPMENT.EVENTS.CANCELLED,
      ],
      STAKEHOLDERS: ['customer', 'agent', 'admin', 'operator'],
      DEFAULT_CHANNELS: ['email', 'sms', 'in_app'],
      PRIORITY: 'high',
    },

    JOURNEY: {
      EVENTS_TO_NOTIFY: [
        RabbitMQConfig.JOURNEY?.EVENTS.BOOKED || 'journey.booked',
        RabbitMQConfig.JOURNEY?.EVENTS.COMPLETED || 'journey.completed',
        RabbitMQConfig.JOURNEY?.EVENTS.CANCELLED || 'journey.cancelled',
        RabbitMQConfig.JOURNEY?.EVENTS.AGENT_ASSIGNED ||
          'journey.agent.assigned',
      ],
      STAKEHOLDERS: ['customer', 'agent', 'admin'],
      DEFAULT_CHANNELS: ['email', 'push', 'in_app'],
      PRIORITY: 'medium',
    },
  },

  // ==================== NOTIFICATION CHANNELS ====================
  CHANNELS: {
    EMAIL: {
      id: 'email',
      name: 'Email',
      enabled: true,
      priority: 1,
      retryAttempts: 3,
      retryDelay: 5000, // 5 seconds
      timeout: 30000, // 30 seconds
    },
    SESSION: {
      id: 'session',
      name: 'Session',
      enabled: true,
      priority: 2,
      retryAttempts: 2,
      retryDelay: 3000,
      timeout: 10000,
    },
    PUSH: {
      id: 'push',
      name: 'Push Notification',
      enabled: true,
      priority: 3,
      retryAttempts: 2,
      retryDelay: 3000,
      timeout: 10000,
    },
    SMS: {
      id: 'sms',
      name: 'SMS',
      enabled: false, // Disabled by default
      priority: 4,
      retryAttempts: 1,
      retryDelay: 10000,
      timeout: 60000,
      costPerMessage: 0.05,
    },
    IN_APP: {
      id: 'in_app',
      name: 'In-App Notification',
      enabled: true,
      priority: 0, // Highest priority
      retryAttempts: 1,
      retryDelay: 1000,
      timeout: 5000,
    },
  },

  // ==================== NOTIFICATION TEMPLATES ====================
  TEMPLATES: {
    STEP_STATE_CHANGED: {
      id: 'step-state-changed',
      name: 'Step State Changed',
      defaultSubject: 'Step Status Update',
      defaultBody:
        'Step {{stepId}} state changed from {{oldState}} to {{newState}}',
      variables: ['stepId', 'oldState', 'newState', 'agentName', 'timestamp'],
      channels: ['email', 'in_app'],
    },

    SHIPMENT_DELIVERED: {
      id: 'shipment-delivered',
      name: 'Shipment Delivered',
      defaultSubject: 'Your shipment has been delivered!',
      defaultBody:
        'Shipment {{shipmentId}} has been successfully delivered to {{recipientName}}',
      variables: [
        'shipmentId',
        'recipientName',
        'deliveryTime',
        'agentName',
        'location',
      ],
      channels: ['email', 'sms', 'in_app', 'push'],
    },

    PAYMENT_PROCESSED: {
      id: 'payment-processed',
      name: 'Payment Processed',
      defaultSubject: 'Payment Successful',
      defaultBody:
        'Payment of {{amount}} {{currency}} for {{entityType}} {{entityId}} has been processed',
      variables: [
        'amount',
        'currency',
        'entityType',
        'entityId',
        'paymentMethod',
        'timestamp',
      ],
      channels: ['email', 'in_app'],
    },

    MILESTONE_ACHIEVED: {
      id: 'milestone-achieved',
      name: 'Milestone Achieved',
      defaultSubject: 'Milestone Reached!',
      defaultBody:
        '{{entityType}} {{entityId}} has reached milestone: {{milestone}}',
      variables: [
        'entityType',
        'entityId',
        'milestone',
        'timestamp',
        'agentName',
      ],
      channels: ['email', 'in_app', 'push'],
    },
  },

  // ==================== DELIVERY SETTINGS ====================
  DELIVERY: {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 5000,
    BATCH_SIZE: 50,
    CONCURRENT_SENDS: 5,
    RATE_LIMIT: {
      perSecond: 10,
      perMinute: 100,
      perHour: 1000,
    },
  },

  // ==================== TRACKING SETTINGS ====================
  TRACKING: {
    RETENTION_DAYS: 90,
    ARCHIVE_AFTER_DAYS: 30,
    CLEANUP_INTERVAL_HOURS: 24,
  },

  // ==================== UTILITY FUNCTIONS ====================
  Utils: {
    /**
     * Get notification channels for entity and event
     */
    getChannelsForEvent(entityType: string, eventType: string): string[] {
      const entityConfig = this.ENTITIES[entityType.toUpperCase()];
      if (!entityConfig) return ['email', 'in_app'];

      return entityConfig.DEFAULT_CHANNELS;
    },

    /**
     * Get stakeholders for entity
     */
    getStakeholdersForEntity(entityType: string): string[] {
      const entityConfig = this.ENTITIES[entityType.toUpperCase()];
      return entityConfig?.STAKEHOLDERS || ['admin'];
    },

    /**
     * Check if event should trigger notification
     */
    shouldNotifyForEvent(entityType: string, eventType: string): boolean {
      const entityConfig = this.ENTITIES[entityType.toUpperCase()];
      if (!entityConfig) return false;

      return entityConfig.EVENTS_TO_NOTIFY.includes(eventType);
    },

    /**
     * Get template for event
     */
    getTemplateForEvent(eventType: string): string {
      const templateMap: Record<string, string> = {
        'step.state.changed': 'STEP_STATE_CHANGED',
        'shipment.delivered': 'SHIPMENT_DELIVERED',
        '*.payment.processed': 'PAYMENT_PROCESSED',
        '*.milestone.*': 'MILESTONE_ACHIEVED',
      };

      for (const [pattern, template] of Object.entries(templateMap)) {
        if (this.matchesPattern(eventType, pattern)) {
          return template;
        }
      }

      return 'STEP_STATE_CHANGED'; // Default template
    },

    /**
     * Simple pattern matching for event types
     */
    matchesPattern(eventType: string, pattern: string): boolean {
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
        return new RegExp(`^${regexPattern}$`).test(eventType);
      }
      return eventType === pattern;
    },
  },
} as const;

export type NotificationChannelType = keyof typeof NotificationConfig.CHANNELS;
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
