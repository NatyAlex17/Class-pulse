import { forwardRef, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { StudentPortalController } from './controllers/student-portal.controller';
import { StudentPortalRepository } from './services/student-portal.repository';
import { StudentPortalService } from './services/student-portal.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [StudentPortalController],
  providers: [Reflector, SupabaseAuthGuard, StudentPortalRepository, StudentPortalService],
  exports: [StudentPortalService],
})
export class StudentModule {}
