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
import { OfferService } from './offer.service.js';
import { OfferCreateDto } from './offer-create.dto.js';
import { OfferUpdateDto } from './offer-update.dto.js';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  async createOffer(@Body() offer: OfferCreateDto) {
    return this.offerService.createOffer(offer);
  }

  @Get(':id')
  async getOffer(@Param('id') id: string, @Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.offerService.getOffer(id, includeArray);
  }

  @Get(':offerId/steps')
  async getOfferSteps(@Param('offerId') offerId: string) {
    return this.offerService.getOfferSteps(offerId);
  }

  @Get('shipment/:shipmentId')
  async getOffersByShipment(
    @Param('shipmentId') shipmentId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.offerService.getOffersByShipment(shipmentId, includeArray);
  }

  @Get('mission/:missionId')
  async getOffersByMission(
    @Param('missionId') missionId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.offerService.getOffersByMission(missionId, includeArray);
  }

  @Get('journey/:journeyId')
  async getOffersByJourney(
    @Param('journeyId') journeyId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.offerService.getOffersByJourney(journeyId, includeArray);
  }

  @Get()
  async getOffers(
    @Query('shipmentId') shipmentId?: string,
    @Query('missionId') missionId?: string,
    @Query('journeyId') journeyId?: string,
  ) {
    if (shipmentId && missionId) {
      return this.offerService.getOffersByShipmentAndMission(
        shipmentId,
        missionId,
      );
    } else if (shipmentId && journeyId) {
      return this.offerService.getOffersByShipmentAndJourney(
        shipmentId,
        journeyId,
      );
    } else if (shipmentId) {
      return this.offerService.getOffersByShipment(shipmentId);
    } else if (missionId) {
      return this.offerService.getOffersByMission(missionId);
    } else if (journeyId) {
      return this.offerService.getOffersByJourney(journeyId);
    }
    return this.offerService.getOffers();
  }

  @Put(':id')
  async updateOffer(@Param('id') id: string, @Body() offer: OfferCreateDto) {
    return this.offerService.updateOffer(id, offer);
  }

  @Patch(':id')
  async partialUpdateOffer(
    @Param('id') id: string,
    @Body() update: OfferUpdateDto,
  ) {
    return this.offerService.partialUpdateOffer(id, update);
  }

  @Delete(':id')
  async deleteOffer(@Param('id') id: string) {
    return this.offerService.deleteOffer(id);
  }
}
