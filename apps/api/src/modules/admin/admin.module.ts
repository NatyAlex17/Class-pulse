import { Module, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuthModule } from '../auth/auth.module';
import { AuditorModule } from '../auditor/auditor.module';
import { InstructorModule } from '../instructor/instructor.module';
import { StudentModule } from '../student/student.module';
import { AdminPortalController } from './controllers/admin-portal.controller';
import { AdminPortalRepository } from './services/admin-portal.repository';
import { AdminPortalService } from './services/admin-portal.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => StudentModule),
    forwardRef(() => InstructorModule),
    forwardRef(() => AuditorModule),
  ],
  controllers: [AdminPortalController],
  providers: [Reflector, SupabaseAuthGuard, AuditLogService, AdminPortalRepository, AdminPortalService],
  exports: [AdminPortalService],
})
export class AdminModule {}
