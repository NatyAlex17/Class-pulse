import { forwardRef, Module } from '@nestjs/common';

import { AdminModule } from '../admin/admin.module';
import { CdphPdfModule } from '../cdph-pdf/cdph-pdf.module';
import { InstructorModule } from '../instructor/instructor.module';
import { StudentModule } from '../student/student.module';
import { AuditorPortalController } from './controllers/auditor-portal.controller';
import { AuditorPortalRepository } from './services/auditor-portal.repository';
import { AuditorPortalService } from './services/auditor-portal.service';

@Module({
  imports: [StudentModule, InstructorModule, CdphPdfModule, forwardRef(() => AdminModule)],
  controllers: [AuditorPortalController],
  providers: [AuditorPortalRepository, AuditorPortalService],
  exports: [AuditorPortalService],
})
export class AuditorModule {}
