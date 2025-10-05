// src/database/database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OAuthProvider } from '../auth/oauth/oauth-provider.entity.js';
import { User } from '../users/user/user.model.js';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'sqlite',
        storage: configService.get('DB_PATH', './database.sqlite'),
        models: [User, OAuthProvider],
        autoLoadModels: true,
        synchronize: true, // This creates tables if they don't exist
        logging: configService.get('DB_LOGGING', false) ? console.log : false,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private sequelize: any) {}

  async onModuleInit() {
    try {
      await this.sequelize.sync();
      console.log('Database synchronized successfully');
    } catch (error) {
      console.error('Database synchronization failed:', error);
      throw error;
    }
  }
}
