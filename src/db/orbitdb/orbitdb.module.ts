import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';
import { OrbitDBService } from './orbitdb.service.js';
import { ORBITDB_DATABASE_TOKEN } from './inject-database.decorator.js';
import { OpenDatabaseOptions } from '@orbitdb/core';
import { Database } from './database.js';
// import { AppConfigModule } from '../../config/config.module.js';
import { AppConfigService } from '../../config/config.service.js';

export interface OrbitDBModuleOptions {
  name: string;
  options?: OpenDatabaseOptions;
}

export interface OrbitDBModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  dbName: string;
  useFactory: (
    ...args: any[]
  ) => Promise<OrbitDBModuleOptions> | OrbitDBModuleOptions;
  inject?: any[];
}

@Global()
@Module({
  providers: [OrbitDBService],
  exports: [OrbitDBService],
})
export class OrbitDBRootModule {} // Fix for orbitdb service being instantiated multiple times

@Module({})
export class OrbitDBModule {
  static forDatabase(
    name: string,
    options?: OpenDatabaseOptions,
  ): DynamicModule {
    return {
      module: OrbitDBModule,
      providers: [
        {
          provide: `${ORBITDB_DATABASE_TOKEN}_${name}`,
          useFactory: async (
            orbitdbService: OrbitDBService,
            configService: AppConfigService,
          ) => {
            return new Database(
              orbitdbService,
              configService.databases[name] || name,
              options,
            );
          },
          inject: [OrbitDBService, AppConfigService],
        },
      ],
      exports: [`${ORBITDB_DATABASE_TOKEN}_${name}`],
    };
  }
}
