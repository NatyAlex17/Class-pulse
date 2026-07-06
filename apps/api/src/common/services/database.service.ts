import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult } from 'pg';

type QueryParam = string | number | boolean | Date | null;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly schema: string;
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    this.schema = this.getSchemaName();
    this.pool = new Pool(this.getConnectionOptions());
  }

  async onModuleInit() {
    await this.ensureCoreTables();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<TRecord>(text: string, values: QueryParam[] = []): Promise<QueryResult<TRecord>> {
    return this.pool.query<TRecord>(text, values);
  }

  async withClient<TValue>(callback: (client: PoolClient) => Promise<TValue>): Promise<TValue> {
    const client = await this.pool.connect();

    try {
      return await callback(client);
    } finally {
      client.release();
    }
  }

  getSchema() {
    return this.schema;
  }

  private getConnectionOptions() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (databaseUrl) {
      return {
        connectionString: databaseUrl,
      };
    }

    return {
      host: this.configService.get<string>('DB_HOST', '127.0.0.1'),
      port: Number(this.configService.get<string>('DB_PORT', '5432')),
      user: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_DATABASE', 'class_verse'),
    };
  }

  private getSchemaName() {
    const schema = this.configService.get<string>('DB_SCHEMA', 'public');

    if (!schema || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid DB_SCHEMA value "${schema ?? ''}".`);
    }

    return schema;
  }

  private async ensureCoreTables() {
    const schema = this.schema;

    await this.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await this.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."users" (
        "id" uuid PRIMARY KEY,
        "supabase_user_id" text NOT NULL UNIQUE,
        "email" text NOT NULL,
        "role" text NOT NULL DEFAULT 'student',
        "status" text NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await this.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."audit_logs" (
        "id" uuid PRIMARY KEY,
        "actor_user_id" uuid NULL,
        "action_type" text NOT NULL,
        "target_entity_type" text NOT NULL,
        "target_entity_id" text NOT NULL,
        "before_value" jsonb NULL,
        "after_value" jsonb NULL,
        "context" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    this.logger.log(`Database ready. Using schema "${schema}".`);
  }
}
