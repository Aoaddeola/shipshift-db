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
import { StepCreateDto } from './step-create.dto.js';
import { StepUpdateDto } from './step-update.dto.js';
import { StepService } from './step.service.js';
import { StepState } from './step.types.js';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  async createStep(@Body() step: StepCreateDto) {
    return this.stepService.createStep(step);
  }

  @Get(':id')
  async getStep(@Param('id') id: string) {
    return this.stepService.getStep(id);
  }

  @Put(':id')
  async updateStep(@Param('id') id: string, @Body() step: StepCreateDto) {
    return this.stepService.updateStep(id, step);
  }

  @Patch(':id')
  async partialUpdateStep(
    @Param('id') id: string,
    @Body() update: StepUpdateDto,
  ) {
    return this.stepService.partialUpdateStep(id, update);
  }

  @Get()
  async getSteps(
    @Query('shipmentId') shipmentId?: string,
    @Query('journeyId') journeyId?: string,
    @Query('operatorId') operatorId?: string,
    @Query('state') state?: StepState,
  ) {
    if (shipmentId && journeyId && operatorId && state) {
      return this.stepService.getStepsByAllFilters(
        shipmentId,
        journeyId,
        operatorId,
        state,
      );
    } else if (shipmentId && journeyId && operatorId) {
      return this.stepService.getStepsByShipmentJourneyAndOperator(
        shipmentId,
        journeyId,
        operatorId,
      );
    } else if (shipmentId && journeyId) {
      return this.stepService.getStepsByShipmentAndJourney(
        shipmentId,
        journeyId,
      );
    } else if (shipmentId && operatorId) {
      return this.stepService.getStepsByShipmentAndOperator(
        shipmentId,
        operatorId,
      );
    } else if (journeyId && operatorId) {
      return this.stepService.getStepsByJourneyAndOperator(
        journeyId,
        operatorId,
      );
    } else if (shipmentId && state) {
      return this.stepService.getStepsByShipmentAndState(shipmentId, state);
    } else if (journeyId && state) {
      return this.stepService.getStepsByJourneyAndState(journeyId, state);
    } else if (operatorId && state) {
      return this.stepService.getStepsByOperatorAndState(operatorId, state);
    } else if (shipmentId) {
      return this.stepService.getStepsByShipment(shipmentId);
    } else if (journeyId) {
      return this.stepService.getStepsByJourney(journeyId);
    } else if (operatorId) {
      return this.stepService.getStepsByOperator(operatorId);
    } else if (state) {
      return this.stepService.getStepsByState(state);
    }
    return this.stepService.getSteps();
  }

  @Get('shipment/:shipmentId')
  async getStepsByShipment(@Param('shipmentId') shipmentId: string) {
    return this.stepService.getStepsByShipment(shipmentId);
  }

  @Get('journey/:journeyId')
  async getStepsByJourney(@Param('journeyId') journeyId: string) {
    return this.stepService.getStepsByJourney(journeyId);
  }

  @Get('operator/:operatorId')
  async getStepsByOperator(@Param('operatorId') operatorId: string) {
    return this.stepService.getStepsByOperator(operatorId);
  }

  @Get('state/:state')
  async getStepsByState(@Param('state') state: StepState) {
    return this.stepService.getStepsByState(state);
  }

  @Delete(':id')
  async deleteStep(@Param('id') id: string) {
    return this.stepService.deleteStep(id);
  }
}
