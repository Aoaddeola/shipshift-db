import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module.js';
import { JourneyModule } from './logistics/journey/journey.module.js';
import { StepModule } from './onchain/step/step.module.js';
import { AuthModule } from './auth/operator/auth.module.js';
import { CurrencyModule } from './common/currency/currency.module.js';
import { MultiSigWitnessModule } from './onchain/multisig-tx-witness/pending-multisig-tx-witness.module.js';
import { OperatorBadgeModule } from './onchain/operator-badge/operator-badge.module.js';
import { StepTxModule } from './onchain/step_tx/step-tx.module.js';
import { OperatorModule } from './users/operator/operator.module.js';
import { ColonyNodeModule } from './onchain/colony-node/colony-node.module.js';
import { MissionModule } from './logistics/mission/mission.module.js';
import { ParcelModule } from './logistics/parcel/parcel.module.js';
import { ShipmentModule } from './logistics/shipment/shipment.module.js';
import { LocationModule } from './common/location/location.module.js';
import { ContactDetailsModule } from './common/contact-details/contact-details.module.js';
import { OAuthModule } from './auth/oauth/oauth.module.js';
import { UserModule } from './users/user/user.module.js';
import { UserAuthModule } from './auth/users/auth.module.js';
import { CustomerModule } from './profiles/customer/customer.module.js';
import { AgentModule } from './profiles/agent/agent.module.js';
import { CacheModule } from './cache/cache.module.js';
import { MultiSigTxModule } from './onchain/multi-sig-tx/multi-sig-tx.module.js';
import { MariaDBModule } from './db/mariadb/mariadb.module.js';
import { OrbitDBRootModule } from './db/orbitdb/orbitdb.module.js';
import { AssignmentModule } from './testnet/assignment/assignment.module.js';
import { TaskModule } from './testnet/task/task.module.js';
import { TaskValidationModule } from './testnet/task-validation/task-validation.module.js';
import { AgentMetricsModule } from './metrics/agent/agent-metrics.module.js';
import { OperatorStatsModule } from './stats/stats.module.js';
import { AgentMPFProofModule } from './agent-mpf-proof/agent-mpf-proof.module.js';
import { RabbitMQRootModule } from './shared/rabbitmq/rabbitmq.module.js';
import { MessagingModule } from './shared/messaging/messaging.module.js';
import { BugReportModule } from './bug-report/bug-report.module.js';
import { OfferModule } from './offer/offer.module.js';
import { NotificationOrbitDBModule } from './notification/notification.module.js';

@Module({
  imports: [
    AppConfigModule,
    ScheduleModule.forRoot(),
    OrbitDBRootModule,
    CacheModule,
    MariaDBModule,

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

    // Metrics
    AgentMetricsModule,
    OperatorStatsModule,
    // ShipmentMetricsModule,

    // Testnet
    TaskModule,
    AssignmentModule,
    TaskValidationModule,

    // Notification
    NotificationOrbitDBModule,

    // Proof
    AgentMPFProofModule,

    RabbitMQRootModule.forRoot(),
    MessagingModule,
    OfferModule,
    NotificationOrbitDBModule,

    BugReportModule,
  ],
  providers: [],
})
export class AppModule {}
