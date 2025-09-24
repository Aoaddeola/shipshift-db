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
import { ShipmentCreateDto } from './shipment-create.dto.js';
import { ShipmentUpdateDto } from './shipment-update.dto.js';
import { ShipmentService } from './shipment.service.js';
import { ShipmentStatus } from './shipment.types.js';

@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  async createShipment(@Body() shipment: ShipmentCreateDto) {
    return this.shipmentService.createShipment(shipment);
  }

  @Get(':id')
  async getShipment(@Param('id') id: string) {
    return this.shipmentService.getShipment(id);
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

  @Get()
  async getShipments(
    @Query('senderId') senderId?: string,
    @Query('receiverId') receiverId?: string,
    @Query('missionId') missionId?: string,
    @Query('status') status?: ShipmentStatus,
  ) {
    if (senderId && receiverId && missionId && status) {
      return this.shipmentService.getShipmentsByAllFilters(
        senderId,
        receiverId,
        missionId,
        status,
      );
    } else if (senderId && receiverId && missionId) {
      return this.shipmentService.getShipmentsBySenderReceiverAndMission(
        senderId,
        receiverId,
        missionId,
      );
    } else if (senderId && receiverId) {
      return this.shipmentService.getShipmentsBySenderAndReceiver(
        senderId,
        receiverId,
      );
    } else if (senderId && missionId) {
      return this.shipmentService.getShipmentsBySenderAndMission(
        senderId,
        missionId,
      );
    } else if (receiverId && missionId) {
      return this.shipmentService.getShipmentsByReceiverAndMission(
        receiverId,
        missionId,
      );
    } else if (missionId && status) {
      return this.shipmentService.getShipmentsByMissionAndStatus(
        missionId,
        status,
      );
    } else if (senderId) {
      return this.shipmentService.getShipmentsBySender(senderId);
    } else if (receiverId) {
      return this.shipmentService.getShipmentsByReceiver(receiverId);
    } else if (missionId) {
      return this.shipmentService.getShipmentsByMission(missionId);
    } else if (status) {
      return this.shipmentService.getShipmentsByStatus(status);
    }
    return this.shipmentService.getShipments();
  }

  @Get('sender/:senderId')
  async getShipmentsBySender(@Param('senderId') senderId: string) {
    return this.shipmentService.getShipmentsBySender(senderId);
  }

  @Get('receiver/:receiverId')
  async getShipmentsByReceiver(@Param('receiverId') receiverId: string) {
    return this.shipmentService.getShipmentsByReceiver(receiverId);
  }

  @Get('mission/:missionId')
  async getShipmentsByMission(@Param('missionId') missionId: string) {
    return this.shipmentService.getShipmentsByMission(missionId);
  }

  @Get('status/:status')
  async getShipmentsByStatus(@Param('status') status: ShipmentStatus) {
    return this.shipmentService.getShipmentsByStatus(status);
  }

  @Delete(':id')
  async deleteShipment(@Param('id') id: string) {
    return this.shipmentService.deleteShipment(id);
  }
}
