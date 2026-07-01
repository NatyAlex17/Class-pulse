import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard';
import { AuditLogService } from '../../common/services/audit-log.service';
import { DatabaseService } from '../../common/services/database.service';
import { AuthModule } from '../auth/auth.module';
import { MessagingController } from './controllers/messaging.controller';
import { MessagingService } from './services/messaging.service';

@Module({
  imports: [AuthModule],
  controllers: [MessagingController],
  providers: [
    Reflector,
    DatabaseService,
    AuditLogService,
    SupabaseAuthGuard,
    MessagingService,
  ],
})
export class MessagingModule {}
