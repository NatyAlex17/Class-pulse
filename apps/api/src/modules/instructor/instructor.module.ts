import { Module } from '@nestjs/common';

import { InstructorPortalController } from './controllers/instructor-portal.controller';
import { InstructorPortalRepository } from './services/instructor-portal.repository';
import { InstructorPortalService } from './services/instructor-portal.service';

@Module({
  controllers: [InstructorPortalController],
  providers: [InstructorPortalRepository, InstructorPortalService],
  exports: [InstructorPortalService],
})
export class InstructorModule {}
