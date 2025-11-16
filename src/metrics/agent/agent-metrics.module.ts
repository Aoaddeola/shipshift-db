import { Module } from '@nestjs/common';
import { AgentMetricsService } from './agent-metrics.service.js';
import { StepModule } from '../../onchain/step/step.module.js';
import { AgentModule } from '../../profiles/agent/agent.module.js';
import { MetricsController } from '../metrics.controller.js';
import { StepTxModule } from '../../onchain/step_tx/step-tx.module.js';

@Module({
  imports: [StepModule, StepTxModule, AgentModule],
  controllers: [MetricsController],
  providers: [AgentMetricsService],
  exports: [AgentMetricsService],
})
export class AgentMetricsModule {}
