export const RabbitMQConfig = {
  // ==================== EXCHANGES ====================
  EXCHANGES: {
    APP_EVENTS: 'app.events', // Topic exchange for all events
    APP_COMMANDS: 'app.commands', // Direct exchange for commands
    APP_RPC: 'app.rpc', // Direct exchange for RPC requests
    APP_DLX: 'app.dlx', // Dead letter exchange
  },

  // ==================== ROUTING KEY PATTERNS ====================
  ROUTING_KEY_PATTERNS: {
    // Event patterns
    EVENT: {
      CREATED: '{entity}.created',
      UPDATED: '{entity}.updated',
      DELETED: '{entity}.deleted',
      STATE_CHANGED: '{entity}.state.changed',
      STATUS_CHANGED: '{entity}.status.changed',
      ASSIGNED: '{entity}.assigned',
      UNASSIGNED: '{entity}.unassigned',
      COMPLETED: '{entity}.completed',
      CANCELLED: '{entity}.cancelled',
      FAILED: '{entity}.failed',
      MILESTONE: '{entity}.milestone.{milestone}',
      BATCH_UPDATED: '{entity}.batch.updated',
      PAYMENT_PROCESSED: '{entity}.payment.processed',
      PAYMENT_FAILED: '{entity}.payment.failed',
    },

    // Command patterns
    COMMAND: {
      PROCESS: 'process.{entity}',
      ASSIGN: 'assign.{entity}',
      UPDATE: 'update.{entity}',
      DELETE: 'delete.{entity}',
      VALIDATE: 'validate.{entity}',
      NOTIFY: 'notify.{entity}',
    },

    // RPC patterns
    RPC: {
      GET: 'rpc.get.{entity}',
      CREATE: 'rpc.create.{entity}',
      UPDATE: 'rpc.update.{entity}',
      VALIDATE: 'rpc.validate.{entity}',
      QUERY: 'rpc.query.{entity}',
    },
  },

  // ==================== STEP MODULE SPECIFIC ====================
  STEP: {
    // Entity name
    ENTITY: 'step',

    // Events
    EVENTS: {
      CREATED: 'step.created',
      UPDATED: 'step.updated',
      DELETED: 'step.deleted',
      STATE_CHANGED: 'step.state.changed',
      COMPLETED: 'step.completed',
      CANCELLED: 'step.cancelled',
      ASSIGNED: 'step.assigned',
      UNASSIGNED: 'step.unassigned',
      MILESTONE: {
        PICKED_UP: 'step.milestone.picked_up',
        DROPPED_OFF: 'step.milestone.dropped_off',
        HANDED_OVER: 'step.milestone.handed_over',
        RECEIVED: 'step.milestone.received',
      },
      BATCH_UPDATED: 'steps.batch.updated',
      PAYMENT_PROCESSED: 'step.payment.processed',
      PAYMENT_FAILED: 'step.payment.failed',
      READY: 'step.ready',
    },

    // Commands
    COMMANDS: {
      PROCESS: 'process.step',
      // ASSIGN_OPERATOR: 'assign.step.operator',
      ASSIGN_AGENT: 'assign.step.agent',
      UPDATE_STATE: 'update.step.state',
      VALIDATE_TRANSITION: 'validate.step.transition',
      NOTIFY_STAKEHOLDERS: 'notify.step.stakeholders',
    },

    // RPC
    RPC: {
      GET: 'rpc.get.step',
      GET_BATCH: 'rpc.get.steps',
      CREATE: 'rpc.create.step',
      UPDATE: 'rpc.update.step',
      VALIDATE_TRANSITION: 'rpc.validate.step.transition',
      QUERY: 'rpc.query.steps',
    },

    // Queues (Consumer side)
    QUEUES: {
      // Event consumers
      EVENT_CREATED: 'steps.event.created.queue',
      EVENT_UPDATED: 'steps.event.updated.queue',
      EVENT_STATE_CHANGED: 'steps.event.state.changed.queue',
      EVENT_COMPLETED: 'steps.event.completed.queue',
      EVENT_CANCELLED: 'steps.event.cancelled.queue',
      EVENT_ASSIGNED: 'steps.event.assigned.queue',
      EVENT_BATCH_UPDATED: 'steps.event.batch.updated.queue',
      EVENT_PAYMENT_PROCESSED: 'steps.event.payment.processed.queue',
      EVENT_MILESTONE_PICKED_UP: 'steps.event.milestone.picked_up.queue',
      EVENT_MILESTONE_DROPPED_OFF: 'steps.event.milestone.dropped_off.queue',

      // Command consumers
      COMMAND_PROCESS: 'steps.command.process.queue',
      COMMAND_ASSIGN_OPERATOR: 'steps.command.assign.operator.queue',
      COMMAND_UPDATE_STATE: 'steps.command.update.state.queue',

      // RPC consumers
      RPC_GET: 'steps.rpc.get.queue',
      RPC_GET_BATCH: 'steps.rpc.get.batch.queue',
      RPC_VALIDATE_TRANSITION: 'steps.rpc.validate.transition.queue',

      // Integration queues (listening to other entities)
      SHIPMENT_CREATED: 'steps.integration.shipment.created.queue',
      JOURNEY_UPDATED: 'steps.integration.journey.updated.queue',
      OPERATOR_ASSIGNED: 'steps.integration.operator.assigned.queue',
    },
  },

  // ==================== OTHER ENTITIES (for reference) ====================
  SHIPMENT: {
    ENTITY: 'shipment',

    // Events
    EVENTS: {
      CREATED: 'shipment.created',
      UPDATED: 'shipment.updated',
      DELETED: 'shipment.deleted',
      STATUS_CHANGED: 'shipment.status.changed',
      ASSIGNED_JOURNEY: 'shipment.assigned.journey',
      ASSIGNED_MISSION: 'shipment.assigned.mission',
      PARCEL_ADDED: 'shipment.parcel.added',
      LOCATION_CHANGED: 'shipment.location.changed',
      BATCH_UPDATED: 'shipments.batch.updated',
      READY_FOR_PICKUP: 'shipment.ready.for.pickup',
      PICKED_UP: 'shipment.picked.up',
      DELIVERED: 'shipment.delivered',
      CANCELLED: 'shipment.cancelled',
      FAILED: 'shipment.failed',
      PAYMENT_PROCESSED: 'shipment.payment.processed',
      PAYMENT_FAILED: 'shipment.payment.failed',
    },

    // Commands
    COMMANDS: {
      PROCESS: 'process.shipment',
      ASSIGN_JOURNEY: 'assign.shipment.journey',
      ASSIGN_MISSION: 'assign.shipment.mission',
      UPDATE_STATUS: 'update.shipment.status',
      UPDATE_LOCATION: 'update.shipment.location',
      VALIDATE: 'validate.shipment',
      NOTIFY_STAKEHOLDERS: 'notify.shipment.stakeholders',
      CANCEL: 'cancel.shipment',
      CREATE_JOURNEY: 'create.shipment.journey',
    },

    // RPC
    RPC: {
      GET: 'rpc.get.shipment',
      GET_BATCH: 'rpc.get.shipments',
      CREATE: 'rpc.create.shipment',
      UPDATE: 'rpc.update.shipment',
      VALIDATE: 'rpc.validate.shipment',
      QUERY: 'rpc.query.shipments',
      GET_WITH_RELATIONS: 'rpc.get.shipment.with.relations',
    },

    // Queues
    QUEUES: {
      // Event consumers
      EVENT_CREATED: 'shipments.event.created.queue',
      EVENT_UPDATED: 'shipments.event.updated.queue',
      EVENT_STATUS_CHANGED: 'shipments.event.status.changed.queue',
      EVENT_DELETED: 'shipments.event.deleted.queue',
      EVENT_ASSIGNED_JOURNEY: 'shipments.event.assigned.journey.queue',
      EVENT_ASSIGNED_MISSION: 'shipments.event.assigned.mission.queue',
      EVENT_BATCH_UPDATED: 'shipments.event.batch.updated.queue',
      EVENT_READY_FOR_PICKUP: 'shipments.event.ready.for.pickup.queue',
      EVENT_PICKED_UP: 'shipments.event.picked.up.queue',
      EVENT_DELIVERED: 'shipments.event.delivered.queue',

      // Command consumers
      COMMAND_PROCESS: 'shipments.command.process.queue',
      COMMAND_ASSIGN_JOURNEY: 'shipments.command.assign.journey.queue',
      COMMAND_UPDATE_STATUS: 'shipments.command.update.status.queue',
      COMMAND_CREATE_JOURNEY: 'shipments.command.create.journey.queue',

      // RPC consumers
      RPC_GET: 'shipments.rpc.get.queue',
      RPC_GET_BATCH: 'shipments.rpc.get.batch.queue',
      RPC_VALIDATE: 'shipments.rpc.validate.queue',
      RPC_GET_WITH_RELATIONS: 'shipments.rpc.get.with.relations.queue',

      // Integration queues (listening to other entities)
      PARCEL_CREATED: 'shipments.integration.parcel.created.queue',
      LOCATION_CREATED: 'shipments.integration.location.created.queue',
      MISSION_CREATED: 'shipments.integration.mission.created.queue',
      JOURNEY_CREATED: 'shipments.integration.journey.created.queue',
      STEP_CREATED: 'shipments.integration.step.created.queue',
      STEP_STATE_CHANGED: 'shipments.integration.step.state.changed.queue',
      CUSTOMER_CREATED: 'shipments.integration.customer.created.queue',
    },
  },

  MISSION: {
    ENTITY: 'mission',
    EVENTS: {
      CREATED: 'mission.created',
      UPDATED: 'mission.updated',
      DELETED: 'mission.deleted',
      STATUS_CHANGED: 'mission.status.changed',
      JOURNEY_ADDED: 'mission.journey.added',
      JOURNEY_REMOVED: 'mission.journey.removed',
      CURATOR_CHANGED: 'mission.curator.changed',
      LOCATION_CHANGED: 'mission.location.changed',
      BATCH_UPDATED: 'missions.batch.updated',
      ARCHIVED: 'mission.archived',
      ACTIVATED: 'mission.activated',
      COMPLETED: 'mission.completed',
    },
    COMMANDS: {
      CREATE: 'create.mission',
      UPDATE: 'update.mission',
      DELETE: 'delete.mission',
      CHANGE_STATUS: 'change.mission.status',
      ADD_JOURNEY: 'add.mission.journey',
      REMOVE_JOURNEY: 'remove.mission.journey',
      ASSIGN_CURATOR: 'assign.mission.curator',
      CALCULATE_ROUTE: 'calculate.mission.route',
      VALIDATE: 'validate.mission',
      NOTIFY_STAKEHOLDERS: 'notify.mission.stakeholders',
    },
    RPC: {
      GET: 'rpc.get.mission',
      GET_BATCH: 'rpc.get.missions',
      CREATE: 'rpc.create.mission',
      UPDATE: 'rpc.update.mission',
      VALIDATE: 'rpc.validate.mission',
      GET_BY_FILTERS: 'rpc.get.missions.by.filters',
      CALCULATE_ROUTE_DISTANCE: 'rpc.calculate.mission.route.distance',
    },
    QUEUES: {
      EVENT_CREATED: 'missions.event.created.queue',
      EVENT_UPDATED: 'missions.event.updated.queue',
      EVENT_STATUS_CHANGED: 'missions.event.status.changed.queue',
      EVENT_DELETED: 'missions.event.deleted.queue',
      COMMAND_CREATE: 'missions.command.create.queue',
      COMMAND_UPDATE: 'missions.command.update.queue',
      COMMAND_CHANGE_STATUS: 'missions.command.change.status.queue',
      RPC_GET: 'missions.rpc.get.queue',
      RPC_GET_BATCH: 'missions.rpc.get.batch.queue',
      JOURNEY_EVENTS: 'missions.integration.journey.updated.queue',
      LOCATION_EVENTS: 'missions.integration.location.updated.queue',
      OPERATOR_EVENTS: 'missions.integration.operator.updated.queue',
    },
  },

  PARCEL: {
    ENTITY: 'parcel',
    EVENTS: {
      CREATED: 'parcel.created',
      UPDATED: 'parcel.updated',
      DELETED: 'parcel.deleted',
      VALUE_UPDATED: 'parcel.value.updated',
      HANDLING_INFO_UPDATED: 'parcel.handling_info.updated',
      OWNER_CHANGED: 'parcel.owner.changed',
      STATUS_CHANGED: 'parcel.status.changed',
      BATCH_UPDATED: 'parcels.batch.updated',
      FRAGILE_ALERT: 'parcel.fragile.alert',
      PERISHABLE_ALERT: 'parcel.perishable.alert',
    },
    COMMANDS: {
      CREATE: 'create.parcel',
      UPDATE: 'update.parcel',
      DELETE: 'delete.parcel',
      VALIDATE_HANDLING: 'validate.parcel.handling',
      PROCESS_FRAGILE: 'process.parcel.fragile',
      PROCESS_PERISHABLE: 'process.parcel.perishable',
      UPDATE_VALUE: 'update.parcel.value',
      TRANSFER_OWNERSHIP: 'transfer.parcel.ownership',
    },
    RPC: {
      GET: 'rpc.get.parcel',
      GET_BATCH: 'rpc.get.parcels',
      CREATE: 'rpc.create.parcel',
      UPDATE: 'rpc.update.parcel',
      CALCULATE_TOTAL_VALUE: 'rpc.calculate.parcels.value',
      VALIDATE_HANDLING: 'rpc.validate.parcel.handling',
      GET_BY_OWNER: 'rpc.get.parcels.by.owner',
      GET_BY_CURRENCY: 'rpc.get.parcels.by.currency',
    },
    QUEUES: {
      EVENT_CREATED: 'parcels.event.created.queue',
      EVENT_UPDATED: 'parcels.event.updated.queue',
      EVENT_DELETED: 'parcels.event.deleted.queue',
      EVENT_FRAGILE_ALERT: 'parcels.event.fragile.alert.queue',
      COMMAND_CREATE: 'parcels.command.create.queue',
      COMMAND_UPDATE: 'parcels.command.update.queue',
      RPC_GET: 'parcels.rpc.get.queue',
      RPC_GET_BATCH: 'parcels.rpc.get.batch.queue',
      USER_EVENTS: 'parcels.integration.user.updated.queue',
      CURRENCY_EVENTS: 'parcels.integration.currency.updated.queue',
    },
  },

  LOCATION: {
    ENTITY: 'location',
    EVENTS: {
      CREATED: 'location.created',
      UPDATED: 'location.updated',
      DELETED: 'location.deleted',
      COORDINATES_UPDATED: 'location.coordinates.updated',
      OWNER_CHANGED: 'location.owner.changed',
      BATCH_UPDATED: 'locations.batch.updated',
    },
    COMMANDS: {
      CREATE: 'create.location',
      UPDATE: 'update.location',
      DELETE: 'delete.location',
      VALIDATE_COORDINATES: 'validate.location.coordinates',
      CALCULATE_DISTANCE: 'calculate.location.distance',
      FIND_NEARBY: 'find.location.nearby',
    },
    RPC: {
      GET: 'rpc.get.location',
      GET_BATCH: 'rpc.get.locations',
      CREATE: 'rpc.create.location',
      UPDATE: 'rpc.update.location',
      CALCULATE_DISTANCE: 'rpc.calculate.distance',
      FIND_NEARBY: 'rpc.find.nearby.locations',
      VALIDATE_ADDRESS: 'rpc.validate.address',
    },
    QUEUES: {
      EVENT_CREATED: 'locations.event.created.queue',
      EVENT_UPDATED: 'locations.event.updated.queue',
      EVENT_DELETED: 'locations.event.deleted.queue',
      COMMAND_CREATE: 'locations.command.create.queue',
      COMMAND_UPDATE: 'locations.command.update.queue',
      RPC_GET: 'locations.rpc.get.queue',
      RPC_FIND_NEARBY: 'locations.rpc.find.nearby.queue',
      RPC_CREATE: 'locations.rpc.create.queue',
      USER_EVENTS: 'locations.integration.user.updated.queue',
    },
  },

  // Add to RabbitMQConfig object
  JOURNEY: {
    ENTITY: 'journey',

    EVENTS: {
      CREATED: 'journey.created',
      UPDATED: 'journey.updated',
      DELETED: 'journey.deleted',
      STATUS_CHANGED: 'journey.status.changed',
      AVAILABLE: 'journey.available',
      BOOKED: 'journey.booked',
      COMPLETED: 'journey.completed',
      CANCELLED: 'journey.cancelled',
      CAPACITY_UPDATED: 'journey.capacity.updated',
      PRICE_UPDATED: 'journey.price.updated',
      LOCATION_UPDATED: 'journey.location.updated',
      AGENT_ASSIGNED: 'journey.agent.assigned',
      AGENT_UNASSIGNED: 'journey.agent.unassigned',
      PARCEL_HANDLING_UPDATED: 'journey.parcel.handling.updated',
      AVAILABILITY_CHANGED: 'journey.availability.changed',
    },

    COMMANDS: {
      PROCESS: 'process.journey',
      BOOK: 'book.journey',
      CANCEL: 'cancel.journey',
      COMPLETE: 'complete.journey',
      UPDATE_STATUS: 'update.journey.status',
      UPDATE_CAPACITY: 'update.journey.capacity',
      UPDATE_PRICE: 'update.journey.price',
      UPDATE_LOCATION: 'update.journey.location',
      ASSIGN_AGENT: 'assign.journey.agent',
      VALIDATE_BOOKING: 'validate.journey.booking',
      NOTIFY_STAKEHOLDERS: 'notify.journey.stakeholders',
    },

    RPC: {
      GET: 'rpc.get.journey',
      GET_BATCH: 'rpc.get.journeys',
      CREATE: 'rpc.create.journey',
      UPDATE: 'rpc.update.journey',
      VALIDATE_BOOKING: 'rpc.validate.journey.booking',
      QUERY_AVAILABLE: 'rpc.query.journeys.available',
      CHECK_CAPACITY: 'rpc.check.journey.capacity',
      GET_BY_AGENT: 'rpc.get.journeys.by.agent',
      GET_BY_LOCATION: 'rpc.get.journeys.by.location',
    },

    QUEUES: {
      // Event consumers
      EVENT_CREATED: 'journeys.event.created.queue',
      EVENT_UPDATED: 'journeys.event.updated.queue',
      EVENT_STATUS_CHANGED: 'journeys.event.status.changed.queue',
      EVENT_BOOKED: 'journeys.event.booked.queue',
      EVENT_COMPLETED: 'journeys.event.completed.queue',
      EVENT_CANCELLED: 'journeys.event.cancelled.queue',
      EVENT_CAPACITY_UPDATED: 'journeys.event.capacity.updated.queue',
      EVENT_PRICE_UPDATED: 'journeys.event.price.updated.queue',
      EVENT_AGENT_ASSIGNED: 'journeys.event.agent.assigned.queue',

      // Command consumers
      COMMAND_PROCESS: 'journeys.command.process.queue',
      COMMAND_BOOK: 'journeys.command.book.queue',
      COMMAND_CANCEL: 'journeys.command.cancel.queue',
      COMMAND_COMPLETE: 'journeys.command.complete.queue',
      COMMAND_UPDATE_STATUS: 'journeys.command.update.status.queue',
      COMMAND_ASSIGN_AGENT: 'journeys.command.assign.agent.queue',

      // RPC consumers
      RPC_GET: 'journeys.rpc.get.queue',
      RPC_GET_BATCH: 'journeys.rpc.get.batch.queue',
      RPC_VALIDATE_BOOKING: 'journeys.rpc.validate.booking.queue',
      RPC_QUERY_AVAILABLE: 'journeys.rpc.query.available.queue',
      RPC_CHECK_CAPACITY: 'journeys.rpc.check.capacity.queue',

      // Integration queues (listening to other entities)
      STEP_CREATED: 'journeys.integration.step.created.queue',
      STEP_STATE_CHANGED: 'journeys.integration.step.state.changed.queue',
      SHIPMENT_CREATED: 'journeys.integration.shipment.created.queue',
      AGENT_CREATED: 'journeys.integration.agent.created.queue',
      AGENT_UPDATED: 'journeys.integration.agent.updated.queue',
      LOCATION_CREATED: 'journeys.integration.location.created.queue',
      LOCATION_UPDATED: 'journeys.integration.location.updated.queue',
    },
  },

  // Add to RabbitMQConfig object
  OFFER: {
    ENTITY: 'offer',
    EVENTS: {
      CREATED: 'offer.created',
      UPDATED: 'offer.updated',
      DELETED: 'offer.deleted',
      BID_ACCEPTED: 'offer.bid.accepted',
      BID_REJECTED: 'offer.bid.rejected',
      BATCH_UPDATED: 'offers.batch.updated',
    },
    COMMANDS: {
      CREATE: 'create.offer',
      UPDATE: 'update.offer',
      DELETE: 'delete.offer',
      ACCEPT_BID: 'accept.offer.bid',
      REJECT_BID: 'reject.offer.bid',
      VALIDATE: 'validate.offer',
    },
    RPC: {
      GET: 'rpc.get.offer',
      GET_BATCH: 'rpc.get.offers',
      CREATE: 'rpc.create.offer',
      UPDATE: 'rpc.update.offer',
      VALIDATE: 'rpc.validate.offer',
    },
    QUEUES: {
      EVENT_CREATED: 'offers.event.created.queue',
      EVENT_UPDATED: 'offers.event.updated.queue',
      EVENT_DELETED: 'offers.event.deleted.queue',
      EVENT_BID_ACCEPTED: 'offers.event.bid.accepted.queue',
      EVENT_BID_REJECTED: 'offers.event.bid.rejected.queue',
      EVENT_BATCH_UPDATED: 'offers.event.batch.updated.queue',
      COMMAND_CREATE: 'offers.command.create.queue',
      COMMAND_ACCEPT_BID: 'offers.command.accept.bid.queue',
      COMMAND_REJECT_BID: 'offers.command.reject.bid.queue',
      COMMAND_VALIDATE: 'offers.command.validate.queue',
      RPC_GET: 'offers.rpc.get.queue',
      RPC_GET_BATCH: 'offers.rpc.get.batch.queue',
      RPC_VALIDATE: 'offers.rpc.validate.queue',
      SHIPMENT_CREATED: 'offers.integration.shipment.created.queue',
      MISSION_UPDATED: 'offers.integration.mission.updated.queue',
      JOURNEY_UPDATED: 'offers.integration.journey.updated.queue',
    },
  },

  AGENT: {
    ENTITY: 'agent',
    EVENTS: {
      CREATED: 'agent.created',
      UPDATED: 'agent.updated',
      DELETED: 'agent.deleted',
      STATUS_CHANGED: 'agent.status.changed',
      AVAILABLE: 'agent.available',
      UNAVAILABLE: 'agent.unavailable',
    },
  },

  OPERATOR: {
    ENTITY: 'operator',
    EVENTS: {
      CREATED: 'operator.created',
      ASSIGNED: 'operator.assigned',
      UNAVAILABLE: 'operator.unavailable',
    },
  },

  NOTIFICATION: {
    ENTITY: 'notification',

    EVENTS: {
      REQUESTED: 'notification.requested',
      SENT: 'notification.sent',
      FAILED: 'notification.failed',
      READ: 'notification.read',
    },

    COMMANDS: {
      SEND: 'send.notification',
      RETRY: 'retry.notification',
      CANCEL: 'cancel.notification',
    },

    QUEUES: {
      PROCESS_NOTIFICATION: 'notifications.process.queue',
      RETRY_NOTIFICATION: 'notifications.retry.queue',
      DLQ: 'notifications.dlq',
    },
  },
  // ==================== QUEUE OPTIONS TEMPLATES ====================
  QUEUE_OPTIONS: {
    DEFAULT: {
      durable: true,
      arguments: {
        'x-queue-type': 'classic',
      },
    },

    WITH_DLQ: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'app.dlx',
        'x-dead-letter-routing-key': 'dlq.{queueName}',
        'x-message-ttl': 60000, // 60 seconds
        'x-max-length': 10000,
      },
    },

    RPC: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-queue-type': 'classic',
        'x-max-priority': 10,
      },
    },

    WORKER: {
      durable: true,
      arguments: {
        'x-queue-type': 'quorum', // For clustered environments
        'x-quorum-initial-group-size': 3,
        'x-message-ttl': 300000, // 5 minutes
      },
    },
  },

  // ==================== UTILITY FUNCTIONS ====================
  Utils: {
    /**
     * Generate routing key for events
     */
    eventRoutingKey(entity: string, eventType: string): string {
      return `${entity}.${eventType}`;
    },

    /**
     * Generate routing key for commands
     */
    commandRoutingKey(command: string, entity: string): string {
      return `${command}.${entity}`;
    },

    /**
     * Generate routing key for RPC
     */
    rpcRoutingKey(action: string, entity: string): string {
      return `rpc.${action}.${entity}`;
    },

    /**
     * Generate queue name with consistent pattern
     */
    queueName(
      prefix: string,
      entity: string,
      action: string,
      suffix: string = 'queue',
    ): string {
      return `${prefix}.${entity}.${action}.${suffix}`.toLowerCase();
    },

    /**
     * Generate DLQ routing key
     */
    dlqRoutingKey(queueName: string): string {
      return `dlq.${queueName}`;
    },

    /**
     * Get queue options with DLQ
     */
    withDLQ(queueName: string, customOptions: any = {}) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
        arguments: {
          ...RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ.arguments,
          'x-dead-letter-routing-key': this.dlqRoutingKey(queueName),
        },
        ...customOptions,
      };
    },
  },
} as const;

// Type exports
export type RabbitMQConfigType = typeof RabbitMQConfig;
export type StepEventKeys = keyof typeof RabbitMQConfig.STEP.EVENTS;
export type StepCommandKeys = keyof typeof RabbitMQConfig.STEP.COMMANDS;
export type StepRpcKeys = keyof typeof RabbitMQConfig.STEP.RPC;
