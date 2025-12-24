/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { MissionService } from '../mission.service.js';
import { MissionStatus } from '../mission.types.js';
import { MissionProducer } from '../producers/mission.producer.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';
import { MissionUpdateDto } from '../mission-update.dto.js';

@Injectable()
export class MissionConsumer {
  private readonly logger = new Logger(MissionConsumer.name);

  constructor(
    @Inject(MissionService)
    private readonly missionService: MissionService,
    @Inject(MissionProducer)
    private readonly missionProducer: MissionProducer,
  ) {}

  // ==================== COMMAND HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.MISSION.COMMANDS.CREATE,
    queue: RabbitMQConfig.MISSION.QUEUES.COMMAND_CREATE,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.MISSION.QUEUES.COMMAND_CREATE,
    ),
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('MissionConsumer-CreateCommand');
      logger.error(
        `Failed to process ${RabbitMQConfig.MISSION.COMMANDS.CREATE}:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleCreateMissionCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.MISSION.COMMANDS.CREATE} command`,
    );

    try {
      //   const { createdBy, timestamp, ...missionData } = command;

      // Create the mission
      const mission = await this.missionService.createMission(command.data);

      // Publish creation event
      await this.missionProducer.publishMissionCreated(mission);

      this.logger.log(`Successfully created mission: ${mission.id}`);
    } catch (error) {
      this.logger.error(`Failed to create mission from command:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.MISSION.COMMANDS.UPDATE,
    queue: RabbitMQConfig.MISSION.QUEUES.COMMAND_UPDATE,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.MISSION.QUEUES.COMMAND_UPDATE,
    ),
  })
  async handleUpdateMissionCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.MISSION.COMMANDS.UPDATE} for mission ${command.missionId}`,
    );

    try {
      const { missionId, update, updatedBy } = command;

      // Get existing mission for comparison
      const existingMission = await this.missionService.getMission(missionId);

      // Update the mission
      await this.missionService.partialUpdateMission(missionId, update);

      // Check what changed
      const changes: Partial<MissionUpdateDto> = {};
      if (update.curatorId && update.curatorId !== existingMission.curatorId) {
        changes.curatorId = update.curatorId;
      }
      if (update.status && update.status !== existingMission.status) {
        changes.status = update.status;
      }
      if (
        update.fromLocationId &&
        update.fromLocationId !== existingMission.fromLocationId
      ) {
        changes.fromLocationId = update.fromLocationId;
      }
      if (
        update.toLocationId &&
        update.toLocationId !== existingMission.toLocationId
      ) {
        changes.toLocationId = update.toLocationId;
      }
      if (
        update.journeyIds &&
        JSON.stringify(update.journeyIds) !==
          JSON.stringify(existingMission.journeyIds)
      ) {
        changes.journeyIds = update.journeyIds;
      }

      // Publish update event
      await this.missionProducer.publishMissionUpdated(
        missionId,
        existingMission.status,
        changes,
        updatedBy,
        'Command update',
      );

      this.logger.log(`Successfully updated mission: ${missionId}`);
    } catch (error) {
      this.logger.error(`Failed to update mission from command:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.MISSION.COMMANDS.CHANGE_STATUS,
    queue: RabbitMQConfig.MISSION.QUEUES.COMMAND_CHANGE_STATUS,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.MISSION.QUEUES.COMMAND_CHANGE_STATUS,
    ),
  })
  async handleChangeMissionStatusCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.MISSION.COMMANDS.CHANGE_STATUS} for mission ${command.missionId}`,
    );

    try {
      const { missionId, newStatus, changedBy, reason } = command;

      // Get existing mission
      const existingMission = await this.missionService.getMission(missionId);

      // Update mission status
      await this.missionService.partialUpdateMission(missionId, {
        status: newStatus,
      });

      // Publish status change event
      await this.missionProducer.publishMissionStatusChanged(
        missionId,
        existingMission.status,
        newStatus,
        changedBy,
        reason,
      );

      // If mission is being activated from draft, validate it first
      if (
        existingMission.status === MissionStatus.DRAFT &&
        newStatus === MissionStatus.ACTIVE
      ) {
        await this.missionProducer.sendValidateMissionCommand(
          missionId,
          changedBy,
        );
      }

      this.logger.log(
        `Changed mission ${missionId} status from ${existingMission.status} to ${newStatus}`,
      );
    } catch (error) {
      this.logger.error(`Failed to change mission status:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.MISSION.COMMANDS.ADD_JOURNEY,
    queue: 'missions.command.add.journey.queue',
  })
  async handleAddJourneyToMissionCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.MISSION.COMMANDS.ADD_JOURNEY} for mission ${command.missionId}`,
    );

    try {
      const { missionId, journeyId, addedBy } = command;

      // Get existing mission
      const mission = await this.missionService.getMission(missionId);

      // Check if journey already exists
      if (mission.journeyIds.includes(journeyId)) {
        this.logger.warn(
          `Journey ${journeyId} already exists in mission ${missionId}`,
        );
        return;
      }

      // Add journey to mission
      const updatedJourneyIds = [...mission.journeyIds, journeyId];
      await this.missionService.partialUpdateMission(missionId, {
        journeyIds: updatedJourneyIds,
      });

      // Publish journey added event
      await this.missionProducer.publishJourneyAddedToMission(
        missionId,
        journeyId,
        addedBy,
        updatedJourneyIds.length - 1, // journey index
      );

      this.logger.log(`Added journey ${journeyId} to mission ${missionId}`);
    } catch (error) {
      this.logger.error(`Failed to add journey to mission:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.MISSION.COMMANDS.REMOVE_JOURNEY,
    queue: 'missions.command.remove.journey.queue',
  })
  async handleRemoveJourneyFromMissionCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.MISSION.COMMANDS.REMOVE_JOURNEY} for mission ${command.missionId}`,
    );

    try {
      const { missionId, journeyId, removedBy, reason } = command;

      // Get existing mission
      const mission = await this.missionService.getMission(missionId);

      // Check if journey exists
      if (!mission.journeyIds.includes(journeyId)) {
        this.logger.warn(
          `Journey ${journeyId} not found in mission ${missionId}`,
        );
        return;
      }

      // Remove journey from mission
      const updatedJourneyIds = mission.journeyIds.filter(
        (id) => id !== journeyId,
      );
      await this.missionService.partialUpdateMission(missionId, {
        journeyIds: updatedJourneyIds,
      });

      // Publish journey removed event
      await this.missionProducer.publishJourneyRemovedFromMission(
        missionId,
        journeyId,
        removedBy,
        reason,
      );

      this.logger.log(`Removed journey ${journeyId} from mission ${missionId}`);
    } catch (error) {
      this.logger.error(`Failed to remove journey from mission:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.MISSION.COMMANDS.ASSIGN_CURATOR,
    queue: 'missions.command.assign.curator.queue',
  })
  async handleAssignCuratorCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.MISSION.COMMANDS.ASSIGN_CURATOR} for mission ${command.missionId}`,
    );

    try {
      const { missionId, curatorId, assignedBy, reason } = command;

      // Get existing mission
      const existingMission = await this.missionService.getMission(missionId);

      // Update mission curator
      await this.missionService.partialUpdateMission(missionId, {
        curatorId,
      });

      // Publish curator changed event
      await this.missionProducer.publishMissionCuratorChanged(
        missionId,
        existingMission.curatorId,
        curatorId,
        assignedBy,
        reason,
      );

      this.logger.log(`Assigned curator ${curatorId} to mission ${missionId}`);
    } catch (error) {
      this.logger.error(`Failed to assign curator to mission:`, error);
      throw error;
    }
  }

  // ==================== RPC HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.MISSION.RPC.GET,
    queue: RabbitMQConfig.MISSION.QUEUES.RPC_GET,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetMissionRPC(request: {
    missionId: string;
    include?: string[];
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.MISSION.RPC.GET} for mission ${request.missionId}`,
    );

    try {
      const mission = await this.missionService.getMission(
        request.missionId,
        request.include,
      );

      return {
        success: true,
        data: mission,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`RPC ${RabbitMQConfig.MISSION.RPC.GET} failed:`, error);

      return {
        success: false,
        error: error.message,
        errorCode: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.MISSION.RPC.GET_BATCH,
    queue: RabbitMQConfig.MISSION.QUEUES.RPC_GET_BATCH,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetMissionsRPC(request: {
    filters: any;
    include?: string[];
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.MISSION.RPC.GET_BATCH} with filters`,
      request.filters,
    );

    try {
      // Use appropriate service method based on filters
      let missions: any[] = [];

      const { curatorId, fromLocationId, toLocationId, status, journeyId } =
        request.filters || {};

      if (curatorId && fromLocationId && toLocationId && status) {
        missions = await this.missionService.getMissionsByAllFilters(
          curatorId,
          fromLocationId,
          toLocationId,
          status,
          request.include,
        );
      } else if (curatorId && fromLocationId && toLocationId) {
        missions = await this.missionService.getMissionsByCuratorAndLocations(
          curatorId,
          fromLocationId,
          toLocationId,
          request.include,
        );
      } else if (curatorId && fromLocationId && status) {
        missions =
          await this.missionService.getMissionsByCuratorFromLocationAndStatus(
            curatorId,
            fromLocationId,
            status,
            request.include,
          );
      } else if (curatorId && toLocationId && status) {
        missions =
          await this.missionService.getMissionsByCuratorToLocationAndStatus(
            curatorId,
            toLocationId,
            status,
            request.include,
          );
      } else if (fromLocationId && toLocationId && status) {
        missions = await this.missionService.getMissionsByLocationsAndStatus(
          fromLocationId,
          toLocationId,
          status,
          request.include,
        );
      } else if (curatorId && fromLocationId) {
        missions =
          await this.missionService.getMissionsByCuratorAndFromLocation(
            curatorId,
            fromLocationId,
            request.include,
          );
      } else if (curatorId && toLocationId) {
        missions = await this.missionService.getMissionsByCuratorAndToLocation(
          curatorId,
          toLocationId,
          request.include,
        );
      } else if (curatorId && status) {
        missions = await this.missionService.getMissionsByCuratorAndStatus(
          curatorId,
          status,
          request.include,
        );
      } else if (fromLocationId && toLocationId) {
        missions = await this.missionService.getMissionsByLocations(
          fromLocationId,
          toLocationId,
          request.include,
        );
      } else if (fromLocationId && status) {
        missions = await this.missionService.getMissionsByFromLocationAndStatus(
          fromLocationId,
          status,
          request.include,
        );
      } else if (toLocationId && status) {
        missions = await this.missionService.getMissionsByToLocationAndStatus(
          toLocationId,
          status,
          request.include,
        );
      } else if (curatorId) {
        missions = await this.missionService.getMissionsByCurator(
          curatorId,
          request.include,
        );
      } else if (fromLocationId) {
        missions = await this.missionService.getMissionsByFromLocation(
          fromLocationId,
          request.include,
        );
      } else if (toLocationId) {
        missions = await this.missionService.getMissionsByToLocation(
          toLocationId,
          request.include,
        );
      } else if (status) {
        missions = await this.missionService.getMissionsByStatus(
          status,
          request.include,
        );
      } else if (journeyId) {
        // This filter doesn't exist in your service, would need to implement
        missions = await this.missionService.getMissions(request.include);
        missions = missions.filter((mission) =>
          mission.journeyIds.includes(journeyId),
        );
      } else {
        missions = await this.missionService.getMissions(request.include);
      }

      // Apply pagination
      let result = missions;
      if (request.limit || request.offset) {
        const offset = request.offset || 0;
        const limit = request.limit || missions.length;
        result = missions.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: result,
        count: result.length,
        total: missions.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.MISSION.RPC.GET_BATCH} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.MISSION.RPC.CREATE,
    queue: 'missions.rpc.create.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleCreateMissionRPC(request: {
    missionData: any;
    createdBy?: string;
  }) {
    this.logger.log(`RPC: ${RabbitMQConfig.MISSION.RPC.CREATE}`);

    try {
      const mission = await this.missionService.createMission(
        request.missionData,
      );

      // Publish creation event
      await this.missionProducer.publishMissionCreated(mission);

      return {
        success: true,
        data: mission,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.MISSION.RPC.CREATE} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.MISSION.RPC.VALIDATE,
    queue: 'missions.rpc.validate.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleValidateMissionRPC(request: { missionId: string }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.MISSION.RPC.VALIDATE} for mission ${request.missionId}`,
    );

    try {
      const mission = await this.missionService.getMission(request.missionId);

      // Perform validation
      const issues: string[] = [];
      const warnings: string[] = [];

      // Validate curator exists
      if (!mission.curatorId) {
        issues.push('Mission must have a curator assigned');
      }

      // Validate locations exist
      if (!mission.fromLocationId) {
        issues.push('Mission must have a from location');
      }

      if (!mission.toLocationId) {
        issues.push('Mission must have a to location');
      }

      // Validate at least one journey for active missions
      if (
        mission.status === MissionStatus.ACTIVE &&
        (!mission.journeyIds || mission.journeyIds.length === 0)
      ) {
        warnings.push('Active mission should have at least one journey');
      }

      // Can activate if no critical issues
      const canActivate = issues.length === 0;

      return {
        success: true,
        data: {
          valid: issues.length === 0,
          issues,
          warnings,
          canActivate,
          missionId: mission.id,
          status: mission.status,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.MISSION.RPC.VALIDATE} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.MISSION.RPC.GET_BY_FILTERS,
    queue: 'missions.rpc.get.by.filters.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetMissionsByFiltersRPC(request: { filters: any }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.MISSION.RPC.GET_BY_FILTERS}`,
      request.filters,
    );

    try {
      // This would be a more flexible filter implementation
      const allMissions = await this.missionService.getMissions();

      // Apply filters dynamically
      let filteredMissions = allMissions;
      for (const [key, value] of Object.entries(request.filters || {})) {
        if (value !== undefined) {
          filteredMissions = filteredMissions.filter((mission) => {
            if (key === 'journeyId') {
              return mission.journeyIds?.includes(value as string);
            }
            return (mission as any)[key] === value;
          });
        }
      }

      return {
        success: true,
        data: filteredMissions,
        count: filteredMissions.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.MISSION.RPC.GET_BY_FILTERS} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== INTEGRATION EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'journey.updated',
    queue: RabbitMQConfig.MISSION.QUEUES.JOURNEY_EVENTS,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.MISSION.QUEUES.JOURNEY_EVENTS,
    ),
  })
  async handleJourneyUpdated(event: any) {
    this.logger.log(
      `Processing journey.updated event for journey ${event.journeyId}`,
    );

    try {
      // Check if this journey is part of any mission
      const allMissions = await this.missionService.getMissions(['journeys']);

      const affectedMissions = allMissions.filter((mission) =>
        mission.journeyIds?.includes(event.journeyId),
      );

      if (affectedMissions.length > 0) {
        this.logger.log(
          `Journey ${event.journeyId} update affects ${affectedMissions.length} missions`,
        );

        // Update mission status or metadata if needed
        for (const mission of affectedMissions) {
          // If journey was completed, check if all journeys are completed
          if (event.status === 'completed') {
            // This would require checking all journey statuses
            // For now, just log
            this.logger.log(
              `Journey ${event.journeyId} completed in mission ${mission.id}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process journey.updated event:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'location.updated',
    queue: RabbitMQConfig.MISSION.QUEUES.LOCATION_EVENTS,
  })
  async handleLocationUpdated(event: any) {
    this.logger.log(
      `Processing location.updated event for location ${event.locationId}`,
    );

    try {
      // Get missions that use this location as from or to location
      const missionsFrom = await this.missionService.getMissionsByFromLocation(
        event.locationId,
      );
      const missionsTo = await this.missionService.getMissionsByToLocation(
        event.locationId,
      );

      const affectedMissions = [...missionsFrom, ...missionsTo];

      if (affectedMissions.length > 0) {
        this.logger.log(
          `Location ${event.locationId} update affects ${affectedMissions.length} missions`,
        );

        // If location coordinates changed, recalculate route distances
        if (event.updatedFields?.coordinates) {
          for (const mission of affectedMissions) {
            await this.missionProducer.sendCalculateRouteCommand(
              mission.id,
              mission.fromLocationId,
              mission.toLocationId,
              'system',
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process location.updated event:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'operator.updated',
    queue: RabbitMQConfig.MISSION.QUEUES.OPERATOR_EVENTS,
  })
  async handleOperatorUpdated(event: any) {
    this.logger.log(
      `Processing operator.updated event for operator ${event.operatorId}`,
    );

    try {
      // Check if this operator is a curator for any missions
      const missions = await this.missionService.getMissionsByCurator(
        event.operatorId,
      );

      if (missions.length > 0) {
        this.logger.log(
          `Operator ${event.operatorId} update affects ${missions.length} missions as curator`,
        );

        // If operator status changed to unavailable, reassign missions
        if (event.updatedFields?.status === 'unavailable') {
          this.logger.warn(
            `Operator ${event.operatorId} is now unavailable, affecting ${missions.length} missions`,
          );
          // In a real system, you might want to trigger reassignment
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process operator.updated event:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'operator.deleted',
    queue: 'missions.integration.operator.deleted.queue',
  })
  async handleOperatorDeleted(event: any) {
    this.logger.log(
      `Processing operator.deleted event for operator ${event.operatorId}`,
    );

    try {
      // Get missions where this operator is the curator
      const missions = await this.missionService.getMissionsByCurator(
        event.operatorId,
      );

      if (missions.length > 0) {
        this.logger.warn(
          `Operator ${event.operatorId} deleted, they were curator for ${missions.length} missions`,
        );

        // Business logic: What to do when a curator is deleted?
        // Options:
        // 1. Assign to default/system curator
        // 2. Set missions to draft/on-hold status
        // 3. Notify admin for manual reassignment

        // Example: Set missions to draft and notify
        const defaultCuratorId = 'system-curator';
        for (const mission of missions) {
          await this.missionService.partialUpdateMission(mission.id, {
            curatorId: defaultCuratorId,
            status: MissionStatus.DRAFT,
          });

          await this.missionProducer.publishMissionCuratorChanged(
            mission.id,
            event.operatorId,
            defaultCuratorId,
            'system',
            'Original curator account deleted',
          );

          await this.missionProducer.publishMissionStatusChanged(
            mission.id,
            mission.status,
            MissionStatus.DRAFT,
            'system',
            'Curator deleted, mission set to draft',
          );
        }

        this.logger.log(
          `Reassigned ${missions.length} missions from deleted curator ${event.operatorId} to default curator`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to process operator.deleted event:`, error);
      throw error;
    }
  }

  // ==================== INTERNAL EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.MISSION.EVENTS.CREATED,
    queue: RabbitMQConfig.MISSION.QUEUES.EVENT_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.MISSION.QUEUES.EVENT_CREATED,
    ),
  })
  async handleInternalMissionCreated(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.MISSION.EVENTS.CREATED} for mission ${event.missionId}`,
    );

    // Handle internal business logic when a mission is created
    // Examples:
    // - Assign default curator if not specified
    // - Validate mission data
    // - Initialize mission tracking
    // - Send notifications to stakeholders

    try {
      const mission = await this.missionService.getMission(event.missionId);

      // Validate mission has required fields
      if (!mission.curatorId) {
        this.logger.warn(`Mission ${event.missionId} created without curator`);
        // Could assign default curator or send notification
      }

      if (!mission.fromLocationId || !mission.toLocationId) {
        this.logger.warn(
          `Mission ${event.missionId} created without complete location information`,
        );
      }

      // If mission is created as ACTIVE, validate it
      if (mission.status === MissionStatus.ACTIVE) {
        const validation = await this.missionProducer.rpcValidateMission(
          mission.id,
        );
        if (!validation.valid) {
          this.logger.warn(
            `Mission ${event.missionId} activated but validation failed:`,
            validation.issues,
          );
          // Could automatically set to DRAFT or send notification
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to process internal ${RabbitMQConfig.MISSION.EVENTS.CREATED}:`,
        error,
      );
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.MISSION.EVENTS.STATUS_CHANGED,
    queue: RabbitMQConfig.MISSION.QUEUES.EVENT_STATUS_CHANGED,
  })
  async handleInternalMissionStatusChanged(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.MISSION.EVENTS.STATUS_CHANGED} for mission ${event.missionId}: ${event.previousStatus} → ${event.newStatus}`,
    );

    // Handle internal business logic when mission status changes
    // Examples:
    // - Update mission analytics
    // - Trigger workflows based on status
    // - Send notifications

    try {
      const mission = await this.missionService.getMission(event.missionId);

      // When mission becomes ACTIVE
      if (event.newStatus === MissionStatus.ACTIVE) {
        // Start tracking mission progress
        this.logger.log(
          `Mission ${event.missionId} activated, starting progress tracking`,
        );

        // Notify all journey stakeholders
        await this.missionProducer.sendNotifyStakeholdersCommand(
          mission.id,
          'status_change',
          `Mission ${mission.id} has been activated`,
          'system',
          mission.journeyIds, // would need to get stakeholders from journeys
        );
      }

      // When mission becomes ARCHIVED
      if (event.newStatus === MissionStatus.ARCHIVED) {
        // Archive related data, cleanup, etc.
        this.logger.log(
          `Mission ${event.missionId} archived, performing cleanup tasks`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process internal ${RabbitMQConfig.MISSION.EVENTS.STATUS_CHANGED}:`,
        error,
      );
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.MISSION.EVENTS.JOURNEY_ADDED,
    queue: 'missions.event.journey.added.queue',
  })
  async handleInternalJourneyAdded(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.MISSION.EVENTS.JOURNEY_ADDED} for mission ${event.missionId}, journey ${event.journeyId}`,
    );

    // Handle internal business logic when a journey is added to a mission
    // Examples:
    // - Update mission progress calculation
    // - Validate journey compatibility with mission
    // - Update mission timeline

    try {
      const mission = await this.missionService.getMission(event.missionId, [
        'journeys',
      ]);

      // Update mission metadata
      const totalJourneys = mission.journeyIds?.length || 0;
      this.logger.log(
        `Mission ${event.missionId} now has ${totalJourneys} journeys`,
      );

      // Recalculate mission progress if needed
      if (mission.status === MissionStatus.ACTIVE) {
        // Could trigger progress recalculation
      }
    } catch (error) {
      this.logger.error(
        `Failed to process internal ${RabbitMQConfig.MISSION.EVENTS.JOURNEY_ADDED}:`,
        error,
      );
    }
  }
}
