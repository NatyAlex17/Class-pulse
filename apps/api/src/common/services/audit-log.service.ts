import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { DatabaseService } from './database.service';

interface AuditLogInput {
  actorUserId?: string | null;
  actionType: string;
  targetEntityType: string;
  targetEntityId: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  context?: unknown;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly databaseService: DatabaseService) {}

  async record(input: AuditLogInput) {
    const schema = this.databaseService.getSchema();

    await this.databaseService.query(
      `
        INSERT INTO "${schema}"."audit_logs" (
          "id",
          "actor_user_id",
          "action_type",
          "target_entity_type",
          "target_entity_id",
          "before_value",
          "after_value",
          "context"
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb)
      `,
      [
        randomUUID(),
        input.actorUserId ?? null,
        input.actionType,
        input.targetEntityType,
        input.targetEntityId,
        input.beforeValue ? JSON.stringify(input.beforeValue) : null,
        input.afterValue ? JSON.stringify(input.afterValue) : null,
        input.context ? JSON.stringify(input.context) : null,
      ],
    );
  }
}
