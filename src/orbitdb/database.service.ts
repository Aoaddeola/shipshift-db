// src/database/database.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private sequelize: Sequelize) {}

  async onModuleInit() {
    try {
      // First, create tables without indexes
      await this.sequelize.sync({ force: false });

      // Then manually create the unique index
      await this.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS oauth_providers_provider_provider_id 
        ON oauth_providers (provider, providerId)
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      // If index creation fails, continue without it
      console.warn('Continuing without unique index on oauth_providers');
    }
  }
}
