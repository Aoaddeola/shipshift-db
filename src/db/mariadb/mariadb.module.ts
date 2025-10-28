// database/mariadb.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../users/user/user.model.js';
import { databaseConfig } from '../../config/database.config.js';
import { OAuthProvider } from '../../auth/oauth/oauth-provider.entity.js';
import { Task } from '../../testnet/task/task.model.js';
import { Assignment } from '../../testnet/assignment/assignment.model.js';
import { ContactDetailsModel } from '../../common/contact-details/contact-details.model.js';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...databaseConfig,
      models: [User, OAuthProvider, Task, Assignment], //, ContactDetailsModel],
    }),
    SequelizeModule.forFeature([
      User,
      OAuthProvider,
      Task,
      Assignment,
      ContactDetailsModel,
    ]),
  ],
  exports: [SequelizeModule],
})
export class MariaDBModule {}
