/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ParcelService } from '../parcel.service.js';
import { ParcelProducer } from '../producers/parcel.producer.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';
import { CurrencyId, Parcel } from '../parcel.types.js';

@Injectable()
export class ParcelConsumer {
  private readonly logger = new Logger(ParcelConsumer.name);

  constructor(
    @Inject(ParcelService)
    private readonly parcelService: ParcelService,
    @Inject(ParcelProducer)
    private readonly parcelProducer: ParcelProducer,
  ) {}

  // ==================== COMMAND HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.PARCEL.COMMANDS.CREATE,
    queue: RabbitMQConfig.PARCEL.QUEUES.COMMAND_CREATE,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.PARCEL.QUEUES.COMMAND_CREATE,
    ),
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('ParcelConsumer-CreateCommand');
      logger.error(
        `Failed to process ${RabbitMQConfig.PARCEL.COMMANDS.CREATE}:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleCreateParcelCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.PARCEL.COMMANDS.CREATE} command`,
    );

    try {
      //   const { createdBy, timestamp, ...parcelData } = command;

      // Create the parcel
      const parcel = await this.parcelService.createParcel(command.data);

      // Publish creation event
      await this.parcelProducer.publishParcelCreated(parcel);

      this.logger.log(`Successfully created parcel: ${parcel.id}`);
    } catch (error) {
      this.logger.error(`Failed to create parcel from command:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.PARCEL.COMMANDS.UPDATE,
    queue: RabbitMQConfig.PARCEL.QUEUES.COMMAND_UPDATE,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.PARCEL.QUEUES.COMMAND_UPDATE,
    ),
  })
  async handleUpdateParcelCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.PARCEL.COMMANDS.UPDATE} for parcel ${command.parcelId}`,
    );

    try {
      const { parcelId, update, updatedBy } = command;

      // Get existing parcel for comparison
      const existingParcel = await this.parcelService.getParcel(parcelId);

      // Update the parcel

      // Publish update event
      await this.parcelProducer.publishParcelUpdated(
        parcelId,
        existingParcel,
        update,
        updatedBy,
      );

      this.logger.log(`Successfully updated parcel: ${parcelId}`);
    } catch (error) {
      this.logger.error(`Failed to update parcel from command:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.PARCEL.COMMANDS.VALIDATE_HANDLING,
    queue: 'parcels.command.validate.handling.queue',
  })
  async handleValidateHandlingCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.PARCEL.COMMANDS.VALIDATE_HANDLING} for parcel ${command.parcelId}`,
    );

    try {
      const { parcelId, handlingType, temperature } = command;

      // Get the parcel
      const parcel = await this.parcelService.getParcel(parcelId);

      // Validate handling requirements
      const validation = this.parcelProducer.validateHandlingRequirements(
        parcel,
        handlingType,
      );

      this.logger.log(
        `Handling validation for parcel ${parcelId}: ${validation.valid ? 'VALID' : 'INVALID'}`,
      );

      // If temperature is provided and parcel is perishable, check temperature
      if (parcel.handlingInfo.perishable && temperature !== undefined) {
        if (temperature > 8) {
          // Example threshold
          validation.warnings.push(
            `Temperature (${temperature}°C) may be too high for perishable items`,
          );
        }
      }

      // You could publish a validation result event or store the result
    } catch (error) {
      this.logger.error(`Failed to validate handling:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.PARCEL.COMMANDS.TRANSFER_OWNERSHIP,
    queue: 'parcels.command.transfer.ownership.queue',
  })
  async handleTransferOwnershipCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.PARCEL.COMMANDS.TRANSFER_OWNERSHIP} for parcel ${command.parcelId}`,
    );

    try {
      const { parcelId, fromOwnerId, toOwnerId, transferredBy, reason } =
        command;

      // Get the parcel
      const parcel = await this.parcelService.getParcel(parcelId);

      // Verify current owner
      if (parcel.ownerId !== fromOwnerId) {
        throw new Error(`Parcel ${parcelId} is not owned by ${fromOwnerId}`);
      }

      // Update the parcel owner

      // Publish owner changed event
      await this.parcelProducer.publishParcelOwnerChanged(
        parcelId,
        fromOwnerId,
        toOwnerId,
        transferredBy,
        reason,
        parcel.value,
      );

      this.logger.log(
        `Transferred parcel ${parcelId} from ${fromOwnerId} to ${toOwnerId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to transfer ownership:`, error);
      throw error;
    }
  }

  // ==================== RPC HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.PARCEL.RPC.GET,
    queue: RabbitMQConfig.PARCEL.QUEUES.RPC_GET,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetParcelRPC(request: { parcelId: string; include?: string[] }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.PARCEL.RPC.GET} for parcel ${request.parcelId}`,
    );

    try {
      const parcel = await this.parcelService.getParcel(
        request.parcelId,
        request.include,
      );

      return {
        success: true,
        data: parcel,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`RPC ${RabbitMQConfig.PARCEL.RPC.GET} failed:`, error);

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
    routingKey: RabbitMQConfig.PARCEL.RPC.GET_BATCH,
    queue: RabbitMQConfig.PARCEL.QUEUES.RPC_GET_BATCH,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetParcelsRPC(request: {
    filters: any;
    include?: string[];
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.PARCEL.RPC.GET_BATCH} with filters`,
      request.filters,
    );

    try {
      const parcels = await this.parcelService.getParcels(
        request.filters,
        request.include,
      );

      // Apply pagination
      let result = parcels;
      if (request.limit || request.offset) {
        const offset = request.offset || 0;
        const limit = request.limit || parcels.length;
        result = parcels.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: result,
        count: result.length,
        total: parcels.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.PARCEL.RPC.GET_BATCH} failed:`,
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
    routingKey: RabbitMQConfig.PARCEL.RPC.CALCULATE_TOTAL_VALUE,
    queue: 'parcels.rpc.calculate.value.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleCalculateParcelsValueRPC(request: {
    parcelIds: string[];
    targetCurrency?: CurrencyId;
    includeDetails?: boolean;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.PARCEL.RPC.CALCULATE_TOTAL_VALUE} for ${request.parcelIds.length} parcels`,
    );

    try {
      // Get all parcels
      const parcels: Parcel[] = [];
      for (const parcelId of request.parcelIds) {
        try {
          const parcel = await this.parcelService.getParcel(parcelId);
          parcels.push(parcel);
        } catch {
          this.logger.warn(`Parcel ${parcelId} not found, skipping`);
        }
      }

      // Calculate total value
      const totalValue = await this.parcelProducer.calculateTotalValue(
        parcels,
        request.targetCurrency,
      );

      // Prepare response
      const response = {
        totalValue: totalValue.total,
        currency: totalValue.currency,
        parcelsCount: parcels.length,
        parcelValues: request.includeDetails ? totalValue.details : undefined,
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.PARCEL.RPC.CALCULATE_TOTAL_VALUE} failed:`,
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
    routingKey: RabbitMQConfig.PARCEL.RPC.VALIDATE_HANDLING,
    queue: 'parcels.rpc.validate.handling.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleValidateHandlingRPC(request: {
    parcelId: string;
    handlingType: 'loading' | 'unloading' | 'transport' | 'storage';
    handlerId: string;
    location?: string;
    temperature?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.PARCEL.RPC.VALIDATE_HANDLING} for parcel ${request.parcelId}`,
    );

    try {
      // Get the parcel
      const parcel = await this.parcelService.getParcel(request.parcelId);

      // Validate handling requirements
      const validation = this.parcelProducer.validateHandlingRequirements(
        parcel,
        request.handlingType,
      );

      // Add temperature check for perishable items
      if (parcel.handlingInfo.perishable && request.temperature !== undefined) {
        if (request.temperature > 8) {
          validation.warnings.push(
            `Temperature (${request.temperature}°C) may be too high for perishable items`,
          );
        }
        if (request.temperature < 0) {
          validation.warnings.push(
            `Temperature (${request.temperature}°C) may freeze perishable items`,
          );
        }
      }

      // Add location-based restrictions
      if (request.location) {
        if (
          request.handlingType === 'storage' &&
          parcel.handlingInfo.perishable
        ) {
          validation.requirements.push(
            `Store at location: ${request.location} with temperature control`,
          );
        }
      }

      return {
        success: true,
        data: {
          valid: validation.valid,
          parcelId: request.parcelId,
          handlerId: request.handlerId,
          restrictions: validation.restrictions,
          requirements: validation.requirements,
          warnings: validation.warnings,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.PARCEL.RPC.VALIDATE_HANDLING} failed:`,
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
    routingKey: RabbitMQConfig.PARCEL.RPC.GET_BY_OWNER,
    queue: 'parcels.rpc.get.by.owner.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetParcelsByOwnerRPC(request: {
    ownerId: string;
    include?: string[];
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.PARCEL.RPC.GET_BY_OWNER} for owner ${request.ownerId}`,
    );

    try {
      const parcels = await this.parcelService.getParcelsByOwner(
        request.ownerId,
        request.include,
      );

      // Apply pagination
      let result = parcels;
      if (request.limit || request.offset) {
        const offset = request.offset || 0;
        const limit = request.limit || parcels.length;
        result = parcels.slice(offset, offset + limit);
      }

      // Calculate total value
      const totalValue = result.reduce(
        (sum, parcel) => sum + parcel.value[1] * parcel.quantity,
        0,
      );

      return {
        success: true,
        data: result,
        count: result.length,
        totalValue,
        currency: result[0]?.value[0] || 'N/A',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.PARCEL.RPC.GET_BY_OWNER} failed:`,
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
    routingKey: RabbitMQConfig.PARCEL.RPC.GET_BY_CURRENCY,
    queue: 'parcels.rpc.get.by.currency.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetParcelsByCurrencyRPC(request: {
    currencyId: CurrencyId;
    include?: string[];
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.PARCEL.RPC.GET_BY_CURRENCY} for currency ${request.currencyId}`,
    );

    try {
      const parcels = await this.parcelService.getParcelsByCurrency(
        request.currencyId,
        request.include,
      );

      // Apply pagination
      let result = parcels;
      if (request.limit || request.offset) {
        const offset = request.offset || 0;
        const limit = request.limit || parcels.length;
        result = parcels.slice(offset, offset + limit);
      }

      // Calculate total value in this currency
      const totalValue = result.reduce(
        (sum, parcel) => sum + parcel.value[1] * parcel.quantity,
        0,
      );

      return {
        success: true,
        data: result,
        count: result.length,
        totalValue,
        currency: request.currencyId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.PARCEL.RPC.GET_BY_CURRENCY} failed:`,
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
    routingKey: 'user.updated',
    queue: RabbitMQConfig.PARCEL.QUEUES.USER_EVENTS,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.PARCEL.QUEUES.USER_EVENTS,
    ),
  })
  async handleUserUpdated(event: any) {
    this.logger.log(`Processing user.updated event for user ${event.userId}`);

    try {
      // Get all parcels owned by this user
      const userParcels = await this.parcelService.getParcelsByOwner(
        event.userId,
      );

      this.logger.log(
        `User ${event.userId} updated, affecting ${userParcels.length} parcels`,
      );

      // Example: Update parcel metadata if user info changed
      if (event.updatedFields?.email || event.updatedFields?.name) {
        // Could update parcel cache or trigger notifications
        for (const parcel of userParcels) {
          this.logger.debug(
            `Parcel ${parcel.id} owned by updated user ${event.userId}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process user.updated event:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'user.deleted',
    queue: 'parcels.integration.user.deleted.queue',
  })
  async handleUserDeleted(event: any) {
    this.logger.log(`Processing user.deleted event for user ${event.userId}`);

    try {
      // Get all parcels owned by this user
      const userParcels = await this.parcelService.getParcelsByOwner(
        event.userId,
      );

      this.logger.log(
        `User ${event.userId} deleted, found ${userParcels.length} parcels owned by them`,
      );

      // Business logic: What to do with parcels when owner is deleted?
      // Options:
      // 1. Delete all parcels
      // 2. Transfer ownership to another user (e.g., admin)
      // 3. Mark as orphaned

      // Example: Transfer to system admin or mark for review
      const systemAdminId = 'system-admin-id'; // This should be configurable

      for (const parcel of userParcels) {
        // Update parcel owner to system admin
        await this.parcelService.partialUpdateParcel(parcel.id, {
          ownerId: systemAdminId,
        });

        // Publish owner changed event
        await this.parcelProducer.publishParcelOwnerChanged(
          parcel.id,
          event.userId,
          systemAdminId,
          'system',
          'Original owner account deleted',
          parcel.value,
        );
      }

      this.logger.log(
        `Transferred ${userParcels.length} parcels to system admin due to owner deletion`,
      );
    } catch (error) {
      this.logger.error(`Failed to process user.deleted event:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'currency.updated',
    queue: RabbitMQConfig.PARCEL.QUEUES.CURRENCY_EVENTS,
  })
  async handleCurrencyUpdated(event: any) {
    this.logger.log(
      `Processing currency.updated event for currency ${event.currencyId}`,
    );

    try {
      // Get all parcels with this currency
      const currencyParcels = await this.parcelService.getParcelsByCurrency(
        event.currencyId,
      );

      this.logger.log(
        `Currency ${event.currencyId} updated, affecting ${currencyParcels.length} parcels`,
      );

      // Example: If currency conversion rates changed, we might need to recalculate values
      // or send notifications to parcel owners

      if (event.updatedFields?.exchangeRate) {
        // Could trigger value recalculations or notifications
        for (const parcel of currencyParcels) {
          this.logger.debug(
            `Parcel ${parcel.id} uses updated currency ${event.currencyId}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process currency.updated event:`, error);
      throw error;
    }
  }

  // ==================== INTERNAL EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.PARCEL.EVENTS.CREATED,
    queue: RabbitMQConfig.PARCEL.QUEUES.EVENT_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.PARCEL.QUEUES.EVENT_CREATED,
    ),
  })
  async handleInternalParcelCreated(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.PARCEL.EVENTS.CREATED} for parcel ${event.parcelId}`,
    );

    // Handle internal business logic when a parcel is created
    // Examples:
    // - Update inventory counts
    // - Send confirmation to owner
    // - Trigger insurance registration
    // - Schedule value appraisal

    try {
      // Get the parcel for additional processing
      const parcel = await this.parcelService.getParcel(event.parcelId);

      // Example: Check if high-value parcel needs special handling
      const isHighValue = parcel.value[1] > 10000; // Example threshold
      if (isHighValue) {
        this.logger.log(
          `High-value parcel created: ${parcel.id} worth ${parcel.value[1]} ${parcel.value[0]}`,
        );
        // Could trigger additional processing or notifications
      }

      // Example: Check if fragile/perishable and schedule inspections
      if (parcel.handlingInfo.fragile || parcel.handlingInfo.perishable) {
        this.logger.log(`Special handling parcel created: ${parcel.id}`);
        // Could schedule quality checks or inspections
      }
    } catch (error) {
      this.logger.error(
        `Failed to process internal ${RabbitMQConfig.PARCEL.EVENTS.CREATED}:`,
        error,
      );
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.PARCEL.EVENTS.FRAGILE_ALERT,
    queue: RabbitMQConfig.PARCEL.QUEUES.EVENT_FRAGILE_ALERT,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.PARCEL.QUEUES.EVENT_FRAGILE_ALERT,
    ),
  })
  async handleFragileAlert(event: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.PARCEL.EVENTS.FRAGILE_ALERT} for parcel ${event.parcelId}, level: ${event.alertLevel}`,
    );

    // Handle fragile parcel alerts
    // Examples:
    // - Send notifications to handlers
    // - Update parcel handling instructions
    // - Trigger additional packaging requirements
    // - Log handling compliance

    try {
      const parcel = await this.parcelService.getParcel(event.parcelId);

      // Example: Log the alert for compliance tracking
      this.logger.warn(
        `FRAGILE ALERT ${event.alertLevel}: Parcel ${parcel.name} (${parcel.id}) - ${event.reason}`,
      );

      // Example: If critical alert, trigger immediate action
      if (event.alertLevel === 'CRITICAL') {
        // Could trigger emergency response or supervisor notification
        this.logger.error(
          `CRITICAL FRAGILE ALERT: Immediate action required for parcel ${parcel.id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process ${RabbitMQConfig.PARCEL.EVENTS.FRAGILE_ALERT}:`,
        error,
      );
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.PARCEL.EVENTS.VALUE_UPDATED,
    queue: 'parcels.event.value.updated.queue',
  })
  async handleParcelValueUpdated(event: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.PARCEL.EVENTS.VALUE_UPDATED} for parcel ${event.parcelId}`,
    );

    // Handle value updates
    // Examples:
    // - Update insurance coverage
    // - Notify owner of value change
    // - Adjust shipping costs
    // - Update accounting records

    try {
      const parcel = await this.parcelService.getParcel(event.parcelId);

      // Calculate percentage change
      const oldTotal = event.previousValue[1] * parcel.quantity;
      const newTotal = event.newValue[1] * parcel.quantity;
      const percentageChange =
        oldTotal > 0 ? ((newTotal - oldTotal) / oldTotal) * 100 : 0;

      this.logger.log(
        `Parcel ${parcel.id} value changed by ${percentageChange.toFixed(2)}%`,
      );

      // Example: If significant increase, check insurance coverage
      if (percentageChange > 20) {
        this.logger.warn(
          `Significant value increase for parcel ${parcel.id}. Check insurance coverage.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process ${RabbitMQConfig.PARCEL.EVENTS.VALUE_UPDATED}:`,
        error,
      );
    }
  }
}
