import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { MetricsController } from './metrics.controller.js';
import { StepModule } from '../../onchain/step/step.module.js';
import { JourneyModule } from '../../logistics/journey/journey.module.js';
import { AgentModule } from '../../profiles/agent/agent.module.js';

@Module({
  imports: [StepModule, JourneyModule, AgentModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
