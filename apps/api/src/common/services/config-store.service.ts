import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { DatabaseService } from './database.service';

// Config JSON files used to live on local disk. Older builds joined
// 'apps/api/.data' onto a cwd that was already apps/api, so both locations
// are checked when migrating existing data into the database.
const LEGACY_DATA_DIRS = [
  path.join(process.cwd(), 'apps/api/.data'),
  path.join(process.cwd(), '.data'),
];

@Injectable()
export class ConfigStoreService {
  private readonly logger = new Logger(ConfigStoreService.name);
  private tableReady: Promise<void> | null = null;
  private readonly writeQueues = new Map<string, Promise<void>>();

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Loads a config value from the app_configs table. When the key has never
   * been stored, falls back to the legacy on-disk JSON file (if provided) and
   * migrates it into the database so disk is no longer the source of truth.
   */
  async load<T>(key: string, legacyFileName?: string): Promise<T | null> {
    await this.ensureTable();
    const schema = this.databaseService.getSchema();
    const result = await this.databaseService.query<{ value: T }>(
      `SELECT "value" FROM "${schema}"."app_configs" WHERE "key" = $1`,
      [key],
    );

    if (result.rows.length > 0) {
      return result.rows[0].value;
    }

    if (legacyFileName) {
      const legacyValue = this.readLegacyFile<T>(legacyFileName);
      if (legacyValue !== null) {
        this.logger.log(`Migrating legacy config file "${legacyFileName}" into app_configs as "${key}".`);
        await this.upsert(key, legacyValue);
        return legacyValue;
      }
    }

    return null;
  }

  /**
   * Persists a config value. Writes to the same key are serialized so rapid
   * consecutive updates cannot land out of order. Errors are logged rather
   * than thrown, matching the old best-effort file persistence.
   */
  set(key: string, value: unknown): Promise<void> {
    const previous = this.writeQueues.get(key) ?? Promise.resolve();
    const next = previous
      .then(() => this.upsert(key, value))
      .catch((error) => {
        this.logger.error(
          `Failed to persist config "${key}"`,
          error instanceof Error ? error.stack : String(error),
        );
      });
    this.writeQueues.set(key, next);
    return next;
  }

  private async upsert(key: string, value: unknown): Promise<void> {
    await this.ensureTable();
    const schema = this.databaseService.getSchema();
    await this.databaseService.query(
      `INSERT INTO "${schema}"."app_configs" ("key", "value", "updated_at")
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updated_at" = now()`,
      [key, JSON.stringify(value)],
    );
  }

  private ensureTable(): Promise<void> {
    if (!this.tableReady) {
      const schema = this.databaseService.getSchema();
      this.tableReady = this.databaseService
        .query(
          `CREATE TABLE IF NOT EXISTS "${schema}"."app_configs" (
            "key" text PRIMARY KEY,
            "value" jsonb NOT NULL,
            "updated_at" timestamptz NOT NULL DEFAULT now()
          )`,
        )
        .then(() => undefined)
        .catch((error) => {
          this.tableReady = null;
          throw error;
        });
    }
    return this.tableReady;
  }

  private readLegacyFile<T>(fileName: string): T | null {
    for (const dir of LEGACY_DATA_DIRS) {
      const filePath = path.join(dir, fileName);
      try {
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
        }
      } catch (error) {
        this.logger.warn(
          `Could not read legacy config file "${filePath}": ${error instanceof Error ? error.message : error}`,
        );
      }
    }
    return null;
  }
}
