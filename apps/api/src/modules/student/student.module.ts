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
import { CohortsConfigService } from './services/cohorts-config.service';
import { GeminiService } from './services/gemini.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [StudentPortalController],
  providers: [Reflector, SupabaseAuthGuard, ExamConfigService, EnrollmentWizardConfigService, OrientationSurveyConfigService, LearningResourcesConfigService, CohortsConfigService, IntakeSubmissionService, StudentPortalRepository, StudentPortalService, GeminiService],
  exports: [StudentPortalService, ExamConfigService, EnrollmentWizardConfigService, OrientationSurveyConfigService, LearningResourcesConfigService, CohortsConfigService, IntakeSubmissionService],
})
export class StudentModule {}
