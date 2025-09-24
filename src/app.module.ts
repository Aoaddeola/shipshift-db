import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module.js';
import { JourneyModule } from './logistics/journey/journey.module.js';
import { StepModule } from './onchain/step/step.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OrbitDBRootModule } from './orbitdb/orbitdb.module.js';
import { CurrencyModule } from './common/currency/currency.module.js';
import { MultiSigWitnessModule } from './onchain/multisig-tx-witness/pending-multisig-tx-witness.module.js';
import { MultiSigTxModule } from './onchain/multisig-txs/pending-multisig-tx.module.js';
import { OperatorBadgeModule } from './onchain/operator-badge/operator-badge.module.js';
import { StepTxModule } from './onchain/step_tx/step-tx.module.js';
import { OperatorModule } from './users/operator/operator.module.js';
import { ColonyNodeModule } from './onchain/colony-node/colony-node.module.js';
import { AgentModule } from './users/agent/agent.module.js';
import { CuratorModule } from './users/curator/curator.module.js';
import { MissionModule } from './logistics/mission/mission.module.js';
import { ParcelModule } from './logistics/parcel/parcel.module.js';
import { ShipmentModule } from './logistics/shipment/shipment.module.js';
import { ContactDetailsModule } from './common/contact-details/contact-details.module.js';
import { LocationModule } from './common/location/location.module.js';
import { SequelizeModule } from '@nestjs/sequelize';
import path from 'path';
import { ContactDetailsModel } from './common/contact-details/contact-details.model.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Module({
  imports: [
    AppConfigModule,
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'database', 'contactdetails.db'),
      autoLoadModels: true,
      synchronize: true,
      models: [ContactDetailsModel],
    }),
    ScheduleModule.forRoot(),
    OrbitDBRootModule,

    // Auth
    AuthModule,

    // Common
    ContactDetailsModule,
    CurrencyModule,
    LocationModule,

    // Logistics
    JourneyModule,
    MissionModule,
    ParcelModule,
    ShipmentModule,

    // Onchain
    StepModule,
    StepTxModule,
    OperatorBadgeModule,
    ColonyNodeModule,
    MultiSigTxModule,
    MultiSigWitnessModule,

    // Users
    AgentModule,
    CuratorModule,
    OperatorModule,
  ],
  providers: [],
})
export class AppModule {}
