import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { User } from '@supabase/supabase-js';

import { DatabaseService } from '../../../common/services/database.service';
import { LocalUserRecord } from '../types/auth-user.types';

interface LocalUserRow {
  id: string;
  supabase_user_id: string;
  email: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

function normalizeDatabaseRole(value: unknown) {
  if (
    value === 'student' ||
    value === 'instructor' ||
    value === 'admin' ||
    value === 'auditor'
  ) {
    return value;
  }

  return 'student';
}

@Injectable()
export class LocalUsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async syncSupabaseUser(user: User): Promise<LocalUserRecord> {
    const schema = this.databaseService.getSchema();
    const userEmail = user.email ?? `${user.id}@supabase.local`;
    const userRole = normalizeDatabaseRole(user.user_metadata?.role);

    const result = await this.databaseService.query<LocalUserRow>(
      `
        INSERT INTO "${schema}"."users" (
          "id",
          "supabase_user_id",
          "email",
          "role"
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("supabase_user_id")
        DO UPDATE SET
          "email" = EXCLUDED."email",
          "role" = EXCLUDED."role",
          "updated_at" = now()
        RETURNING
          "id",
          "supabase_user_id",
          "email",
          "role",
          "status",
          "created_at",
          "updated_at"
      `,
      [randomUUID(), user.id, userEmail, userRole],
    );

    return this.mapRow(result.rows[0]);
  }

  async findBySupabaseUserId(supabaseUserId: string) {
    const schema = this.databaseService.getSchema();
    const result = await this.databaseService.query<LocalUserRow>(
      `
        SELECT
          "id",
          "supabase_user_id",
          "email",
          "role",
          "status",
          "created_at",
          "updated_at"
        FROM "${schema}"."users"
        WHERE "supabase_user_id" = $1
        LIMIT 1
      `,
      [supabaseUserId],
    );

    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async listByRoles(roles: string[], options: { excludeSupabaseUserId?: string; search?: string } = {}) {
    if (roles.length === 0) {
      return [];
    }

    const schema = this.databaseService.getSchema();
    const values: Array<string | string[]> = [roles];
    const conditions = [`"role" = ANY($1)`];

    if (options.excludeSupabaseUserId) {
      values.push(options.excludeSupabaseUserId);
      conditions.push(`"supabase_user_id" <> $${values.length}`);
    }

    if (options.search?.trim()) {
      values.push(`%${options.search.trim()}%`);
      conditions.push(`"email" ILIKE $${values.length}`);
    }

    const result = await this.databaseService.query<LocalUserRow>(
      `
        SELECT
          "id",
          "supabase_user_id",
          "email",
          "role",
          "status",
          "created_at",
          "updated_at"
        FROM "${schema}"."users"
        WHERE ${conditions.join(' AND ')}
        ORDER BY "email" ASC
        LIMIT 50
      `,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values as any[],
    );

    return result.rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: LocalUserRow): LocalUserRecord {
    return {
      id: row.id,
      supabaseUserId: row.supabase_user_id,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
