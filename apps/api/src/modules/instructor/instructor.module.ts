import { forwardRef, Module } from '@nestjs/common';

import { ConfigStoreModule } from '../../common/services/config-store.module';
import { StudentModule } from '../student/student.module';
import { InstructorPortalController } from './controllers/instructor-portal.controller';
import { InstructorIntakeSubmissionService } from './services/instructor-intake-submission.service';
import { InstructorOnboardingQuestionsConfigService } from './services/instructor-onboarding-questions-config.service';
import { InstructorPortalRepository } from './services/instructor-portal.repository';
import { InstructorPortalService } from './services/instructor-portal.service';

@Module({
  imports: [ConfigStoreModule, forwardRef(() => StudentModule)],
  controllers: [InstructorPortalController],
  providers: [
    InstructorPortalRepository,
    InstructorPortalService,
    InstructorIntakeSubmissionService,
    InstructorOnboardingQuestionsConfigService,
  ],
  exports: [InstructorPortalService, InstructorIntakeSubmissionService, InstructorOnboardingQuestionsConfigService],
})
export class InstructorModule {}
