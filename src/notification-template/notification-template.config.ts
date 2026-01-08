import { NotificationTemplateEntity } from './notification-template.types.js';
import { NotificationType } from '../notification/notification.types.js';
import { RabbitMQConfig } from '../shared/rabbitmq/config/rabbitmq.config.js';

// Core Step Lifecycle Templates
export const stepTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: RabbitMQConfig.STEP.EVENTS.CREATED,
    name: 'Step Created Notification',
    description: 'Sent when a new step is created in the system',
    defaultSubject: 'New Step Created: {{stepId}}',
    defaultBody:
      'A new step {{stepId}} has been created for shipment {{shipmentId}}. The step is currently in {{state}} state.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'senderId',
      'recipientId',
      'state',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'New Step Created: {{stepId}}',
        htmlBody:
          '<p>A new step <strong>{{stepId}}</strong> has been created for shipment <strong>{{shipmentId}}</strong>.</p><p>Current state: <strong>{{state}}</strong></p>',
      },
      sms: {
        body: 'New step {{stepId}} created for shipment {{shipmentId}}. State: {{state}}',
        maxLength: 160,
      },
      push: {
        title: 'Step Created',
        body: 'Step {{stepId}} created for shipment {{shipmentId}}',
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    templateId: RabbitMQConfig.STEP.EVENTS.CANCELLED,
    name: 'Step Cancelled Notification',
    description: 'Sent when a new step is created in the system',
    defaultSubject: 'Step Cancelled: {{stepId}}',
    defaultBody:
      'A step {{stepId}} has been cancelled for shipment {{shipmentId}}. The step is currently in {{state}} state.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'senderId',
      'recipientId',
      'cancellationReason',
      'cancelledById',
      'state',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Step Cancelled: {{stepId}}',
        htmlBody:
          '<p>A step <strong>{{stepId}}</strong> has been cancelled for shipment <strong>{{shipmentId}}</strong>.</p> \
          <br /> \
          <p>Current state: <strong>{{state}}</strong></p> \
          <p>Cancellation reason: <strong>{{cancellationReason}}</strong></p> \
          <p>Cancalled by: <strong>{{cancelledById}}</strong></p> \
          <p>Journey: <strong>{{journeyId}}</strong></p>',
      },
      sms: {
        body: 'Step {{stepId}} cancelled for shipment {{shipmentId}}. State: {{state}}',
        maxLength: 160,
      },
      push: {
        title: 'Step Cancelled',
        body: 'Step {{stepId}} cancelled for shipment {{shipmentId}}',
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: RabbitMQConfig.STEP.EVENTS.STATE_CHANGED,
    name: 'Step State Change Notification',
    description: 'Sent when step state changes',
    defaultSubject: 'Step State Updated: {{stepId}}',
    defaultBody:
      'Step {{stepId}} state has changed from {{oldState}} to {{newState}}.',
    variables: [
      'stepId',
      'oldState',
      'newState',
      'shipmentId',
      'agentId',
      'timestamp',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.WebSocket,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Step State Updated: {{stepId}}',
        htmlBody:
          '<p>Step <strong>{{stepId}}</strong> state has changed from <strong>{{oldState}}</strong> to <strong>{{newState}}</strong>.</p>',
      },
      sms: {
        body: 'Step {{stepId}} state: {{oldState}} → {{newState}}',
        maxLength: 160,
      },
      push: {
        title: 'Step State Changed',
        body: 'Step {{stepId}} is now {{newState}}',
      },
      websocket: {
        event: 'step.state.changed',
        data: {
          stepId: '{{stepId}}',
          newState: '{{newState}}',
          timestamp: '{{timestamp}}',
        },
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: RabbitMQConfig.STEP.EVENTS.ASSIGNED,
    name: 'Step Assignment Notification',
    description: 'Sent when a step is assigned to an agent',
    defaultSubject: 'Step Assigned to You: {{stepId}}',
    defaultBody:
      'You have been assigned to step {{stepId}} for shipment {{shipmentId}}. Please review and accept the assignment.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'dueDate',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.WebSocket,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'New Assignment: Step {{stepId}}',
        htmlBody:
          '<p>You have been assigned to step <strong>{{stepId}}</strong>.</p><p>Shipment: <strong>{{shipmentId}}</strong></p><p>Please complete by: <strong>{{dueDate}}</strong></p>',
      },
      sms: {
        body: 'New assignment: Step {{stepId}} for shipment {{shipmentId}}. Due: {{dueDate}}',
        maxLength: 160,
      },
      push: {
        title: 'New Step Assigned',
        body: 'Step {{stepId}} assigned to you. Shipment: {{shipmentId}}',
      },
      websocket: {
        event: 'step.assigned',
        data: {
          stepId: '{{stepId}}',
          agentId: '{{agentId}}',
          shipmentId: '{{shipmentId}}',
        },
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: RabbitMQConfig.STEP.EVENTS.COMPLETED,
    name: 'Step Completion Notification',
    description: 'Sent when a step is completed',
    defaultSubject: 'Step Completed: {{stepId}}',
    defaultBody:
      'Step {{stepId}} has been completed successfully. Shipment {{shipmentId}} is now ready for next step.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'completionTime',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
      NotificationType.WebSocket,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Step Completed: {{stepId}}',
        htmlBody:
          '<p>Step <strong>{{stepId}}</strong> has been completed successfully at {{completionTime}}.</p>',
      },
      sms: {
        body: 'Step {{stepId}} completed at {{completionTime}}.',
        maxLength: 160,
      },
      push: {
        title: 'Step Completed',
        body: 'Step {{stepId}} completed. Ready for next step.',
      },
      websocket: {
        event: 'step.completed',
        data: {
          stepId: '{{stepId}}',
          shipmentId: '{{shipmentId}}',
          completionTime: '{{completionTime}}',
        },
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: RabbitMQConfig.STEP.EVENTS.MILESTONE.PICKED_UP,
    name: 'Package Picked Up Notification',
    description: 'Sent when package is picked up in a step',
    defaultSubject: 'Package Picked Up: Step {{stepId}}',
    defaultBody:
      'Package has been picked up for step {{stepId}}. Shipment {{shipmentId}} is now in transit.',
    variables: [
      'stepId',
      'shipmentId',
      'agentId',
      'pickupTime',
      'location',
      'trackingNumber',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Package Picked Up: {{shipmentId}}',
        htmlBody:
          '<p>Your package for shipment <strong>{{shipmentId}}</strong> has been picked up.</p><p>Picked up at: <strong>{{location}}</strong></p><p>Time: <strong>{{pickupTime}}</strong></p>',
      },
      sms: {
        body: 'Package {{shipmentId}} picked up at {{location}}. Time: {{pickupTime}}',
        maxLength: 160,
      },
      push: {
        title: 'Package Picked Up',
        body: 'Shipment {{shipmentId}} has been picked up and is in transit.',
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: RabbitMQConfig.STEP.EVENTS.MILESTONE.DROPPED_OFF,
    name: 'Package Dropped Off Notification',
    description: 'Sent when package is dropped off in a step',
    defaultSubject: 'Package Dropped Off: Step {{stepId}}',
    defaultBody:
      'Package has been dropped off for step {{stepId}} at {{location}}.',
    variables: [
      'stepId',
      'shipmentId',
      'agentId',
      'dropoffTime',
      'location',
      'recipient',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Package Dropped Off: {{shipmentId}}',
        htmlBody:
          '<p>Your package for shipment <strong>{{shipmentId}}</strong> has been dropped off.</p><p>Location: <strong>{{location}}</strong></p><p>Time: <strong>{{dropoffTime}}</strong></p>',
      },
      sms: {
        body: 'Package {{shipmentId}} dropped off at {{location}}. Time: {{dropoffTime}}',
        maxLength: 160,
      },
      push: {
        title: 'Package Dropped Off',
        body: 'Shipment {{shipmentId}} has been dropped off at {{location}}.',
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: RabbitMQConfig.STEP.EVENTS.PAYMENT_PROCESSED,
    name: 'Step Payment Processed Notification',
    description: 'Sent when payment for a step is processed',
    defaultSubject: 'Payment Processed: Step {{stepId}}',
    defaultBody:
      'Payment of {{amount}} {{currency}} has been processed for step {{stepId}}.',
    variables: [
      'stepId',
      'shipmentId',
      'amount',
      'currency',
      'transactionId',
      'paymentTime',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Payment Processed: {{transactionId}}',
        htmlBody:
          '<p>Payment of <strong>{{amount}} {{currency}}</strong> has been processed for step <strong>{{stepId}}</strong>.</p><p>Transaction ID: <strong>{{transactionId}}</strong></p>',
      },
      sms: {
        body: 'Payment of {{amount}} {{currency}} processed for step {{stepId}}. Txn: {{transactionId}}',
        maxLength: 160,
      },
      push: {
        title: 'Payment Processed',
        body: '{{amount}} {{currency}} payment processed for step {{stepId}}',
      },
    },
    metadata: {
      category: 'step',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Shipment Templates
export const shipmentTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: 'shipment.created',
    name: 'Shipment Created Notification',
    description: 'Sent when a new shipment is created',
    defaultSubject: 'New Shipment Created: {{shipmentId}}',
    defaultBody:
      'A new shipment {{shipmentId}} has been created. Status: {{status}}.',
    variables: [
      'shipmentId',
      'ownerId',
      'status',
      'origin',
      'destination',
      'createdTime',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Shipment Created: {{shipmentId}}',
        htmlBody:
          '<p>Your shipment <strong>{{shipmentId}}</strong> has been created successfully.</p><p>From: <strong>{{origin}}</strong> → To: <strong>{{destination}}</strong></p>',
      },
    },
    metadata: {
      category: 'shipment',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: 'shipment.picked.up',
    name: 'Shipment Picked Up Notification',
    description: 'Sent when shipment is picked up',
    defaultSubject: 'Shipment Picked Up: {{shipmentId}}',
    defaultBody:
      'Your shipment {{shipmentId}} has been picked up and is now in transit.',
    variables: [
      'shipmentId',
      'pickupTime',
      'agent',
      'location',
      'estimatedDelivery',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Your Shipment Has Been Picked Up',
        htmlBody:
          '<p>Good news! Your shipment <strong>{{shipmentId}}</strong> has been picked up.</p><p>Estimated delivery: <strong>{{estimatedDelivery}}</strong></p>',
      },
    },
    metadata: {
      category: 'shipment',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: 'shipment.delivered',
    name: 'Shipment Delivered Notification',
    description: 'Sent when shipment is delivered',
    defaultSubject: 'Shipment Delivered: {{shipmentId}}',
    defaultBody:
      'Your shipment {{shipmentId}} has been successfully delivered.',
    variables: [
      'shipmentId',
      'deliveryTime',
      'recipient',
      'location',
      'signature',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.WebSocket,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'Shipment Delivered Successfully!',
        htmlBody:
          '<p>Your shipment <strong>{{shipmentId}}</strong> has been delivered.</p><p>Delivered to: <strong>{{recipient}}</strong></p><p>Time: <strong>{{deliveryTime}}</strong></p>',
      },
    },
    metadata: {
      category: 'shipment',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Journey Templates
export const journeyTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: 'journey.created',
    name: 'Journey Created Notification',
    description: 'Sent when a new journey is created',
    defaultSubject: 'New Journey Available: {{journeyId}}',
    defaultBody:
      'A new journey {{journeyId}} is available from {{origin}} to {{destination}}.',
    variables: [
      'journeyId',
      'agentId',
      'origin',
      'destination',
      'startTime',
      'endTime',
      'capacity',
      'price',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.Push,
      NotificationType.WebSocket,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      email: {
        subject: 'New Journey Available',
        htmlBody:
          '<p>New journey <strong>{{journeyId}}</strong> is now available.</p><p>Route: <strong>{{origin}} → {{destination}}</strong></p><p>Capacity: <strong>{{capacity}}</strong></p>',
      },
    },
    metadata: {
      category: 'journey',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: 'journey.booked',
    name: 'Journey Booked Notification',
    description: 'Sent when a journey is booked',
    defaultSubject: 'Journey Booked: {{journeyId}}',
    defaultBody: 'Journey {{journeyId}} has been booked successfully.',
    variables: ['journeyId', 'shipmentId', 'agentId', 'bookingTime', 'status'],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    metadata: {
      category: 'journey',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mission Templates
export const missionTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: 'mission.created',
    name: 'Mission Created Notification',
    description: 'Sent when a new mission is created',
    defaultSubject: 'New Mission Created: {{missionId}}',
    defaultBody:
      'A new mission {{missionId}} has been created with {{journeyCount}} journeys.',
    variables: [
      'missionId',
      'curatorId',
      'journeyCount',
      'status',
      'createdTime',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.Push,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    metadata: {
      category: 'mission',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Offer Templates
export const offerTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: 'offer.created',
    name: 'Offer Created Notification',
    description: 'Sent when a bid/offer is created',
    defaultSubject: 'You have an offer: {{offerId}}',
    defaultBody:
      'You have received an offer {{offerId}} for the shipment {{shipmentId}}.',
    variables: ['offerId', 'shipmentId', 'journeyId', 'missionId'],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.WebSocket,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    metadata: {
      category: 'offer',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    templateId: 'offer.bid.accepted',
    name: 'Bid Accepted Notification',
    description: 'Sent when a bid/offer is accepted',
    defaultSubject: 'Bid Accepted: {{offerId}}',
    defaultBody:
      'Your bid {{offerId}} has been accepted for shipment {{shipmentId}}.',
    variables: [
      'offerId',
      'shipmentId',
      'journeyId',
      'missionId',
      'acceptedBy',
      'acceptanceTime',
    ],
    supportedChannels: [
      NotificationType.Email,
      NotificationType.SMS,
      NotificationType.Push,
      NotificationType.WebSocket,
      NotificationType.Session,
    ],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    metadata: {
      category: 'offer',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Agent Templates
export const agentTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: 'agent.available',
    name: 'Agent Available Notification',
    description: 'Sent when an agent becomes available for assignments',
    defaultSubject: 'Agent Available: {{agentId}}',
    defaultBody: 'Agent {{agentId}} is now available for new assignments.',
    variables: ['agentId', 'location', 'availableFrom', 'capacity'],
    supportedChannels: [NotificationType.Push, NotificationType.WebSocket],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      push: {
        title: 'Agent Available',
        body: 'Agent {{agentId}} is now available near {{location}}',
      },
      websocket: {
        event: 'agent.available',
        data: {
          agentId: '{{agentId}}',
          location: '{{location}}',
          capacity: '{{capacity}}',
        },
      },
    },
    metadata: {
      category: 'agent',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Notification System Templates
export const notificationTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: 'notification.sent',
    name: 'Notification Sent Confirmation',
    description: 'Confirmation that a notification was sent',
    defaultSubject: 'Notification Sent',
    defaultBody: 'Your notification has been sent successfully.',
    variables: ['notificationId', 'recipient', 'channel', 'sentTime'],
    supportedChannels: [NotificationType.Session, NotificationType.WebSocket],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      session: {
        message:
          'Notification {{notificationId}} sent to {{recipient}} via {{channel}}',
        data: { notificationId: '{{notificationId}}', status: 'sent' },
      },
      websocket: {
        event: 'notification.sent',
        data: {
          notificationId: '{{notificationId}}',
          recipient: '{{recipient}}',
          channel: '{{channel}}',
        },
      },
    },
    metadata: {
      category: 'notification',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Real-time WebSocket Templates (for live updates)
export const websocketTemplates: Omit<NotificationTemplateEntity, 'id'>[] = [
  {
    templateId: 'real-time.location.update',
    name: 'Real-time Location Update',
    description: 'WebSocket event for real-time location updates',
    defaultSubject: '',
    defaultBody: '',
    variables: [
      'shipmentId',
      'stepId',
      'latitude',
      'longitude',
      'accuracy',
      'timestamp',
      'speed',
    ],
    supportedChannels: [NotificationType.WebSocket],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      websocket: {
        event: 'location.update',
        data: {
          shipmentId: '{{shipmentId}}',
          stepId: '{{stepId}}',
          coordinates: {
            lat: '{{latitude}}',
            lng: '{{longitude}}',
          },
          timestamp: '{{timestamp}}',
        },
      },
    },
    metadata: {
      category: 'realtime',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    templateId: 'real-time.step.progress',
    name: 'Real-time Step Progress',
    description: 'WebSocket event for step progress updates',
    defaultSubject: '',
    defaultBody: '',
    variables: [
      'stepId',
      'progress',
      'estimatedTime',
      'currentState',
      'nextState',
    ],
    supportedChannels: [NotificationType.WebSocket],
    language: 'en',
    version: '1.0',
    isActive: true,
    isSystemTemplate: true,
    channelSpecificContent: {
      websocket: {
        event: 'step.progress',
        data: {
          stepId: '{{stepId}}',
          progress: '{{progress}}',
          currentState: '{{currentState}}',
          nextState: '{{nextState}}',
          eta: '{{estimatedTime}}',
        },
      },
    },
    metadata: {
      category: 'realtime',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Combine all templates
export const allNotificationTemplates: Omit<
  NotificationTemplateEntity,
  'id'
>[] = [
  ...stepTemplates,
  ...shipmentTemplates,
  ...journeyTemplates,
  ...missionTemplates,
  ...offerTemplates,
  ...agentTemplates,
  ...notificationTemplates,
  ...websocketTemplates,
];

// Helper function to get templates by event
export function getTemplatesByEvent(
  eventType: string,
): Omit<NotificationTemplateEntity, 'id'>[] {
  return allNotificationTemplates.filter(
    (template) =>
      template.templateId === eventType ||
      template.templateId.startsWith(eventType),
  );
}

// Helper function to get templates by channel
export function getTemplatesByChannel(
  channel: NotificationType,
): Omit<NotificationTemplateEntity, 'id'>[] {
  return allNotificationTemplates.filter((template) =>
    template.supportedChannels.includes(channel),
  );
}
