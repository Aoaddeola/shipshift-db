/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBusService } from '../../../shared/rabbitmq/rabbitmq.service.js';
import { Mission, MissionStatus } from '../mission.types.js';
import { MissionUpdateDto } from '../mission-update.dto.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';

export interface MissionCreatedEvent {
  missionId: string;
  curatorId: string;
  fromLocationId: string;
  toLocationId: string;
  journeyIds: string[];
  status: MissionStatus;
  createdAt: string;
  metadata?: {
    description?: string;
    estimatedDuration?: number; // in hours
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface MissionUpdatedEvent {
  missionId: string;
  curatorId: string;
  previousStatus: MissionStatus;
  newStatus?: MissionStatus;
  updatedFields: Partial<MissionUpdateDto>;
  updatedAt: string;
  changedBy?: string;
  reason?: string;
}

export interface MissionStatusChangedEvent {
  missionId: string;
  previousStatus: MissionStatus;
  newStatus: MissionStatus;
  changedBy: string;
  timestamp: string;
  reason?: string;
  metadata?: {
    completionRate?: number;
    journeysCompleted?: number;
    totalJourneys?: number;
  };
}

export interface MissionDeletedEvent {
  missionId: string;
  curatorId: string;
  fromLocationId: string;
  toLocationId: string;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
  journeysAffected: number;
}

export interface JourneyAddedToMissionEvent {
  missionId: string;
  journeyId: string;
  addedAt: string;
  addedBy: string;
  journeyIndex: number;
}

export interface JourneyRemovedFromMissionEvent {
  missionId: string;
  journeyId: string;
  removedAt: string;
  removedBy: string;
  reason?: string;
}

export interface MissionCuratorChangedEvent {
  missionId: string;
  previousCuratorId: string;
  newCuratorId: string;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface MissionLocationChangedEvent {
  missionId: string;
  locationType: 'from' | 'to';
  previousLocationId: string;
  newLocationId: string;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface MissionBatchUpdatedEvent {
  updateCount: number;
  filterCriteria: {
    curatorId?: string;
    fromLocationId?: string;
    toLocationId?: string;
    status?: MissionStatus;
    journeyId?: string;
  };
  updatedFields: Partial<MissionUpdateDto>;
  requestedBy: string;
  timestamp: string;
}

export interface MissionRouteDistance {
  missionId: string;
  fromLocationId: string;
  toLocationId: string;
  distanceKm: number;
  distanceMiles: number;
  estimatedTravelTimeHours: number;
  calculatedAt: string;
}

@Injectable()
export class MissionProducer {
  private readonly logger = new Logger(MissionProducer.name);

  constructor(
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  // ==================== EVENT PUBLISHING METHODS ====================

  async publishMissionCreated(mission: Mission): Promise<boolean> {
    const event: MissionCreatedEvent = {
      missionId: mission.id,
      curatorId: mission.curatorId,
      fromLocationId: mission.fromLocationId,
      toLocationId: mission.toLocationId,
      journeyIds: mission.journeyIds || [],
      status: mission.status,
      createdAt: mission.createdAt || new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.CREATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'created',
            'x-mission-id': mission.id,
            'x-curator-id': mission.curatorId,
            'x-mission-status': mission.status,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.CREATED} for mission ${mission.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.CREATED}:`,
        error,
      );
      return false;
    }
  }

  async publishMissionUpdated(
    missionId: string,
    previousStatus: MissionStatus,
    update: Partial<MissionUpdateDto>,
    changedBy?: string,
    reason?: string,
  ): Promise<boolean> {
    const event: MissionUpdatedEvent = {
      missionId,
      curatorId: update.curatorId || '',
      previousStatus,
      newStatus: update.status,
      updatedFields: update,
      updatedAt: new Date().toISOString(),
      changedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'updated',
            'x-mission-id': missionId,
          },
        },
      );

      // If status changed, publish specific status change event
      if (update.status && update.status !== previousStatus) {
        await this.publishMissionStatusChanged(
          missionId,
          previousStatus,
          update.status,
          changedBy || 'system',
          reason,
        );
      }

      // If curator changed
      if (update.curatorId) {
        // Note: We need previous curator ID - would need to get mission first
        // This is handled in the service layer
      }

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.UPDATED} for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishMissionStatusChanged(
    missionId: string,
    previousStatus: MissionStatus,
    newStatus: MissionStatus,
    changedBy: string,
    reason?: string,
    metadata?: {
      completionRate?: number;
      journeysCompleted?: number;
      totalJourneys?: number;
    },
  ): Promise<boolean> {
    const event: MissionStatusChangedEvent = {
      missionId,
      previousStatus,
      newStatus,
      changedBy,
      timestamp: new Date().toISOString(),
      reason,
      metadata,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.STATUS_CHANGED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'status_changed',
            'x-mission-id': missionId,
            'x-previous-status': previousStatus,
            'x-new-status': newStatus,
          },
        },
      );

      // Publish specific status events
      if (newStatus === MissionStatus.ACTIVE) {
        await this.messageBus.emitEvent(
          RabbitMQConfig.MISSION.EVENTS.ACTIVATED,
          { ...event, activatedAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newStatus === MissionStatus.ARCHIVED) {
        await this.messageBus.emitEvent(
          RabbitMQConfig.MISSION.EVENTS.ARCHIVED,
          { ...event, archivedAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      }

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.STATUS_CHANGED}: ${previousStatus} → ${newStatus} for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.STATUS_CHANGED}:`,
        error,
      );
      return false;
    }
  }

  async publishMissionDeleted(
    mission: Mission,
    deletedBy?: string,
    reason?: string,
  ): Promise<boolean> {
    const event: MissionDeletedEvent = {
      missionId: mission.id,
      curatorId: mission.curatorId,
      fromLocationId: mission.fromLocationId,
      toLocationId: mission.toLocationId,
      deletedAt: new Date().toISOString(),
      deletedBy,
      reason,
      journeysAffected: mission.journeyIds?.length || 0,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.DELETED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'deleted',
            'x-mission-id': mission.id,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.DELETED} for mission ${mission.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.DELETED}:`,
        error,
      );
      return false;
    }
  }

  async publishJourneyAddedToMission(
    missionId: string,
    journeyId: string,
    addedBy: string,
    journeyIndex: number,
  ): Promise<boolean> {
    const event: JourneyAddedToMissionEvent = {
      missionId,
      journeyId,
      addedAt: new Date().toISOString(),
      addedBy,
      journeyIndex,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.JOURNEY_ADDED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'journey_added',
            'x-mission-id': missionId,
            'x-journey-id': journeyId,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.JOURNEY_ADDED} for mission ${missionId}, journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.JOURNEY_ADDED}:`,
        error,
      );
      return false;
    }
  }

  async publishJourneyRemovedFromMission(
    missionId: string,
    journeyId: string,
    removedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: JourneyRemovedFromMissionEvent = {
      missionId,
      journeyId,
      removedAt: new Date().toISOString(),
      removedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.JOURNEY_REMOVED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'journey_removed',
            'x-mission-id': missionId,
            'x-journey-id': journeyId,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.JOURNEY_REMOVED} for mission ${missionId}, journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.JOURNEY_REMOVED}:`,
        error,
      );
      return false;
    }
  }

  async publishMissionCuratorChanged(
    missionId: string,
    previousCuratorId: string,
    newCuratorId: string,
    changedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: MissionCuratorChangedEvent = {
      missionId,
      previousCuratorId,
      newCuratorId,
      changedAt: new Date().toISOString(),
      changedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.CURATOR_CHANGED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'curator_changed',
            'x-mission-id': missionId,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.CURATOR_CHANGED} for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.CURATOR_CHANGED}:`,
        error,
      );
      return false;
    }
  }

  async publishMissionLocationChanged(
    missionId: string,
    locationType: 'from' | 'to',
    previousLocationId: string,
    newLocationId: string,
    changedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: MissionLocationChangedEvent = {
      missionId,
      locationType,
      previousLocationId,
      newLocationId,
      changedAt: new Date().toISOString(),
      changedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.LOCATION_CHANGED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'location_changed',
            'x-mission-id': missionId,
            'x-location-type': locationType,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.LOCATION_CHANGED} for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.LOCATION_CHANGED}:`,
        error,
      );
      return false;
    }
  }

  async publishMissionsBatchUpdated(
    updateCount: number,
    filterCriteria: {
      curatorId?: string;
      fromLocationId?: string;
      toLocationId?: string;
      status?: MissionStatus;
      journeyId?: string;
    },
    updatedFields: Partial<MissionUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event: MissionBatchUpdatedEvent = {
      updateCount,
      filterCriteria,
      updatedFields,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.MISSION.EVENTS.BATCH_UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'mission',
            'x-event-type': 'batch_updated',
            'x-update-count': updateCount.toString(),
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.MISSION.EVENTS.BATCH_UPDATED} for ${updateCount} missions`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.MISSION.EVENTS.BATCH_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  // ==================== COMMAND PUBLISHING METHODS ====================

  async sendCreateMissionCommand(
    missionData: Omit<
      Mission,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'curator'
      | 'journeys'
      | 'fromLocation'
      | 'toLocation'
    >,
    createdBy?: string,
  ): Promise<boolean> {
    const command = {
      ...missionData,
      createdBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.CREATE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_mission`,
            'x-curator-id': missionData.curatorId,
          },
        },
      );

      this.logger.log(`Sent ${RabbitMQConfig.MISSION.COMMANDS.CREATE} command`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.CREATE}:`,
        error,
      );
      return false;
    }
  }

  async sendUpdateMissionCommand(
    missionId: string,
    update: Partial<MissionUpdateDto>,
    updatedBy: string,
  ): Promise<boolean> {
    const command = {
      missionId,
      update,
      updatedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.UPDATE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.UPDATE} command for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.UPDATE}:`,
        error,
      );
      return false;
    }
  }

  async sendChangeMissionStatusCommand(
    missionId: string,
    newStatus: MissionStatus,
    changedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      missionId,
      newStatus,
      changedBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.CHANGE_STATUS,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
            'x-new-status': newStatus,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.CHANGE_STATUS} command for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.CHANGE_STATUS}:`,
        error,
      );
      return false;
    }
  }

  async sendAddJourneyToMissionCommand(
    missionId: string,
    journeyId: string,
    addedBy: string,
  ): Promise<boolean> {
    const command = {
      missionId,
      journeyId,
      addedBy,
      addedAt: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.ADD_JOURNEY,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
            'x-journey-id': journeyId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.ADD_JOURNEY} command for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.ADD_JOURNEY}:`,
        error,
      );
      return false;
    }
  }

  async sendRemoveJourneyFromMissionCommand(
    missionId: string,
    journeyId: string,
    removedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      missionId,
      journeyId,
      removedBy,
      reason,
      removedAt: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.REMOVE_JOURNEY,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
            'x-journey-id': journeyId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.REMOVE_JOURNEY} command for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.REMOVE_JOURNEY}:`,
        error,
      );
      return false;
    }
  }

  async sendAssignCuratorCommand(
    missionId: string,
    curatorId: string,
    assignedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      missionId,
      curatorId,
      assignedBy,
      reason,
      assignedAt: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.ASSIGN_CURATOR,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
            'x-curator-id': curatorId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.ASSIGN_CURATOR} command for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.ASSIGN_CURATOR}:`,
        error,
      );
      return false;
    }
  }

  async sendCalculateRouteCommand(
    missionId: string,
    fromLocationId: string,
    toLocationId: string,
    requestedBy: string,
  ): Promise<boolean> {
    const command = {
      missionId,
      fromLocationId,
      toLocationId,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.CALCULATE_ROUTE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.CALCULATE_ROUTE} command for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.CALCULATE_ROUTE}:`,
        error,
      );
      return false;
    }
  }

  // ==================== RPC METHODS ====================

  async rpcGetMission(missionId: string, include?: string[]): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.MISSION.RPC.GET,
        { missionId, include },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.MISSION.RPC.GET} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcGetMissions(
    filters: {
      curatorId?: string;
      fromLocationId?: string;
      toLocationId?: string;
      status?: MissionStatus;
      journeyId?: string;
    },
    include?: string[],
    limit?: number,
    offset?: number,
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.MISSION.RPC.GET_BATCH,
        { filters, include, limit, offset },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_missions`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.MISSION.RPC.GET_BATCH} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcCreateMission(
    missionData: Omit<
      Mission,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'curator'
      | 'journeys'
      | 'fromLocation'
      | 'toLocation'
    >,
    createdBy?: string,
  ): Promise<Mission> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.MISSION.RPC.CREATE,
        { missionData, createdBy },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_create`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.MISSION.RPC.CREATE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcUpdateMission(
    missionId: string,
    update: Partial<MissionUpdateDto>,
    updatedBy?: string,
  ): Promise<Mission> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.MISSION.RPC.UPDATE,
        { missionId, update, updatedBy },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.MISSION.RPC.UPDATE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcValidateMission(missionId: string): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
    canActivate: boolean;
  }> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.MISSION.RPC.VALIDATE,
        { missionId },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.MISSION.RPC.VALIDATE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcCalculateRouteDistance(
    missionId: string,
  ): Promise<MissionRouteDistance> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.MISSION.RPC.CALCULATE_ROUTE_DISTANCE,
        { missionId },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.MISSION.RPC.CALCULATE_ROUTE_DISTANCE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcGetMissionsByFilters(filters: any): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.MISSION.RPC.GET_BY_FILTERS,
        { filters },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_filters`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.MISSION.RPC.GET_BY_FILTERS} failed:`,
        error,
      );
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  async sendNotifyStakeholdersCommand(
    missionId: string,
    notificationType:
      | 'status_change'
      | 'journey_added'
      | 'curator_assigned'
      | 'location_changed'
      | 'mission_completed',
    message: string,
    sentBy: string,
    stakeholders?: string[],
  ): Promise<boolean> {
    const command = {
      missionId,
      notificationType,
      message,
      sentBy,
      stakeholders,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.NOTIFY_STAKEHOLDERS,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
            'x-notification-type': notificationType,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.NOTIFY_STAKEHOLDERS} for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.NOTIFY_STAKEHOLDERS}:`,
        error,
      );
      return false;
    }
  }

  async sendValidateMissionCommand(
    missionId: string,
    requestedBy: string,
  ): Promise<boolean> {
    const command = {
      missionId,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.MISSION.COMMANDS.VALIDATE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${missionId}`,
            'x-mission-id': missionId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.MISSION.COMMANDS.VALIDATE} command for mission ${missionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.MISSION.COMMANDS.VALIDATE}:`,
        error,
      );
      return false;
    }
  }
}
