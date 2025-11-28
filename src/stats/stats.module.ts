import { Module } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { OperatorModule } from '../users/operator/operator.module.js';
import { StatsController } from './stats.controller.js';
import { ShipmentModule } from '../logistics/shipment/shipment.module.js';
import { AgentModule } from '../profiles/agent/agent.module.js';
import { StepModule } from '../onchain/step/step.module.js';

@Module({
  imports: [OperatorModule, ShipmentModule, AgentModule, StepModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class OperatorStatsModule {}
