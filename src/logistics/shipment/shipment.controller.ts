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
    @Query('parcelId') parcelId?: string,
    @Query('missionId') missionId?: string,
    @Query('journeyId') journeyId?: string,
    @Query('status') status?: ShipmentStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (senderId && parcelId && missionId && journeyId && status) {
      return this.shipmentService.getShipmentsByAllFilters(
        senderId,
        parcelId,
        missionId,
        journeyId,
        status,
        includeArray,
      );
    } else if (senderId && parcelId && missionId && journeyId) {
      return this.shipmentService.getShipmentsBySenderParcelMissionAndJourney(
        senderId,
        parcelId,
        missionId,
        journeyId,
        includeArray,
      );
    } else if (senderId && parcelId && missionId && status) {
      return this.shipmentService.getShipmentsBySenderParcelMissionAndStatus(
        senderId,
        parcelId,
        missionId,
        status,
        includeArray,
      );
    } else if (senderId && parcelId && journeyId && status) {
      return this.shipmentService.getShipmentsBySenderParcelJourneyAndStatus(
        senderId,
        parcelId,
        journeyId,
        status,
        includeArray,
      );
    } else if (senderId && missionId && journeyId && status) {
      return this.shipmentService.getShipmentsBySenderMissionJourneyAndStatus(
        senderId,
        missionId,
        journeyId,
        status,
        includeArray,
      );
    } else if (parcelId && missionId && journeyId && status) {
      return this.shipmentService.getShipmentsByParcelMissionJourneyAndStatus(
        parcelId,
        missionId,
        journeyId,
        status,
        includeArray,
      );
    } else if (senderId && parcelId && missionId) {
      return this.shipmentService.getShipmentsBySenderParcelAndMission(
        senderId,
        parcelId,
        missionId,
        includeArray,
      );
    } else if (senderId && parcelId && journeyId) {
      return this.shipmentService.getShipmentsBySenderParcelAndJourney(
        senderId,
        parcelId,
        journeyId,
        includeArray,
      );
    } else if (senderId && parcelId && status) {
      return this.shipmentService.getShipmentsBySenderParcelAndStatus(
        senderId,
        parcelId,
        status,
        includeArray,
      );
    } else if (senderId && missionId && journeyId) {
      return this.shipmentService.getShipmentsBySenderMissionAndJourney(
        senderId,
        missionId,
        journeyId,
        includeArray,
      );
    } else if (senderId && missionId && status) {
      return this.shipmentService.getShipmentsBySenderMissionAndStatus(
        senderId,
        missionId,
        status,
        includeArray,
      );
    } else if (senderId && journeyId && status) {
      return this.shipmentService.getShipmentsBySenderJourneyAndStatus(
        senderId,
        journeyId,
        status,
        includeArray,
      );
    } else if (parcelId && missionId && journeyId) {
      return this.shipmentService.getShipmentsByParcelMissionAndJourney(
        parcelId,
        missionId,
        journeyId,
        includeArray,
      );
    } else if (parcelId && missionId && status) {
      return this.shipmentService.getShipmentsByParcelMissionAndStatus(
        parcelId,
        missionId,
        status,
        includeArray,
      );
    } else if (parcelId && journeyId && status) {
      return this.shipmentService.getShipmentsByParcelJourneyAndStatus(
        parcelId,
        journeyId,
        status,
        includeArray,
      );
    } else if (missionId && journeyId && status) {
      return this.shipmentService.getShipmentsByMissionJourneyAndStatus(
        missionId,
        journeyId,
        status,
        includeArray,
      );
    } else if (senderId && parcelId) {
      return this.shipmentService.getShipmentsBySenderAndParcel(
        senderId,
        parcelId,
        includeArray,
      );
    } else if (senderId && missionId) {
      return this.shipmentService.getShipmentsBySenderAndMission(
        senderId,
        missionId,
        includeArray,
      );
    } else if (senderId && journeyId) {
      return this.shipmentService.getShipmentsBySenderAndJourney(
        senderId,
        journeyId,
        includeArray,
      );
    } else if (senderId && status) {
      return this.shipmentService.getShipmentsBySenderAndStatus(
        senderId,
        status,
        includeArray,
      );
    } else if (parcelId && missionId) {
      return this.shipmentService.getShipmentsByParcelAndMission(
        parcelId,
        missionId,
        includeArray,
      );
    } else if (parcelId && journeyId) {
      return this.shipmentService.getShipmentsByParcelAndJourney(
        parcelId,
        journeyId,
        includeArray,
      );
    } else if (parcelId && status) {
      return this.shipmentService.getShipmentsByParcelAndStatus(
        parcelId,
        status,
        includeArray,
      );
    } else if (missionId && journeyId) {
      return this.shipmentService.getShipmentsByMissionAndJourney(
        missionId,
        journeyId,
        includeArray,
      );
    } else if (missionId && status) {
      return this.shipmentService.getShipmentsByMissionAndStatus(
        missionId,
        status,
        includeArray,
      );
    } else if (journeyId && status) {
      return this.shipmentService.getShipmentsByJourneyAndStatus(
        journeyId,
        status,
        includeArray,
      );
    } else if (senderId) {
      return this.shipmentService.getShipmentsBySender(senderId, includeArray);
    } else if (parcelId) {
      return this.shipmentService.getShipmentsByParcel(parcelId, includeArray);
    } else if (missionId) {
      return this.shipmentService.getShipmentsByMission(
        missionId,
        includeArray,
      );
    } else if (journeyId) {
      return this.shipmentService.getShipmentsByJourney(
        journeyId,
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

  @Get('parcel/:parcelId')
  async getShipmentsByParcel(
    @Param('parcelId') parcelId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByParcel(parcelId, includeArray);
  }

  @Get('mission/:missionId')
  async getShipmentsByMission(
    @Param('missionId') missionId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByMission(missionId, includeArray);
  }

  @Get('journey/:journeyId')
  async getShipmentsByJourney(
    @Param('journeyId') journeyId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByJourney(journeyId, includeArray);
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
