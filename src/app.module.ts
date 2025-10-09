import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module.js';
import { JourneyModule } from './logistics/journey/journey.module.js';
import { StepModule } from './onchain/step/step.module.js';
import { AuthModule } from './auth/operator/auth.module.js';
import { OrbitDBRootModule } from './orbitdb/orbitdb.module.js';
import { CurrencyModule } from './common/currency/currency.module.js';
import { MultiSigWitnessModule } from './onchain/multisig-tx-witness/pending-multisig-tx-witness.module.js';
import { MultiSigTxModule } from './onchain/multisig-txs/pending-multisig-tx.module.js';
import { OperatorBadgeModule } from './onchain/operator-badge/operator-badge.module.js';
import { StepTxModule } from './onchain/step_tx/step-tx.module.js';
import { OperatorModule } from './users/operator/operator.module.js';
import { ColonyNodeModule } from './onchain/colony-node/colony-node.module.js';
import { MissionModule } from './logistics/mission/mission.module.js';
import { ParcelModule } from './logistics/parcel/parcel.module.js';
import { ShipmentModule } from './logistics/shipment/shipment.module.js';
import { LocationModule } from './common/location/location.module.js';
import { SequelizeModule } from '@nestjs/sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import { ContactDetailsModel } from './common/contact-details/contact-details.model.js';
import { ContactDetailsModule } from './common/contact-details/contact-details.module.js';
import { OAuthModule } from './auth/oauth/oauth.module.js';
import { UserModule } from './users/user/user.module.js';
import { OAuthProvider } from './auth/oauth/oauth-provider.entity.js';
import { User } from './users/user/user.model.js';
import { UserAuthModule } from './auth/users/auth.module.js';
import { CustomerModule } from './profiles/customer/customer.module.js';
import { AgentModule } from './profiles/agent/agent.module.js';
import { PlanningModule } from './planning/planning.module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Module({
  imports: [
    AppConfigModule,
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'database', 'shpshft.db'),
      autoLoadModels: true,
      synchronize: true,
      models: [ContactDetailsModel, OAuthProvider, User],
    }),
    ScheduleModule.forRoot(),
    OrbitDBRootModule,

    // Auth
    AuthModule,
    OAuthModule,
    UserAuthModule,

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
    CustomerModule,
    AgentModule,
    OperatorModule,
    UserModule,

    // Algorithm
    PlanningModule,
  ],
  providers: [],
})
export class AppModule {}
