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
    @Query('fromLocationId') fromLocationId?: string,
    @Query('toLocationId') toLocationId?: string,
    @Query('missionId') missionId?: string,
    @Query('journeyId') journeyId?: string,
    @Query('status') status?: ShipmentStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (senderId && parcelId && fromLocationId && toLocationId && status) {
      return this.shipmentService.getShipmentsByAllFilters(
        senderId,
        parcelId,
        fromLocationId,
        toLocationId,
        status,
        includeArray,
      );
    } else if (senderId && parcelId && fromLocationId && toLocationId) {
      return this.shipmentService.getShipmentsBySenderParcelAndLocations(
        senderId,
        parcelId,
        fromLocationId,
        toLocationId,
        includeArray,
      );
    } else if (senderId && parcelId && fromLocationId) {
      return this.shipmentService.getShipmentsBySenderParcelAndFromLocation(
        senderId,
        parcelId,
        fromLocationId,
        includeArray,
      );
    } else if (senderId && parcelId && toLocationId) {
      return this.shipmentService.getShipmentsBySenderParcelAndToLocation(
        senderId,
        parcelId,
        toLocationId,
        includeArray,
      );
    } else if (senderId && parcelId && status) {
      return this.shipmentService.getShipmentsBySenderParcelAndStatus(
        senderId,
        parcelId,
        status,
        includeArray,
      );
    } else if (senderId && fromLocationId && toLocationId) {
      return this.shipmentService.getShipmentsBySenderAndLocations(
        senderId,
        fromLocationId,
        toLocationId,
        includeArray,
      );
    } else if (senderId && fromLocationId && status) {
      return this.shipmentService.getShipmentsBySenderFromLocationAndStatus(
        senderId,
        fromLocationId,
        status,
        includeArray,
      );
    } else if (senderId && toLocationId && status) {
      return this.shipmentService.getShipmentsBySenderToLocationAndStatus(
        senderId,
        toLocationId,
        status,
        includeArray,
      );
    } else if (parcelId && fromLocationId && toLocationId) {
      return this.shipmentService.getShipmentsByParcelAndLocations(
        parcelId,
        fromLocationId,
        toLocationId,
        includeArray,
      );
    } else if (parcelId && fromLocationId && status) {
      return this.shipmentService.getShipmentsByParcelFromLocationAndStatus(
        parcelId,
        fromLocationId,
        status,
        includeArray,
      );
    } else if (parcelId && toLocationId && status) {
      return this.shipmentService.getShipmentsByParcelToLocationAndStatus(
        parcelId,
        toLocationId,
        status,
        includeArray,
      );
    } else if (fromLocationId && toLocationId && status) {
      return this.shipmentService.getShipmentsByLocationsAndStatus(
        fromLocationId,
        toLocationId,
        status,
        includeArray,
      );
    } else if (senderId && parcelId) {
      return this.shipmentService.getShipmentsBySenderAndParcel(
        senderId,
        parcelId,
        includeArray,
      );
    } else if (senderId && fromLocationId) {
      return this.shipmentService.getShipmentsBySenderAndFromLocation(
        senderId,
        fromLocationId,
        includeArray,
      );
    } else if (senderId && toLocationId) {
      return this.shipmentService.getShipmentsBySenderAndToLocation(
        senderId,
        toLocationId,
        includeArray,
      );
    } else if (senderId && status) {
      return this.shipmentService.getShipmentsBySenderAndStatus(
        senderId,
        status,
        includeArray,
      );
    } else if (parcelId && fromLocationId) {
      return this.shipmentService.getShipmentsByParcelAndFromLocation(
        parcelId,
        fromLocationId,
        includeArray,
      );
    } else if (parcelId && toLocationId) {
      return this.shipmentService.getShipmentsByParcelAndToLocation(
        parcelId,
        toLocationId,
        includeArray,
      );
    } else if (parcelId && status) {
      return this.shipmentService.getShipmentsByParcelAndStatus(
        parcelId,
        status,
        includeArray,
      );
    } else if (fromLocationId && toLocationId) {
      return this.shipmentService.getShipmentsByLocations(
        fromLocationId,
        toLocationId,
        includeArray,
      );
    } else if (fromLocationId && status) {
      return this.shipmentService.getShipmentsByFromLocationAndStatus(
        fromLocationId,
        status,
        includeArray,
      );
    } else if (toLocationId && status) {
      return this.shipmentService.getShipmentsByToLocationAndStatus(
        toLocationId,
        status,
        includeArray,
      );
    } else if (senderId) {
      return this.shipmentService.getShipmentsBySender(senderId, includeArray);
    } else if (parcelId) {
      return this.shipmentService.getShipmentsByParcel(parcelId, includeArray);
    } else if (fromLocationId) {
      return this.shipmentService.getShipmentsByFromLocation(
        fromLocationId,
        includeArray,
      );
    } else if (toLocationId) {
      return this.shipmentService.getShipmentsByToLocation(
        toLocationId,
        includeArray,
      );
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

  @Get('from/:fromLocationId')
  async getShipmentsByFromLocation(
    @Param('fromLocationId') fromLocationId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByFromLocation(
      fromLocationId,
      includeArray,
    );
  }

  @Get('to/:toLocationId')
  async getShipmentsByToLocation(
    @Param('toLocationId') toLocationId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.shipmentService.getShipmentsByToLocation(
      toLocationId,
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
