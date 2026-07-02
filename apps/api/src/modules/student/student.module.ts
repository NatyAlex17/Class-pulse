import { forwardRef, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { StudentPortalController } from './controllers/student-portal.controller';
import { StudentPortalRepository } from './services/student-portal.repository';
import { StudentPortalService } from './services/student-portal.service';
import { ExamConfigService } from './services/exam-config.service';
import { EnrollmentWizardConfigService } from './services/enrollment-wizard-config.service';
import { OrientationSurveyConfigService } from './services/orientation-survey-config.service';
import { IntakeSubmissionService } from './services/intake-submission.service';
import { LearningResourcesConfigService } from './services/learning-resources-config.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [StudentPortalController],
  providers: [Reflector, SupabaseAuthGuard, ExamConfigService, EnrollmentWizardConfigService, OrientationSurveyConfigService, LearningResourcesConfigService, IntakeSubmissionService, StudentPortalRepository, StudentPortalService],
  exports: [StudentPortalService, ExamConfigService, EnrollmentWizardConfigService, OrientationSurveyConfigService, LearningResourcesConfigService, IntakeSubmissionService],
})
export class StudentModule {}
