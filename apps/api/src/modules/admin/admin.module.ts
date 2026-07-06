import { Module, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { StudentModule } from '../student/student.module';
import { AdminPortalController } from './controllers/admin-portal.controller';
import { AdminPortalRepository } from './services/admin-portal.repository';
import { AdminPortalService } from './services/admin-portal.service';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => StudentModule)],
  controllers: [AdminPortalController],
  providers: [Reflector, SupabaseAuthGuard, AdminPortalRepository, AdminPortalService],
  exports: [AdminPortalService],
})
export class AdminModule {}
