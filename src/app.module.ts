import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AvailabilityModule } from './availability/availability.module.js';
import { ColonyBadgeModule } from './badge/badge.module.js';
import { ColonyModule } from './colony/colony.module.js';
import { AppConfigModule } from './config/config.module.js';
import { JourneyModule } from './journey/journey.module.js';
import { MultiSigWitnessModule } from './multisig-tx-witness/pending-multisig-tx-witness.module.js';
import { MultiSigTxModule } from './multisig-txs/pending-multisig-tx.module.js';
import { StepModule } from './step/step.module.js';
import { OperatorModule } from './operator/operator.module.js';
import { StepTxModule } from './step_tx/step-tx.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CurrencyModule } from './currency/currency.module.js';
import { OrbitDBRootModule } from './orbitdb/orbitdb.module.js';

@Module({
  imports: [
    AppConfigModule,
    ScheduleModule.forRoot(),
    OrbitDBRootModule,
    AvailabilityModule,
    JourneyModule,
    ColonyBadgeModule,
    ColonyModule,
    StepModule,
    MultiSigTxModule,
    MultiSigWitnessModule,
    OperatorModule,
    StepTxModule,
    AuthModule,
    CurrencyModule,
  ],
  providers: [],
})
export class AppModule {}
