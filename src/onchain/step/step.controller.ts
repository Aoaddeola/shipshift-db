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
import { StepService } from './step.service.js';
import { StepCreateDto } from './step-create.dto.js';
import { StepUpdateDto } from './step-update.dto.js';
import { StepState } from './step.types.js';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  async createStep(@Body() step: StepCreateDto) {
    return this.stepService.createStep(step);
  }

  @Get(':id')
  async getStep(@Param('id') id: string, @Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStep(id, includeArray);
  }

  @Get()
  async getSteps(
    @Query('shipmentId') shipmentId?: string,
    @Query('journeyId') journeyId?: string,
    @Query('operatorId') operatorId?: string,
    @Query('colonyId') colonyId?: string,
    @Query('agentId') agentId?: string,
    @Query('senderId') senderId?: string,
    @Query('state') state?: StepState,
    @Query('include') include?: string,
    @Query('recipientId') recipientId?: string,
    @Query('holderId') holderId?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (
      shipmentId &&
      journeyId &&
      operatorId &&
      colonyId &&
      agentId &&
      senderId &&
      state
    ) {
      return this.stepService.getStepsByAllFilters(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (
      shipmentId &&
      journeyId &&
      operatorId &&
      colonyId &&
      agentId &&
      senderId
    ) {
      return this.stepService.getStepsByShipmentJourneyOperatorColonyAgentAndSender(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (
      shipmentId &&
      journeyId &&
      operatorId &&
      colonyId &&
      agentId &&
      state
    ) {
      return this.stepService.getStepsByShipmentJourneyOperatorColonyAgentAndState(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        agentId,
        state,
        includeArray,
      );
    } else if (
      shipmentId &&
      journeyId &&
      operatorId &&
      colonyId &&
      senderId &&
      state
    ) {
      return this.stepService.getStepsByShipmentJourneyOperatorColonySenderAndState(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        senderId,
        state,
        includeArray,
      );
    } else if (
      shipmentId &&
      journeyId &&
      operatorId &&
      agentId &&
      senderId &&
      state
    ) {
      return this.stepService.getStepsByShipmentJourneyOperatorAgentSenderAndState(
        shipmentId,
        journeyId,
        operatorId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (
      shipmentId &&
      journeyId &&
      colonyId &&
      agentId &&
      senderId &&
      state
    ) {
      return this.stepService.getStepsByShipmentJourneyColonyAgentSenderAndState(
        shipmentId,
        journeyId,
        colonyId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (
      shipmentId &&
      operatorId &&
      colonyId &&
      agentId &&
      senderId &&
      state
    ) {
      return this.stepService.getStepsByShipmentOperatorColonyAgentSenderAndState(
        shipmentId,
        operatorId,
        colonyId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (
      journeyId &&
      operatorId &&
      colonyId &&
      agentId &&
      senderId &&
      state
    ) {
      return this.stepService.getStepsByJourneyOperatorColonyAgentSenderAndState(
        journeyId,
        operatorId,
        colonyId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && colonyId && agentId) {
      return this.stepService.getStepsByShipmentJourneyOperatorColonyAndAgent(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && colonyId && senderId) {
      return this.stepService.getStepsByShipmentJourneyOperatorColonyAndSender(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && colonyId && state) {
      return this.stepService.getStepsByShipmentJourneyOperatorColonyAndState(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && agentId && senderId) {
      return this.stepService.getStepsByShipmentJourneyOperatorAgentAndSender(
        shipmentId,
        journeyId,
        operatorId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && agentId && state) {
      return this.stepService.getStepsByShipmentJourneyOperatorAgentAndState(
        shipmentId,
        journeyId,
        operatorId,
        agentId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && senderId && state) {
      return this.stepService.getStepsByShipmentJourneyOperatorSenderAndState(
        shipmentId,
        journeyId,
        operatorId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && colonyId && agentId && senderId) {
      return this.stepService.getStepsByShipmentJourneyColonyAgentAndSender(
        shipmentId,
        journeyId,
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && journeyId && colonyId && agentId && state) {
      return this.stepService.getStepsByShipmentJourneyColonyAgentAndState(
        shipmentId,
        journeyId,
        colonyId,
        agentId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && colonyId && senderId && state) {
      return this.stepService.getStepsByShipmentJourneyColonySenderAndState(
        shipmentId,
        journeyId,
        colonyId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && agentId && senderId && state) {
      return this.stepService.getStepsByShipmentJourneyAgentSenderAndState(
        shipmentId,
        journeyId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && operatorId && colonyId && agentId && senderId) {
      return this.stepService.getStepsByShipmentOperatorColonyAgentAndSender(
        shipmentId,
        operatorId,
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && operatorId && colonyId && agentId && state) {
      return this.stepService.getStepsByShipmentOperatorColonyAgentAndState(
        shipmentId,
        operatorId,
        colonyId,
        agentId,
        state,
        includeArray,
      );
      // } else if (shipmentId && operatorId && colonyId && senderId && state) {
      //   return this.stepService.getStepsByShipmentOperatorColonySenderAndState(
      //     shipmentId,
      //     operatorId,
      //     colonyId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
      // } else if (shipmentId && operatorId && agentId && senderId && state) {
      //   return this.stepService.getStepsByShipmentOperatorAgentSenderAndState(
      //     shipmentId,
      //     operatorId,
      //     agentId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
      // } else if (shipmentId && colonyId && agentId && senderId && state) {
      //   return this.stepService.getStepsByShipmentColonyAgentSenderAndState(
      //     shipmentId,
      //     colonyId,
      //     agentId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
    } else if (journeyId && operatorId && colonyId && agentId && senderId) {
      return this.stepService.getStepsByJourneyOperatorColonyAgentAndSender(
        journeyId,
        operatorId,
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (journeyId && operatorId && colonyId && agentId && state) {
      return this.stepService.getStepsByJourneyOperatorColonyAgentAndState(
        journeyId,
        operatorId,
        colonyId,
        agentId,
        state,
        includeArray,
      );
    } else if (recipientId && holderId) {
      return this.stepService.getStepsByRecipientAndHolder(
        recipientId,
        holderId,
        includeArray,
      );
    } else if (recipientId) {
      return this.stepService.getStepsByRecipient(recipientId, includeArray);
    } else if (holderId) {
      return this.stepService.getStepsByHolder(holderId, includeArray);
      // } else if (journeyId && operatorId && colonyId && senderId && state) {
      //   return this.stepService.getStepsByJourneyOperatorColonySenderAndState(
      //     journeyId,
      //     operatorId,
      //     colonyId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
      // } else if (journeyId && operatorId && agentId && senderId && state) {
      //   return this.stepService.getStepsByJourneyOperatorAgentSenderAndState(
      //     journeyId,
      //     operatorId,
      //     agentId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
      // } else if (journeyId && colonyId && agentId && senderId && state) {
      //   return this.stepService.getStepsByJourneyColonyAgentSenderAndState(
      //     journeyId,
      //     colonyId,
      //     agentId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
      // } else if (operatorId && colonyId && agentId && senderId && state) {
      //   return this.stepService.getStepsByOperatorColonyAgentSenderAndState(
      //     operatorId,
      //     colonyId,
      //     agentId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
    } else if (shipmentId && journeyId && operatorId && colonyId) {
      return this.stepService.getStepsByShipmentJourneyOperatorAndColony(
        shipmentId,
        journeyId,
        operatorId,
        colonyId,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && agentId) {
      return this.stepService.getStepsByShipmentJourneyOperatorAndAgent(
        shipmentId,
        journeyId,
        operatorId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && senderId) {
      return this.stepService.getStepsByShipmentJourneyOperatorAndSender(
        shipmentId,
        journeyId,
        operatorId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && journeyId && operatorId && state) {
      return this.stepService.getStepsByShipmentJourneyOperatorAndState(
        shipmentId,
        journeyId,
        operatorId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && colonyId && agentId) {
      return this.stepService.getStepsByShipmentJourneyColonyAndAgent(
        shipmentId,
        journeyId,
        colonyId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && journeyId && colonyId && senderId) {
      return this.stepService.getStepsByShipmentJourneyColonyAndSender(
        shipmentId,
        journeyId,
        colonyId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && journeyId && colonyId && state) {
      return this.stepService.getStepsByShipmentJourneyColonyAndState(
        shipmentId,
        journeyId,
        colonyId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && agentId && senderId) {
      return this.stepService.getStepsByShipmentJourneyAgentAndSender(
        shipmentId,
        journeyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && journeyId && agentId && state) {
      return this.stepService.getStepsByShipmentJourneyAgentAndState(
        shipmentId,
        journeyId,
        agentId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId && senderId && state) {
      return this.stepService.getStepsByShipmentJourneySenderAndState(
        shipmentId,
        journeyId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && operatorId && colonyId && agentId) {
      return this.stepService.getStepsByShipmentOperatorColonyAndAgent(
        shipmentId,
        operatorId,
        colonyId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && operatorId && colonyId && senderId) {
      return this.stepService.getStepsByShipmentOperatorColonyAndSender(
        shipmentId,
        operatorId,
        colonyId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && operatorId && colonyId && state) {
      return this.stepService.getStepsByShipmentOperatorColonyAndState(
        shipmentId,
        operatorId,
        colonyId,
        state,
        includeArray,
      );
    } else if (shipmentId && operatorId && agentId && senderId) {
      return this.stepService.getStepsByShipmentOperatorAgentAndSender(
        shipmentId,
        operatorId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && operatorId && agentId && state) {
      return this.stepService.getStepsByShipmentOperatorAgentAndState(
        shipmentId,
        operatorId,
        agentId,
        state,
        includeArray,
      );
    } else if (shipmentId && operatorId && senderId && state) {
      return this.stepService.getStepsByShipmentOperatorSenderAndState(
        shipmentId,
        operatorId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && colonyId && agentId && senderId) {
      return this.stepService.getStepsByShipmentColonyAgentAndSender(
        shipmentId,
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && colonyId && agentId && state) {
      return this.stepService.getStepsByShipmentColonyAgentAndState(
        shipmentId,
        colonyId,
        agentId,
        state,
        includeArray,
      );
    } else if (shipmentId && colonyId && senderId && state) {
      return this.stepService.getStepsByShipmentColonySenderAndState(
        shipmentId,
        colonyId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && agentId && senderId && state) {
      return this.stepService.getStepsByShipmentAgentSenderAndState(
        shipmentId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (journeyId && operatorId && colonyId && agentId) {
      return this.stepService.getStepsByJourneyOperatorColonyAndAgent(
        journeyId,
        operatorId,
        colonyId,
        agentId,
        includeArray,
      );
    } else if (journeyId && operatorId && colonyId && senderId) {
      return this.stepService.getStepsByJourneyOperatorColonyAndSender(
        journeyId,
        operatorId,
        colonyId,
        senderId,
        includeArray,
      );
    } else if (journeyId && operatorId && colonyId && state) {
      return this.stepService.getStepsByJourneyOperatorColonyAndState(
        journeyId,
        operatorId,
        colonyId,
        state,
        includeArray,
      );
    } else if (journeyId && operatorId && agentId && senderId) {
      return this.stepService.getStepsByJourneyOperatorAgentAndSender(
        journeyId,
        operatorId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (journeyId && operatorId && agentId && state) {
      return this.stepService.getStepsByJourneyOperatorAgentAndState(
        journeyId,
        operatorId,
        agentId,
        state,
        includeArray,
      );
    } else if (journeyId && operatorId && senderId && state) {
      return this.stepService.getStepsByJourneyOperatorSenderAndState(
        journeyId,
        operatorId,
        senderId,
        state,
        includeArray,
      );
    } else if (journeyId && colonyId && agentId && senderId) {
      return this.stepService.getStepsByJourneyColonyAgentAndSender(
        journeyId,
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (journeyId && colonyId && agentId && state) {
      return this.stepService.getStepsByJourneyColonyAgentAndState(
        journeyId,
        colonyId,
        agentId,
        state,
        includeArray,
      );
    } else if (journeyId && colonyId && senderId && state) {
      return this.stepService.getStepsByJourneyColonySenderAndState(
        journeyId,
        colonyId,
        senderId,
        state,
        includeArray,
      );
    } else if (journeyId && agentId && senderId && state) {
      return this.stepService.getStepsByJourneyAgentSenderAndState(
        journeyId,
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (operatorId && colonyId && agentId && senderId) {
      return this.stepService.getStepsByOperatorColonyAgentAndSender(
        operatorId,
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (operatorId && colonyId && agentId && state) {
      return this.stepService.getStepsByOperatorColonyAgentAndState(
        operatorId,
        colonyId,
        agentId,
        state,
        includeArray,
      );
      // } else if (operatorId && colonyId && senderId && state) {
      //   return this.stepService.getStepsByOperatorColonySenderAndState(
      //     operatorId,
      //     colonyId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
      // } else if (operatorId && agentId && senderId && state) {
      //   return this.stepService.getStepsByOperatorAgentSenderAndState(
      //     operatorId,
      //     agentId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
      // } else if (colonyId && agentId && senderId && state) {
      //   return this.stepService.getStepsByColonyAgentSenderAndState(
      //     colonyId,
      //     agentId,
      //     senderId,
      //     state,
      //     includeArray,
      //   );
    } else if (shipmentId && journeyId && operatorId) {
      return this.stepService.getStepsByShipmentJourneyAndOperator(
        shipmentId,
        journeyId,
        operatorId,
        includeArray,
      );
    } else if (shipmentId && journeyId && colonyId) {
      return this.stepService.getStepsByShipmentJourneyAndColony(
        shipmentId,
        journeyId,
        colonyId,
        includeArray,
      );
    } else if (shipmentId && journeyId && agentId) {
      return this.stepService.getStepsByShipmentJourneyAndAgent(
        shipmentId,
        journeyId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && journeyId && senderId) {
      return this.stepService.getStepsByShipmentJourneyAndSender(
        shipmentId,
        journeyId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && journeyId && state) {
      return this.stepService.getStepsByShipmentJourneyAndState(
        shipmentId,
        journeyId,
        state,
        includeArray,
      );
    } else if (shipmentId && operatorId && colonyId) {
      return this.stepService.getStepsByShipmentOperatorAndColony(
        shipmentId,
        operatorId,
        colonyId,
        includeArray,
      );
    } else if (shipmentId && operatorId && agentId) {
      return this.stepService.getStepsByShipmentOperatorAndAgent(
        shipmentId,
        operatorId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && operatorId && senderId) {
      return this.stepService.getStepsByShipmentOperatorAndSender(
        shipmentId,
        operatorId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && operatorId && state) {
      return this.stepService.getStepsByShipmentOperatorAndState(
        shipmentId,
        operatorId,
        state,
        includeArray,
      );
    } else if (shipmentId && colonyId && agentId) {
      return this.stepService.getStepsByShipmentColonyAndAgent(
        shipmentId,
        colonyId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && colonyId && senderId) {
      return this.stepService.getStepsByShipmentColonyAndSender(
        shipmentId,
        colonyId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && colonyId && state) {
      return this.stepService.getStepsByShipmentColonyAndState(
        shipmentId,
        colonyId,
        state,
        includeArray,
      );
    } else if (shipmentId && agentId && senderId) {
      return this.stepService.getStepsByShipmentAgentAndSender(
        shipmentId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && agentId && state) {
      return this.stepService.getStepsByShipmentAgentAndState(
        shipmentId,
        agentId,
        state,
        includeArray,
      );
    } else if (shipmentId && senderId && state) {
      return this.stepService.getStepsByShipmentSenderAndState(
        shipmentId,
        senderId,
        state,
        includeArray,
      );
    } else if (journeyId && operatorId && colonyId) {
      return this.stepService.getStepsByJourneyOperatorAndColony(
        journeyId,
        operatorId,
        colonyId,
        includeArray,
      );
    } else if (journeyId && operatorId && agentId) {
      return this.stepService.getStepsByJourneyOperatorAndAgent(
        journeyId,
        operatorId,
        agentId,
        includeArray,
      );
    } else if (journeyId && operatorId && senderId) {
      return this.stepService.getStepsByJourneyOperatorAndSender(
        journeyId,
        operatorId,
        senderId,
        includeArray,
      );
    } else if (journeyId && operatorId && state) {
      return this.stepService.getStepsByJourneyOperatorAndState(
        journeyId,
        operatorId,
        state,
        includeArray,
      );
    } else if (journeyId && colonyId && agentId) {
      return this.stepService.getStepsByJourneyColonyAndAgent(
        journeyId,
        colonyId,
        agentId,
        includeArray,
      );
    } else if (journeyId && colonyId && senderId) {
      return this.stepService.getStepsByJourneyColonyAndSender(
        journeyId,
        colonyId,
        senderId,
        includeArray,
      );
    } else if (journeyId && colonyId && state) {
      return this.stepService.getStepsByJourneyColonyAndState(
        journeyId,
        colonyId,
        state,
        includeArray,
      );
    } else if (journeyId && agentId && senderId) {
      return this.stepService.getStepsByJourneyAgentAndSender(
        journeyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (journeyId && agentId && state) {
      return this.stepService.getStepsByJourneyAgentAndState(
        journeyId,
        agentId,
        state,
        includeArray,
      );
    } else if (journeyId && senderId && state) {
      return this.stepService.getStepsByJourneySenderAndState(
        journeyId,
        senderId,
        state,
        includeArray,
      );
    } else if (operatorId && colonyId && agentId) {
      return this.stepService.getStepsByOperatorColonyAndAgent(
        operatorId,
        colonyId,
        agentId,
        includeArray,
      );
    } else if (operatorId && colonyId && senderId) {
      return this.stepService.getStepsByOperatorColonyAndSender(
        operatorId,
        colonyId,
        senderId,
        includeArray,
      );
    } else if (operatorId && colonyId && state) {
      return this.stepService.getStepsByOperatorColonyAndState(
        operatorId,
        colonyId,
        state,
        includeArray,
      );
    } else if (operatorId && agentId && senderId) {
      return this.stepService.getStepsByOperatorAgentAndSender(
        operatorId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (operatorId && agentId && state) {
      return this.stepService.getStepsByOperatorAgentAndState(
        operatorId,
        agentId,
        state,
        includeArray,
      );
    } else if (operatorId && senderId && state) {
      return this.stepService.getStepsByOperatorSenderAndState(
        operatorId,
        senderId,
        state,
        includeArray,
      );
    } else if (colonyId && agentId && senderId) {
      return this.stepService.getStepsByColonyAgentAndSender(
        colonyId,
        agentId,
        senderId,
        includeArray,
      );
    } else if (colonyId && agentId && state) {
      return this.stepService.getStepsByColonyAgentAndState(
        colonyId,
        agentId,
        state,
        includeArray,
      );
    } else if (colonyId && senderId && state) {
      return this.stepService.getStepsByColonySenderAndState(
        colonyId,
        senderId,
        state,
        includeArray,
      );
    } else if (agentId && senderId && state) {
      return this.stepService.getStepsByAgentSenderAndState(
        agentId,
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId && journeyId) {
      return this.stepService.getStepsByShipmentAndJourney(
        shipmentId,
        journeyId,
        includeArray,
      );
    } else if (shipmentId && operatorId) {
      return this.stepService.getStepsByShipmentAndOperator(
        shipmentId,
        operatorId,
        includeArray,
      );
    } else if (shipmentId && colonyId) {
      return this.stepService.getStepsByShipmentAndColony(
        shipmentId,
        colonyId,
        includeArray,
      );
    } else if (shipmentId && agentId) {
      return this.stepService.getStepsByShipmentAndAgent(
        shipmentId,
        agentId,
        includeArray,
      );
    } else if (shipmentId && senderId) {
      return this.stepService.getStepsByShipmentAndSender(
        shipmentId,
        senderId,
        includeArray,
      );
    } else if (shipmentId && state) {
      return this.stepService.getStepsByShipmentAndState(
        shipmentId,
        state,
        includeArray,
      );
    } else if (journeyId && operatorId) {
      return this.stepService.getStepsByJourneyAndOperator(
        journeyId,
        operatorId,
        includeArray,
      );
    } else if (journeyId && colonyId) {
      return this.stepService.getStepsByJourneyAndColony(
        journeyId,
        colonyId,
        includeArray,
      );
    } else if (journeyId && agentId) {
      return this.stepService.getStepsByJourneyAndAgent(
        journeyId,
        agentId,
        includeArray,
      );
    } else if (journeyId && senderId) {
      return this.stepService.getStepsByJourneyAndSender(
        journeyId,
        senderId,
        includeArray,
      );
    } else if (journeyId && state) {
      return this.stepService.getStepsByJourneyAndState(
        journeyId,
        state,
        includeArray,
      );
    } else if (operatorId && colonyId) {
      return this.stepService.getStepsByOperatorAndColony(
        operatorId,
        colonyId,
        includeArray,
      );
    } else if (operatorId && agentId) {
      return this.stepService.getStepsByOperatorAndAgent(
        operatorId,
        agentId,
        includeArray,
      );
    } else if (operatorId && senderId) {
      return this.stepService.getStepsByOperatorAndSender(
        operatorId,
        senderId,
        includeArray,
      );
    } else if (operatorId && state) {
      return this.stepService.getStepsByOperatorAndState(
        operatorId,
        state,
        includeArray,
      );
    } else if (colonyId && agentId) {
      return this.stepService.getStepsByColonyAndAgent(
        colonyId,
        agentId,
        includeArray,
      );
    } else if (colonyId && senderId) {
      return this.stepService.getStepsByColonyAndSender(
        colonyId,
        senderId,
        includeArray,
      );
    } else if (colonyId && state) {
      return this.stepService.getStepsByColonyAndState(
        colonyId,
        state,
        includeArray,
      );
    } else if (agentId && senderId) {
      return this.stepService.getStepsByAgentAndSender(
        agentId,
        senderId,
        includeArray,
      );
    } else if (agentId && state) {
      return this.stepService.getStepsByAgentAndState(
        agentId,
        state,
        includeArray,
      );
    } else if (senderId && state) {
      return this.stepService.getStepsBySenderAndState(
        senderId,
        state,
        includeArray,
      );
    } else if (shipmentId) {
      return this.stepService.getStepsByShipment(shipmentId, includeArray);
    } else if (journeyId) {
      return this.stepService.getStepsByJourney(journeyId, includeArray);
    } else if (operatorId) {
      return this.stepService.getStepsByOperator(operatorId, includeArray);
    } else if (colonyId) {
      return this.stepService.getStepsByColony(colonyId, includeArray);
    } else if (agentId) {
      return this.stepService.getStepsByAgent(agentId, includeArray);
    } else if (senderId) {
      return this.stepService.getStepsBySender(senderId, includeArray);
    } else if (state) {
      return this.stepService.getStepsByState(state, includeArray);
    }
    return this.stepService.getSteps(includeArray);
  }

  @Get('shipment/:shipmentId')
  async getStepsByShipment(
    @Param('shipmentId') shipmentId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByShipment(shipmentId, includeArray);
  }

  @Get('journey/:journeyId')
  async getStepsByJourney(
    @Param('journeyId') journeyId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByJourney(journeyId, includeArray);
  }

  @Get('operator/:operatorId')
  async getStepsByOperator(
    @Param('operatorId') operatorId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByOperator(operatorId, includeArray);
  }

  @Get('recipient/:recipientId')
  async getStepsByRecipient(
    @Param('recipientId') recipientId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByRecipient(recipientId, includeArray);
  }

  @Get('holder/:holderId')
  async getStepsByHolder(
    @Param('holderId') holderId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByHolder(holderId, includeArray);
  }

  @Get('colony/:colonyId')
  async getStepsByColony(
    @Param('colonyId') colonyId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByColony(colonyId, includeArray);
  }

  @Get('agent/:agentId')
  async getStepsByAgent(
    @Param('agentId') agentId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByAgent(agentId, includeArray);
  }

  @Get('sender/:senderId')
  async getStepsBySender(
    @Param('senderId') senderId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsBySender(senderId, includeArray);
  }

  @Get('state/:state')
  async getStepsByState(
    @Param('state') state: StepState,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.stepService.getStepsByState(state, includeArray);
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

  @Delete(':id')
  async deleteStep(@Param('id') id: string) {
    return this.stepService.deleteStep(id);
  }
}
