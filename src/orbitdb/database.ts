/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BaseDatabase,
  DocumentsDatabase,
  OpenDatabaseOptions,
} from '@orbitdb/core';
import { OrbitDBService } from './orbitdb.service.js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheService } from '../cache/cache.service.js';

@Injectable()
export class Database<T extends { id: string }> implements OnModuleInit {
  private database: DocumentsDatabase;
  private initPromise: Promise<void>;
  private readonly cacheKeyPrefix: string;

  constructor(
    private readonly orbitdbService: OrbitDBService,
    private readonly cacheService: CacheService,
    private readonly name: string,
    private readonly options?: OpenDatabaseOptions,
  ) {
    this.initPromise = this.initialize();
    this.cacheKeyPrefix = `db:${this.name}:`;
  }

  private async initialize() {
    this.database = (await this.orbitdbService.openDatabase(
      this.name,
      this.options,
    )) as DocumentsDatabase;

    // Set up cache invalidation on database updates
    this.database.events.on('update', (entry) => {
      this.handleDatabaseUpdate(entry);
    });

    // this.database.events.on('close', () => {
    //   console.log('close');
    // });

    // this.database.events.on('drop', () => {
    //   console.log('drop');
    // });

    // this.database.events.on('join', (peerId, heads) => {
    //   console.log('join', peerId, heads);
    // });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleDatabaseUpdate(entry: any): Promise<void> {
    // Invalidate relevant cache entries on update
    await this.invalidateCache();

    // Optional: You can be more granular here based on the entry
    // For example, if you can extract the specific key that was updated
    // you could only invalidate that specific cache entry
  }

  private getCacheKey(key: string): string {
    return `${this.cacheKeyPrefix}${key}`;
  }

  private getAllCacheKey(): string {
    return `${this.cacheKeyPrefix}all`;
  }

  private async invalidateCache(): Promise<void> {
    // Invalidate all cache entries for this database
    // In a real implementation, you might want to be more granular
    const keys = [this.getAllCacheKey()];

    // You could maintain a list of all cached keys for more precise invalidation
    await Promise.all(keys.map((key) => this.cacheService.del(key)));
  }

  async onModuleInit() {
    await this.initPromise;
  }

  async getDatabase(): Promise<BaseDatabase> {
    await this.initPromise;
    return this.database;
  }

  async put(value: T): Promise<T> {
    await this.initPromise;

    const document = {
      ...value,
      _id: value.id || crypto.randomUUID(),
    };

    await this.database.put(document);

    // Invalidate cache since we've modified data
    await this.invalidateCache();

    return value;
  }

  async get(key: string): Promise<T | null> {
    await this.initPromise;

    const cacheKey = this.getCacheKey(key);

    // Try to get from cache first
    const cached = await this.cacheService.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from database
    const result = await this.database.get(key);

    if (result) {
      const value = result.value as unknown as T;

      // Cache the result
      await this.cacheService.set(cacheKey, value);

      return value;
    }

    return null;
  }

  async all(): Promise<T[]> {
    await this.initPromise;

    const cacheKey = this.getAllCacheKey();

    // Try to get from cache first
    const cached = await this.cacheService.get<T[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from database
    const result = await (this.database as any).all();
    const data = result.map(({ value: { id, ...val } }) => ({
      id: id,
      ...val,
    }));

    // Cache the result
    await this.cacheService.set(cacheKey, data);

    return data;
  }

  async del(key: string): Promise<void> {
    await this.initPromise;
    await this.database.del(key);

    // Invalidate cache for the specific key and all entries
    await Promise.all([
      this.cacheService.del(this.getCacheKey(key)),
      this.cacheService.del(this.getAllCacheKey()),
    ]);
  }

  async getDb() {
    return this.database;
  }

  async getPeerId() {
    return this.orbitdbService.getPeerId();
  }

  // Additional cache management methods
  async clearCache(): Promise<void> {
    await this.invalidateCache();
  }

  async getCachedKeys(): Promise<string[]> {
    // This would require a more sophisticated cache implementation
    // that supports key pattern matching
    return [];
  }
}
