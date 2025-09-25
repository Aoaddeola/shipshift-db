import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service.js';
import { ShipmentCreateDto } from './shipment-create.dto.js';
import { ShipmentUpdateDto } from './shipment-update.dto.js';
import { ShipmentStatus } from './shipment.types.js';

@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  async createShipment(@Body() shipment: ShipmentCreateDto) {
    return this.shipmentService.createShipment(shipment);
  }

  @Get(':id')
  async getShipment(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipment(id, includeArray);
  }

  @Get()
  async getShipments(
    @Query('senderId') senderId?: string,
    @Query('receiverId') receiverId?: string,
    @Query('missionId') missionId?: string,
    @Query('status') status?: ShipmentStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (senderId && receiverId && missionId && status) {
      return this.shipmentService.getShipmentsByAllFilters(
        senderId,
        receiverId,
        missionId,
        status,
        includeArray,
      );
    } else if (senderId && receiverId && missionId) {
      return this.shipmentService.getShipmentsBySenderReceiverAndMission(
        senderId,
        receiverId,
        missionId,
        includeArray,
      );
    } else if (senderId && receiverId && status) {
      return this.shipmentService.getShipmentsBySenderReceiverAndStatus(
        senderId,
        receiverId,
        status,
        includeArray,
      );
    } else if (senderId && missionId && status) {
      return this.shipmentService.getShipmentsBySenderMissionAndStatus(
        senderId,
        missionId,
        status,
        includeArray,
      );
    } else if (receiverId && missionId && status) {
      return this.shipmentService.getShipmentsByReceiverMissionAndStatus(
        receiverId,
        missionId,
        status,
        includeArray,
      );
    } else if (senderId && receiverId) {
      return this.shipmentService.getShipmentsBySenderAndReceiver(
        senderId,
        receiverId,
        includeArray,
      );
    } else if (senderId && missionId) {
      return this.shipmentService.getShipmentsBySenderAndMission(
        senderId,
        missionId,
        includeArray,
      );
    } else if (receiverId && missionId) {
      return this.shipmentService.getShipmentsByReceiverAndMission(
        receiverId,
        missionId,
        includeArray,
      );
    } else if (senderId && status) {
      return this.shipmentService.getShipmentsBySenderAndStatus(
        senderId,
        status,
        includeArray,
      );
    } else if (receiverId && status) {
      return this.shipmentService.getShipmentsByReceiverAndStatus(
        receiverId,
        status,
        includeArray,
      );
    } else if (missionId && status) {
      return this.shipmentService.getShipmentsByMissionAndStatus(
        missionId,
        status,
        includeArray,
      );
    } else if (senderId) {
      return this.shipmentService.getShipmentsBySender(senderId, includeArray);
    } else if (receiverId) {
      return this.shipmentService.getShipmentsByReceiver(
        receiverId,
        includeArray,
      );
    } else if (missionId) {
      return this.shipmentService.getShipmentsByMission(
        missionId,
        includeArray,
      );
    } else if (status) {
      return this.shipmentService.getShipmentsByStatus(status, includeArray);
    }
    return this.shipmentService.getShipments(includeArray);
  }

  @Get('sender/:senderId')
  async getShipmentsBySender(
    @Param('senderId') senderId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsBySender(senderId, includeArray);
  }

  @Get('receiver/:receiverId')
  async getShipmentsByReceiver(
    @Param('receiverId') receiverId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByReceiver(
      receiverId,
      includeArray,
    );
  }

  @Get('mission/:missionId')
  async getShipmentsByMission(
    @Param('missionId') missionId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByMission(missionId, includeArray);
  }

  @Get('status/:status')
  async getShipmentsByStatus(
    @Param('status') status: ShipmentStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByStatus(status, includeArray);
  }

  @Put(':id')
  async updateShipment(
    @Param('id') id: string,
    @Body() shipment: ShipmentCreateDto,
  ) {
    return this.shipmentService.updateShipment(id, shipment);
  }

  @Patch(':id')
  async partialUpdateShipment(
    @Param('id') id: string,
    @Body() update: ShipmentUpdateDto,
  ) {
    return this.shipmentService.partialUpdateShipment(id, update);
  }

  @Delete(':id')
  async deleteShipment(@Param('id') id: string) {
    return this.shipmentService.deleteShipment(id);
  }
}
