/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBusService } from '../../../shared/rabbitmq/rabbitmq.service.js';
import { Parcel, CurrencyId, ParcelHandlingInfo } from '../parcel.types.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';
import { ParcelUpdateDto } from '../parcel-update.dto.js';

export interface ParcelCreatedEvent {
  parcelId: string;
  ownerId: string;
  name: string;
  description: string;
  quantity: number;
  value: [CurrencyId, number];
  handlingInfo: ParcelHandlingInfo;
  createdAt: string;
  metadata?: {
    image?: string;
    totalValue?: number;
  };
}

export interface ParcelUpdatedEvent {
  parcelId: string;
  ownerId: string;
  updatedFields: Partial<ParcelUpdateDto>;
  previousValues?: Partial<Parcel>;
  updatedAt: string;
  changedBy?: string;
}

export interface ParcelDeletedEvent {
  parcelId: string;
  name: string;
  ownerId: string;
  value: [CurrencyId, number];
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}

export interface ParcelValueUpdatedEvent {
  parcelId: string;
  previousValue: [CurrencyId, number];
  newValue: [CurrencyId, number];
  updatedAt: string;
  updatedBy: string;
  reason?: string;
  percentageChange?: number;
}

export interface ParcelHandlingInfoUpdatedEvent {
  parcelId: string;
  previousHandlingInfo: ParcelHandlingInfo;
  newHandlingInfo: ParcelHandlingInfo;
  updatedAt: string;
  updatedBy: string;
  reason?: string;
  changes: string[];
}

export interface ParcelOwnerChangedEvent {
  parcelId: string;
  previousOwnerId: string;
  newOwnerId: string;
  changedAt: string;
  changedBy: string;
  reason?: string;
  valueAtTransfer: [CurrencyId, number];
}

export interface ParcelFragileAlertEvent {
  parcelId: string;
  name: string;
  ownerId: string;
  handlerId?: string;
  location?: string;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  timestamp: string;
  instructions?: string;
}

export interface ParcelPerishableAlertEvent {
  parcelId: string;
  name: string;
  ownerId: string;
  handlerId?: string;
  location?: string;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  expiryTime?: string;
  timestamp: string;
  temperature?: number;
}

export interface CalculateParcelsValueRequest {
  parcelIds: string[];
  targetCurrency?: CurrencyId;
  includeDetails?: boolean;
}

export interface CalculateParcelsValueResponse {
  totalValue: number;
  currency: CurrencyId;
  parcelsCount: number;
  parcelValues: Array<{
    parcelId: string;
    name: string;
    value: number;
    currency: CurrencyId;
    convertedValue?: number;
  }>;
  timestamp: string;
}

export interface ValidateParcelHandlingRequest {
  parcelId: string;
  handlingType: 'loading' | 'unloading' | 'transport' | 'storage';
  handlerId: string;
  location?: string;
  temperature?: number;
}

export interface ValidateParcelHandlingResponse {
  valid: boolean;
  parcelId: string;
  handlerId: string;
  restrictions: string[];
  requirements: string[];
  warnings: string[];
  timestamp: string;
}

@Injectable()
export class ParcelProducer {
  private readonly logger = new Logger(ParcelProducer.name);

  constructor(
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  // ==================== EVENT PUBLISHING METHODS ====================

  async publishParcelCreated(parcel: Parcel): Promise<boolean> {
    const event: ParcelCreatedEvent = {
      parcelId: parcel.id,
      ownerId: parcel.ownerId,
      name: parcel.name,
      description: parcel.description,
      quantity: parcel.quantity,
      value: parcel.value,
      handlingInfo: parcel.handlingInfo,
      createdAt: parcel.createdAt || new Date().toISOString(),
      metadata: {
        image: parcel.image,
        totalValue: parcel.value[1] * parcel.quantity,
      },
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.CREATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'created',
            'x-parcel-id': parcel.id,
            'x-owner-id': parcel.ownerId,
            'x-is-fragile': parcel.handlingInfo.fragile.toString(),
            'x-is-perishable': parcel.handlingInfo.perishable.toString(),
          },
        },
      );

      // If parcel is fragile or perishable, publish specific alerts
      if (parcel.handlingInfo.fragile) {
        await this.publishFragileAlert(
          parcel.id,
          parcel.name,
          parcel.ownerId,
          'NEW_FRAGILE_PARCEL',
          'MEDIUM',
          'New fragile parcel registered',
        );
      }

