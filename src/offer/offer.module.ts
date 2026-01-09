import { Module } from '@nestjs/common';
import { OrbitDBModule } from '../db/orbitdb/orbitdb.module.js';
import { OfferController } from './offer.controller.js';
import { OfferService } from './offer.service.js';
import { IPFSAccessController } from '@orbitdb/core';
import { OfferProducer } from './producers/offer.producer.js';
import { OfferConsumer } from './consumers/offer.consumer.js';
import { JourneyModule } from '../logistics/journey/journey.module.js';
import { MissionModule } from '../logistics/mission/mission.module.js';
import { StepModule } from '../onchain/step/step.module.js';
import { ShipmentModule } from '../logistics/shipment/shipment.module.js';
import { StepFactory } from '../onchain/step/step.factory.js';
import { AgentModule } from '../profiles/agent/agent.module.js';
import { OperatorModule } from '../users/operator/operator.module.js';
import { OperatorBadgeModule } from '../onchain/operator-badge/operator-badge.module.js';
import { UserModule } from '../users/user/user.module.js';
import { AgentMPFProofModule } from '../agent-mpf-proof/agent-mpf-proof.module.js';
import { ColonyNodeModule } from '../onchain/colony-node/colony-node.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    OrbitDBModule.forDatabase('offer', {
      AccessController: IPFSAccessController({ write: ['*'] }),
    }),
    MissionModule,
    JourneyModule,
    StepModule,
    ShipmentModule,
    AgentModule,
    OperatorModule,
    OperatorBadgeModule,
    UserModule,
    AgentMPFProofModule,
    ColonyNodeModule,
    JwtModule,
  ],
  controllers: [OfferController],
  providers: [OfferService, OfferProducer, OfferConsumer, StepFactory],
  exports: [OfferService],
})
export class OfferModule {}
