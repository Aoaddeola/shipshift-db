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
  // ACCEPTED - Notification to sender when step is accepted
  {
    templateId: RabbitMQConfig.STEP.EVENTS.ACCEPTED,
    name: 'Step Accepted Notification',
    description: 'Sent to sender when their step is accepted',
    defaultSubject: 'Step Accepted: {{stepId}}',
    defaultBody:
      'Your step {{stepId}} has been accepted and is now ready for initialization.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'timestamp',
      'userName',
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
        subject: 'Step Accepted: {{stepId}}',
        htmlBody: `
        <p>Hello {{userName}},</p>
        <p>Great news! Your step <strong>{{stepId}}</strong> has been accepted.</p>
        <p>The shipment is now being processed by our team.</p>
      `,
      },
      sms: {
        body: 'Your step {{stepId}} has been accepted and is being processed.',
        maxLength: 160,
      },
      push: {
        title: 'Step Accepted',
        body: 'Your step {{stepId}} has been accepted',
      },
      websocket: {
        event: 'step.accepted',
        data: {
          stepId: '{{stepId}}',
          status: 'accepted',
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

  // REJECTED - Notification to sender when step is rejected
  {
    templateId: RabbitMQConfig.STEP.EVENTS.REJECTED,
    name: 'Step Rejected Notification',
    description: 'Sent to sender when their step is rejected',
    defaultSubject: 'Step Rejected: {{stepId}}',
    defaultBody:
      'Your step {{stepId}} has been rejected. Please review and resubmit if necessary.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'timestamp',
      'userName',
      'rejectionReason',
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
        subject: 'Step Rejected: {{stepId}}',
        htmlBody: `
        <p>Hello {{userName}},</p>
        <p>Your step <strong>{{stepId}}</strong> has been rejected.</p>
        {{#if rejectionReason}}
          <p>Reason: {{rejectionReason}}</p>
        {{/if}}
        <p>Please review and resubmit if necessary.</p>
      `,
      },
      sms: {
        body: 'Step {{stepId}} was rejected. Please check email for details.',
        maxLength: 160,
      },
      push: {
        title: 'Step Rejected',
        body: 'Your step {{stepId}} has been rejected',
      },
      websocket: {
        event: 'step.rejected',
        data: {
          stepId: '{{stepId}}',
          status: 'rejected',
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

  // INITIALIZED - Notification to operator when step is initialized
  {
    templateId: RabbitMQConfig.STEP.EVENTS.INITIALIZED,
    name: 'Step Initialized Notification',
    description: 'Sent to operator when a new step is initialized',
    defaultSubject: 'New Step Initialized: {{stepId}}',
    defaultBody:
      'A new step {{stepId}} has been initialized and assigned to you.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'userName',
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
        subject: 'New Step Assigned: {{stepId}}',
        htmlBody: `
        <p>Hello {{userName}},</p>
        <p>A new step <strong>{{stepId}}</strong> has been assigned to you.</p>
        <p>Please review and process accordingly.</p>
      `,
      },
      sms: {
        body: 'New step {{stepId}} assigned. Please check dashboard.',
        maxLength: 160,
      },
      push: {
        title: 'New Step Assigned',
        body: 'Step {{stepId}} has been assigned to you',
      },
      websocket: {
        event: 'step.initialized',
        data: {
          stepId: '{{stepId}}',
          status: 'initialized',
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

  // COMMITTED - Notification to agent and sender when step is committed
  {
    templateId: RabbitMQConfig.STEP.EVENTS.COMMITTED,
    name: 'Step Committed Notification',
    description: 'Sent to operator and agent when step is committed',
    defaultSubject: 'Step Committed: {{stepId}}',
    defaultBody:
      'Step {{stepId}} has been committed and is ready for execution.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'userName',
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
        subject: 'Step Ready: {{stepId}}',
        htmlBody: `
        <p>Step <strong>{{stepId}}</strong> has been committed and is ready for execution.</p>
        <p>All parties have confirmed and the process can begin.</p>
      `,
      },
      sms: {
        body: 'Step {{stepId}} committed. Ready for execution.',
        maxLength: 160,
      },
      push: {
        title: 'Step Committed',
        body: 'Step {{stepId}} is ready for execution',
      },
      websocket: {
        event: 'step.committed',
        data: {
          stepId: '{{stepId}}',
          status: 'committed',
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

  // PICKED_UP - Notification to all parties when shipment is picked up
  {
    templateId: RabbitMQConfig.STEP.EVENTS.MILESTONE.PICKED_UP,
    name: 'Shipment Picked Up Notification',
    description:
      'Sent to operator, agent, and sender when shipment is picked up',
    defaultSubject: 'Shipment Picked Up: {{stepId}}',
    defaultBody:
      'Shipment for step {{stepId}} has been picked up and is in transit.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'pickupLocation',
      'estimatedDeliveryTime',
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
        subject: 'Shipment Picked Up: {{stepId}}',
        htmlBody: `
        <p>Great news! The shipment for step <strong>{{stepId}}</strong> has been picked up.</p>
        {{#if pickupLocation}}
          <p>Pickup location: {{pickupLocation}}</p>
        {{/if}}
        {{#if estimatedDeliveryTime}}
          <p>Estimated delivery: {{estimatedDeliveryTime}}</p>
        {{/if}}
      `,
      },
      sms: {
        body: 'Shipment picked up for step {{stepId}}. In transit now.',
        maxLength: 160,
      },
      push: {
        title: 'Shipment Picked Up',
        body: 'Your shipment for step {{stepId}} is in transit',
      },
      websocket: {
        event: 'shipment.picked_up',
        data: {
          stepId: '{{stepId}}',
          milestone: 'picked_up',
          timestamp: '{{timestamp}}',
        },
      },
    },
    metadata: {
      category: 'milestone',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // DROPPED_OFF - Notification to all parties when shipment is dropped off
  {
    templateId: RabbitMQConfig.STEP.EVENTS.MILESTONE.DROPPED_OFF,
    name: 'Shipment Dropped Off Notification',
    description:
      'Sent to operator, agent, and sender when shipment is dropped off',
    defaultSubject: 'Shipment Dropped Off: {{stepId}}',
    defaultBody:
      'Shipment for step {{stepId}} has been dropped off at destination.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'dropoffLocation',
      'userName',
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
        subject: 'Shipment Delivered: {{stepId}}',
        htmlBody: `
        <p>The shipment for step <strong>{{stepId}}</strong> has been delivered.</p>
        {{#if dropoffLocation}}
          <p>Delivery location: {{dropoffLocation}}</p>
        {{/if}}
        {{#if userName}}
          <p>Received by: {{userName}}</p>
        {{/if}}
      `,
      },
      sms: {
        body: 'Shipment delivered for step {{stepId}}.',
        maxLength: 160,
      },
      push: {
        title: 'Shipment Delivered',
        body: 'Your shipment for step {{stepId}} has been delivered',
      },
      websocket: {
        event: 'shipment.dropped_off',
        data: {
          stepId: '{{stepId}}',
          milestone: 'dropped_off',
          timestamp: '{{timestamp}}',
        },
      },
    },
    metadata: {
      category: 'milestone',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // FULFILLED - Notification to all parties when step is fulfilled
  {
    templateId: RabbitMQConfig.STEP.EVENTS.MILESTONE.FULFILLED,
    name: 'Step Fulfilled Notification',
    description: 'Sent to operator, agent, and sender when step is fulfilled',
    defaultSubject: 'Step Fulfilled: {{stepId}}',
    defaultBody: 'Step {{stepId}} has been successfully fulfilled.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'fulfillmentDetails',
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
        subject: 'Step Completed: {{stepId}}',
        htmlBody: `
        <p>Congratulations! Step <strong>{{stepId}}</strong> has been successfully fulfilled.</p>
        <p>All requirements have been met and the step is complete.</p>
      `,
      },
      sms: {
        body: 'Step {{stepId}} fulfilled successfully!',
        maxLength: 160,
      },
      push: {
        title: 'Step Fulfilled',
        body: 'Step {{stepId}} has been successfully completed',
      },
      websocket: {
        event: 'step.fulfilled',
        data: {
          stepId: '{{stepId}}',
          milestone: 'fulfilled',
          timestamp: '{{timestamp}}',
        },
      },
    },
    metadata: {
      category: 'milestone',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // COMMENCED - Notification to all parties when step commences
  {
    templateId: RabbitMQConfig.STEP.EVENTS.COMMENCED,
    name: 'Step Commenced Notification',
    description: 'Sent to operator, agent, and sender when step commences',
    defaultSubject: 'Step Commenced: {{stepId}}',
    defaultBody: 'Step {{stepId}} has commenced and is now in progress.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'expectedCompletionTime',
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
        subject: 'Step In Progress: {{stepId}}',
        htmlBody: `
        <p>Step <strong>{{stepId}}</strong> has commenced and is now in progress.</p>
        {{#if expectedCompletionTime}}
          <p>Expected completion: {{expectedCompletionTime}}</p>
        {{/if}}
      `,
      },
      sms: {
        body: 'Step {{stepId}} has commenced and is in progress.',
        maxLength: 160,
      },
      push: {
        title: 'Step Started',
        body: 'Step {{stepId}} has commenced',
      },
      websocket: {
        event: 'step.commenced',
        data: {
          stepId: '{{stepId}}',
          status: 'commenced',
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

  // REFUNDED - Notification to all parties when step is refunded
  {
    templateId: RabbitMQConfig.STEP.EVENTS.REFUNDED,
    name: 'Step Refunded Notification',
    description: 'Sent to operator, agent, and sender when step is refunded',
    defaultSubject: 'Refund Processed: {{stepId}}',
    defaultBody: 'A refund has been processed for step {{stepId}}.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'refundAmount',
      'refundReason',
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
        subject: 'Refund Completed: {{stepId}}',
        htmlBody: `
        <p>A refund has been processed for step <strong>{{stepId}}</strong>.</p>
        {{#if refundAmount}}
          <p>Amount refunded: {{refundAmount}}</p>
        {{/if}}
        {{#if refundReason}}
          <p>Reason: {{refundReason}}</p>
        {{/if}}
      `,
      },
      sms: {
        body: 'Refund processed for step {{stepId}}.',
        maxLength: 160,
      },
      push: {
        title: 'Refund Processed',
        body: 'A refund has been issued for step {{stepId}}',
      },
      websocket: {
        event: 'step.refunded',
        data: {
          stepId: '{{stepId}}',
          status: 'refunded',
          timestamp: '{{timestamp}}',
        },
      },
    },
    metadata: {
      category: 'financial',
      createdBy: 'system',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // CLAIMED - Notification to operator when step is claimed
  {
    templateId: RabbitMQConfig.STEP.EVENTS.CLAIMED,
    name: 'Step Claimed Notification',
    description: 'Sent to operator when step is claimed',
    defaultSubject: 'Step Claimed: {{stepId}}',
    defaultBody: 'Step {{stepId}} has been claimed by the operator.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'userName',
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
        subject: 'Step Claimed: {{stepId}}',
        htmlBody: `
        <p>Step <strong>{{stepId}}</strong> has been successfully claimed.</p>
        <p>You are now responsible for managing this step.</p>
      `,
      },
      sms: {
        body: 'Step {{stepId}} claimed successfully.',
        maxLength: 160,
      },
      push: {
        title: 'Step Claimed',
        body: 'You have claimed step {{stepId}}',
      },
      websocket: {
        event: 'step.claimed',
        data: {
          stepId: '{{stepId}}',
          status: 'claimed',
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

  // COMPLETED - Notification to operator when step is completed
  {
    templateId: RabbitMQConfig.STEP.EVENTS.COMPLETED,
    name: 'Step Completed Notification',
    description: 'Sent to operator when step is completed',
    defaultSubject: 'Step Completed: {{stepId}}',
    defaultBody: 'Step {{stepId}} has been marked as completed.',
    variables: [
      'stepId',
      'shipmentId',
      'journeyId',
      'agentId',
      'operatorId',
      'timestamp',
      'userName',
      'completionNotes',
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
        subject: 'Step Completed: {{stepId}}',
        htmlBody: `
        <p>Step <strong>{{stepId}}</strong> has been completed.</p>
        {{#if completionNotes}}
          <p>Notes: {{completionNotes}}</p>
        {{/if}}
        <p>Great job!</p>
      `,
      },
      sms: {
        body: 'Step {{stepId}} completed successfully.',
        maxLength: 160,
      },
      push: {
        title: 'Step Completed',
        body: 'Step {{stepId}} has been completed',
      },
      websocket: {
        event: 'step.completed',
        data: {
          stepId: '{{stepId}}',
          status: 'completed',
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
      'journeyId',
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