      if (parcel.handlingInfo.perishable) {
        await this.publishPerishableAlert(
          parcel.id,
          parcel.name,
          parcel.ownerId,
          'NEW_PERISHABLE_PARCEL',
          'MEDIUM',
          'New perishable parcel registered',
        );
      }

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.CREATED} for parcel ${parcel.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.CREATED}:`,
        error,
      );
      return false;
    }
  }

  async publishParcelUpdated(
    parcelId: string,
    previousValues: Partial<Parcel>,
    update: Partial<ParcelUpdateDto>,
    changedBy?: string,
  ): Promise<boolean> {
    const event: ParcelUpdatedEvent = {
      parcelId,
      ownerId: update.ownerId || previousValues.ownerId || '',
      updatedFields: update,
      previousValues,
      updatedAt: new Date().toISOString(),
      changedBy,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'updated',
            'x-parcel-id': parcelId,
          },
        },
      );

      // If value was updated, publish a specific event
      if (
        update.value &&
        previousValues.value &&
        (update.value[0] !== previousValues.value[0] ||
          update.value[1] !== previousValues.value[1])
      ) {
        const percentageChange =
          previousValues.value[1] > 0
            ? ((update.value[1] - previousValues.value[1]) /
                previousValues.value[1]) *
              100
            : 0;

        await this.publishParcelValueUpdated(
          parcelId,
          previousValues.value,
          update.value,
          changedBy || 'system',
          'Value updated',
          percentageChange,
        );
      }

      // If handling info was updated, publish a specific event
      if (update.handlingInfo && previousValues.handlingInfo) {
        await this.publishParcelHandlingInfoUpdated(
          parcelId,
          previousValues.handlingInfo,
          { ...previousValues.handlingInfo, ...update.handlingInfo },
          changedBy || 'system',
          'Handling info updated',
        );
      }

      // If owner was updated, publish a specific event
      if (
        update.ownerId &&
        previousValues.ownerId &&
        update.ownerId !== previousValues.ownerId
      ) {
        await this.publishParcelOwnerChanged(
          parcelId,
          previousValues.ownerId,
          update.ownerId,
          changedBy || 'system',
          'Ownership transferred',
          update.value || previousValues.value || ['USD', 0],
        );
      }

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.UPDATED} for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishParcelDeleted(
    parcel: Parcel,
    deletedBy?: string,
    reason?: string,
  ): Promise<boolean> {
    const event: ParcelDeletedEvent = {
      parcelId: parcel.id,
      name: parcel.name,
      ownerId: parcel.ownerId,
      value: parcel.value,
      deletedAt: new Date().toISOString(),
      deletedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.DELETED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'deleted',
            'x-parcel-id': parcel.id,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.DELETED} for parcel ${parcel.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.DELETED}:`,
        error,
      );
      return false;
    }
  }

  async publishParcelValueUpdated(
    parcelId: string,
    previousValue: [CurrencyId, number],
    newValue: [CurrencyId, number],
    updatedBy: string,
    reason?: string,
    percentageChange?: number,
  ): Promise<boolean> {
    const event: ParcelValueUpdatedEvent = {
      parcelId,
      previousValue,
      newValue,
      updatedAt: new Date().toISOString(),
      updatedBy,
      reason,
      percentageChange,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.VALUE_UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'value_updated',
            'x-parcel-id': parcelId,
            'x-currency-changed': (previousValue[0] !== newValue[0]).toString(),
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.VALUE_UPDATED} for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.VALUE_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishParcelHandlingInfoUpdated(
    parcelId: string,
    previousHandlingInfo: ParcelHandlingInfo,
    newHandlingInfo: ParcelHandlingInfo,
    updatedBy: string,
    reason?: string,
  ): Promise<boolean> {
    // Determine what changed
    const changes: string[] = [];
    if (previousHandlingInfo.fragile !== newHandlingInfo.fragile) {
      changes.push(
        `fragile: ${previousHandlingInfo.fragile} -> ${newHandlingInfo.fragile}`,
      );
    }
    if (previousHandlingInfo.perishable !== newHandlingInfo.perishable) {
      changes.push(
        `perishable: ${previousHandlingInfo.perishable} -> ${newHandlingInfo.perishable}`,
      );
    }
    if (previousHandlingInfo.sealed !== newHandlingInfo.sealed) {
      changes.push(
        `sealed: ${previousHandlingInfo.sealed} -> ${newHandlingInfo.sealed}`,
      );
    }
    if (previousHandlingInfo.weight !== newHandlingInfo.weight) {
      changes.push(
        `weight: ${previousHandlingInfo.weight} -> ${newHandlingInfo.weight}`,
      );
    }
    if (previousHandlingInfo.size !== newHandlingInfo.size) {
      changes.push(
        `size: ${previousHandlingInfo.size} -> ${newHandlingInfo.size}`,
      );
    }

    const event: ParcelHandlingInfoUpdatedEvent = {
      parcelId,
      previousHandlingInfo,
      newHandlingInfo,
      updatedAt: new Date().toISOString(),
      updatedBy,
      reason,
      changes,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.HANDLING_INFO_UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'handling_info_updated',
            'x-parcel-id': parcelId,
            'x-change-count': changes.length.toString(),
          },
        },
      );

      // If fragile status changed to true, send alert
      if (!previousHandlingInfo.fragile && newHandlingInfo.fragile) {
        await this.publishFragileAlert(
          parcelId,
          'Unknown', // We'd need the name here
          'Unknown', // We'd need the ownerId here
          'FRAGILE_STATUS_ENABLED',
          'MEDIUM',
          'Parcel marked as fragile',
        );
      }

      // If perishable status changed to true, send alert
      if (!previousHandlingInfo.perishable && newHandlingInfo.perishable) {
        await this.publishPerishableAlert(
          parcelId,
          'Unknown',
          'Unknown',
          'PERISHABLE_STATUS_ENABLED',
          'MEDIUM',
          'Parcel marked as perishable',
        );
      }

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.HANDLING_INFO_UPDATED} for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.HANDLING_INFO_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishParcelOwnerChanged(
    parcelId: string,
    previousOwnerId: string,
    newOwnerId: string,
    changedBy: string,
    reason?: string,
    valueAtTransfer?: [CurrencyId, number],
  ): Promise<boolean> {
    const event: ParcelOwnerChangedEvent = {
      parcelId,
      previousOwnerId,
      newOwnerId,
      changedAt: new Date().toISOString(),
      changedBy,
      reason,
      valueAtTransfer: valueAtTransfer || ['USD', 0],
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.OWNER_CHANGED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'owner_changed',
            'x-parcel-id': parcelId,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.OWNER_CHANGED} for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.OWNER_CHANGED}:`,
        error,
      );
      return false;
    }
  }

  async publishFragileAlert(
    parcelId: string,
    name: string,
    ownerId: string,
    reason: string,
    alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    instructions?: string,
    handlerId?: string,
    location?: string,
  ): Promise<boolean> {
    const event: ParcelFragileAlertEvent = {
      parcelId,
      name,
      ownerId,
      handlerId,
      location,
      alertLevel,
      reason,
      timestamp: new Date().toISOString(),
      instructions,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.FRAGILE_ALERT,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'fragile_alert',
            'x-parcel-id': parcelId,
            'x-alert-level': alertLevel,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.FRAGILE_ALERT} for parcel ${parcelId}, level: ${alertLevel}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.FRAGILE_ALERT}:`,
        error,
      );
      return false;
    }
  }

  async publishPerishableAlert(
    parcelId: string,
    name: string,
    ownerId: string,
    reason: string,
    alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    expiryTime?: string,
    handlerId?: string,
    location?: string,
    temperature?: number,
  ): Promise<boolean> {
    const event: ParcelPerishableAlertEvent = {
      parcelId,
      name,
      ownerId,
      handlerId,
      location,
      alertLevel,
      reason,
      expiryTime,
      timestamp: new Date().toISOString(),
      temperature,
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.PERISHABLE_ALERT,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'perishable_alert',
            'x-parcel-id': parcelId,
            'x-alert-level': alertLevel,
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.PERISHABLE_ALERT} for parcel ${parcelId}, level: ${alertLevel}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.PERISHABLE_ALERT}:`,
        error,
      );
      return false;
    }
  }

  async publishParcelsBatchUpdated(
    updateCount: number,
    filterCriteria: {
      ownerId?: string;
      currencyId?: CurrencyId;
      fragile?: boolean;
      perishable?: boolean;
    },
    updatedFields: Partial<ParcelUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event = {
      updateCount,
      filterCriteria,
      updatedFields,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(
        RabbitMQConfig.PARCEL.EVENTS.BATCH_UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'parcel',
            'x-event-type': 'batch_updated',
            'x-update-count': updateCount.toString(),
          },
        },
      );

      this.logger.log(
        `Published ${RabbitMQConfig.PARCEL.EVENTS.BATCH_UPDATED} for ${updateCount} parcels`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${RabbitMQConfig.PARCEL.EVENTS.BATCH_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  // ==================== COMMAND PUBLISHING METHODS ====================

  async sendCreateParcelCommand(
    parcelData: Omit<
      Parcel,
      'id' | 'createdAt' | 'updatedAt' | 'currency' | 'owner'
    >,
    createdBy?: string,
  ): Promise<boolean> {
    const command = {
      ...parcelData,
      createdBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.PARCEL.COMMANDS.CREATE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_parcel`,
          },
        },
      );

      this.logger.log(`Sent ${RabbitMQConfig.PARCEL.COMMANDS.CREATE} command`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.PARCEL.COMMANDS.CREATE}:`,
        error,
      );
      return false;
    }
  }

  async sendUpdateParcelCommand(
    parcelId: string,
    update: Partial<ParcelUpdateDto>,
    updatedBy: string,
  ): Promise<boolean> {
    const command = {
      parcelId,
      update,
      updatedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.PARCEL.COMMANDS.UPDATE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${parcelId}`,
            'x-parcel-id': parcelId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.PARCEL.COMMANDS.UPDATE} command for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.PARCEL.COMMANDS.UPDATE}:`,
        error,
      );
      return false;
    }
  }

  async sendValidateHandlingCommand(
    parcelId: string,
    handlingType: 'loading' | 'unloading' | 'transport' | 'storage',
    handlerId: string,
    location?: string,
    temperature?: number,
  ): Promise<boolean> {
    const command: ValidateParcelHandlingRequest = {
      parcelId,
      handlingType,
      handlerId,
      location,
      temperature,
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.PARCEL.COMMANDS.VALIDATE_HANDLING,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_validate_${parcelId}`,
            'x-parcel-id': parcelId,
            'x-handling-type': handlingType,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.PARCEL.COMMANDS.VALIDATE_HANDLING} command for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.PARCEL.COMMANDS.VALIDATE_HANDLING}:`,
        error,
      );
      return false;
    }
  }

  async sendProcessFragileCommand(
    parcelId: string,
    handlerId: string,
    location: string,
    instructions?: string,
  ): Promise<boolean> {
    const command = {
      parcelId,
      handlerId,
      location,
      instructions,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.PARCEL.COMMANDS.PROCESS_FRAGILE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_fragile_${parcelId}`,
            'x-parcel-id': parcelId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.PARCEL.COMMANDS.PROCESS_FRAGILE} command for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.PARCEL.COMMANDS.PROCESS_FRAGILE}:`,
        error,
      );
      return false;
    }
  }

  async sendTransferOwnershipCommand(
    parcelId: string,
    fromOwnerId: string,
    toOwnerId: string,
    transferredBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      parcelId,
      fromOwnerId,
      toOwnerId,
      transferredBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        RabbitMQConfig.PARCEL.COMMANDS.TRANSFER_OWNERSHIP,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_transfer_${parcelId}`,
            'x-parcel-id': parcelId,
          },
        },
      );

      this.logger.log(
        `Sent ${RabbitMQConfig.PARCEL.COMMANDS.TRANSFER_OWNERSHIP} command for parcel ${parcelId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${RabbitMQConfig.PARCEL.COMMANDS.TRANSFER_OWNERSHIP}:`,
        error,
      );
      return false;
    }
  }

  // ==================== RPC METHODS ====================

  async rpcGetParcel(parcelId: string, include?: string[]): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.GET,
        { parcelId, include },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${parcelId}`,
            'x-parcel-id': parcelId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.PARCEL.RPC.GET} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcGetParcels(
    filters: {
      ownerId?: string;
      currencyId?: CurrencyId;
      fragile?: boolean;
      perishable?: boolean;
    },
    include?: string[],
    limit?: number,
    offset?: number,
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.GET_BATCH,
        { filters, include, limit, offset },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_parcels`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.PARCEL.RPC.GET_BATCH} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcCalculateParcelsValue(
    parcelIds: string[],
    targetCurrency?: CurrencyId,
    includeDetails?: boolean,
  ): Promise<CalculateParcelsValueResponse> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.CALCULATE_TOTAL_VALUE,
        { parcelIds, targetCurrency, includeDetails },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_value`,
            'x-parcel-count': parcelIds.length.toString(),
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.PARCEL.RPC.CALCULATE_TOTAL_VALUE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcValidateParcelHandling(
    request: ValidateParcelHandlingRequest,
  ): Promise<ValidateParcelHandlingResponse> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.VALIDATE_HANDLING,
        request,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_validate_${request.parcelId}`,
            'x-parcel-id': request.parcelId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.PARCEL.RPC.VALIDATE_HANDLING} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcGetParcelsByOwner(
    ownerId: string,
    include?: string[],
    limit?: number,
    offset?: number,
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.GET_BY_OWNER,
        { ownerId, include, limit, offset },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_owner_${ownerId}`,
            'x-owner-id': ownerId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.PARCEL.RPC.GET_BY_OWNER} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcGetParcelsByCurrency(
    currencyId: CurrencyId,
    include?: string[],
    limit?: number,
    offset?: number,
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.GET_BY_CURRENCY,
        { currencyId, include, limit, offset },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_currency_${currencyId}`,
            'x-currency-id': currencyId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.PARCEL.RPC.GET_BY_CURRENCY} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcCreateParcel(
    parcelData: Omit<
      Parcel,
      'id' | 'createdAt' | 'updatedAt' | 'currency' | 'owner'
    >,
    createdBy?: string,
  ): Promise<Parcel> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.CREATE,
        { parcelData, createdBy },
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
        `RPC call ${RabbitMQConfig.PARCEL.RPC.CREATE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcUpdateParcel(
    parcelId: string,
    update: Partial<ParcelUpdateDto>,
    updatedBy?: string,
  ): Promise<Parcel> {
    try {
      const response = await this.messageBus.sendRPC(
        RabbitMQConfig.PARCEL.RPC.UPDATE,
        { parcelId, update, updatedBy },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${parcelId}`,
            'x-parcel-id': parcelId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${RabbitMQConfig.PARCEL.RPC.UPDATE} failed:`,
        error,
      );
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  async calculateTotalValue(
    parcels: Parcel[],
    targetCurrency?: CurrencyId,
  ): Promise<{
    total: number;
    currency: CurrencyId;
    details: Array<{ parcelId: string; value: number }>;
  }> {
    // In a real implementation, you would convert currencies
    // For now, we'll just sum values in their original currencies

    const total = parcels.reduce(
      (sum, parcel) => sum + parcel.value[1] * parcel.quantity,
      0,
    );
    const currency = targetCurrency || parcels[0]?.value[0] || 'USD';

    const details = parcels.map((parcel) => ({
      parcelId: parcel.id,
      name: parcel.name,
      value: parcel.value[1] * parcel.quantity,
      currency: parcel.value[0],
      quantity: parcel.quantity,
    }));

    return {
      total,
      currency,
      details,
    };
  }

  validateHandlingRequirements(
    parcel: Parcel,
    handlingType: string,
  ): {
    valid: boolean;
    restrictions: string[];
    requirements: string[];
    warnings: string[];
  } {
    const restrictions: string[] = [];
    const requirements: string[] = [];
    const warnings: string[] = [];

    // Check fragile parcels
    if (parcel.handlingInfo.fragile) {
      requirements.push('Handle with care - FRAGILE');
      if (handlingType === 'loading' || handlingType === 'unloading') {
        requirements.push('Use two-person lift for fragile items');
      }
      if (handlingType === 'transport') {
        requirements.push('Secure with cushioning material');
        warnings.push('Avoid stacking heavy items on top');
      }
    }

    // Check perishable parcels
    if (parcel.handlingInfo.perishable) {
      requirements.push('Maintain temperature control');
      warnings.push('Check expiry date before handling');
      if (handlingType === 'storage') {
        requirements.push('Store in temperature-controlled environment');
      }
      if (handlingType === 'transport') {
        requirements.push('Use refrigerated transport');
      }
    }

    // Check sealed parcels
    if (parcel.handlingInfo.sealed) {
      restrictions.push('Do not break seal without authorization');
      warnings.push('Seal integrity must be maintained');
    }

    // Check weight restrictions
    if (parcel.handlingInfo.weight && parcel.handlingInfo.weight > 50) {
      requirements.push('Use mechanical lifting equipment');
      warnings.push('Heavy item - risk of injury');
    }

    // Check size restrictions
    if (parcel.handlingInfo.size && parcel.handlingInfo.size > 2) {
      requirements.push('Use oversized item handling procedures');
      warnings.push('Large item - may require special equipment');
    }

    const valid = restrictions.length === 0; // Valid if no hard restrictions

    return {
      valid,
      restrictions,
      requirements,
      warnings,
    };
  }
}
