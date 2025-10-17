import { DynamicModule, Module, Global, ModuleMetadata } from '@nestjs/common';
import { OrbitDBService } from './orbitdb.service.js';
import { ORBITDB_DATABASE_TOKEN } from './inject-database.decorator.js';
import { OpenDatabaseOptions } from '@orbitdb/core';
import { Database } from './database.js';
import { AppConfigService } from '../config/config.service.js';
import { CacheService } from '../cache/cache.service.js';
import { CacheModule } from '../cache/cache.module.js';

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
export class OrbitDBRootModule {} // Renamed root module

@Module({})
export class OrbitDBModule {
  static forDatabase(
    name: string,
    options?: OpenDatabaseOptions,
  ): DynamicModule {
    return {
      module: OrbitDBModule,
      imports: [CacheModule],
      providers: [
        {
          provide: `${ORBITDB_DATABASE_TOKEN}_${name}`,
          useFactory: async (
            orbitdbService: OrbitDBService,
            configService: AppConfigService,
            cacheService: CacheService,
          ) => {
            return new Database(
              orbitdbService,
              cacheService,
              configService.databases[name] || name,
              options,
            );
          },
          inject: [OrbitDBService, AppConfigService, CacheService],
        },
      ],
      exports: [`${ORBITDB_DATABASE_TOKEN}_${name}`],
    };
  }
}
