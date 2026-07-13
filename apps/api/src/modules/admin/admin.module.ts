import { Module, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard';
import { AuditLogService } from '../../common/services/audit-log.service';
import { ConfigStoreModule } from '../../common/services/config-store.module';
import { AuthModule } from '../auth/auth.module';
import { AuditorModule } from '../auditor/auditor.module';
import { CdphPdfModule } from '../cdph-pdf/cdph-pdf.module';
import { InstructorModule } from '../instructor/instructor.module';
import { StudentModule } from '../student/student.module';
import { AdminPortalController } from './controllers/admin-portal.controller';
import { CdphE276ConfigService } from './services/cdph-e276-config.service';
import { AdminPortalRepository } from './services/admin-portal.repository';
import { AdminPortalService } from './services/admin-portal.service';

@Module({
  imports: [
    ConfigStoreModule,
    forwardRef(() => AuthModule),
    forwardRef(() => StudentModule),
    forwardRef(() => InstructorModule),
    forwardRef(() => AuditorModule),
    CdphPdfModule,
  ],
  controllers: [AdminPortalController],
  providers: [
    Reflector,
    SupabaseAuthGuard,
    AuditLogService,
    AdminPortalRepository,
    AdminPortalService,
    CdphE276ConfigService,
  ],
  exports: [AdminPortalService, CdphE276ConfigService],
})
export class AdminModule {}
