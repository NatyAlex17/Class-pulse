import { forwardRef, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { CdphPdfModule } from '../cdph-pdf/cdph-pdf.module';
import { InstructorModule } from '../instructor/instructor.module';
import { StudentPortalController } from './controllers/student-portal.controller';
import { LearningTimeGateway } from './gateways/learning-time.gateway';
import { StudentPortalRepository } from './services/student-portal.repository';
import { StudentPortalService } from './services/student-portal.service';
import { ExamConfigService } from './services/exam-config.service';
import { EnrollmentWizardConfigService } from './services/enrollment-wizard-config.service';
import { OrientationSurveyConfigService } from './services/orientation-survey-config.service';
import { IntakeSubmissionService } from './services/intake-submission.service';
import { LearningResourcesConfigService } from './services/learning-resources-config.service';
import { CohortsConfigService } from './services/cohorts-config.service';
import { DocumentRequirementsConfigService } from './services/document-requirements-config.service';
import { GeminiService } from './services/gemini.service';
import { StripePaymentsService } from './services/stripe-payments.service';

@Module({
  imports: [forwardRef(() => AuthModule), CdphPdfModule, forwardRef(() => InstructorModule)],
  controllers: [StudentPortalController],
  providers: [Reflector, SupabaseAuthGuard, ExamConfigService, EnrollmentWizardConfigService, OrientationSurveyConfigService, LearningResourcesConfigService, CohortsConfigService, DocumentRequirementsConfigService, IntakeSubmissionService, StudentPortalRepository, StudentPortalService, GeminiService, StripePaymentsService, LearningTimeGateway],
  exports: [StudentPortalService, ExamConfigService, EnrollmentWizardConfigService, OrientationSurveyConfigService, LearningResourcesConfigService, CohortsConfigService, DocumentRequirementsConfigService, IntakeSubmissionService, StripePaymentsService],
})
export class StudentModule {}
