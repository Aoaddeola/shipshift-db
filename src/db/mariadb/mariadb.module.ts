// database/mariadb.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../users/user/user.model.js';
import { databaseConfig } from '../../config/database.config.js';
import { OAuthProvider } from '../../auth/oauth/oauth-provider.entity.js';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...databaseConfig,
      models: [User],
    }),
    SequelizeModule.forFeature([User, OAuthProvider]),
  ],
  exports: [SequelizeModule],
})
export class MariaDBModule {}
