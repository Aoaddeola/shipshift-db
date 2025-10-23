// config/database.config.ts
import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const databaseConfig: SequelizeModuleOptions = {
  dialect: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'my-secret-pw',
  database: process.env.DB_NAME || 'shsh',
  autoLoadModels: true,
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};
