import { Module } from '@nestjs/common';

import { AuditorPortalController } from './controllers/auditor-portal.controller';
import { AuditorPortalRepository } from './services/auditor-portal.repository';
import { AuditorPortalService } from './services/auditor-portal.service';

@Module({
  controllers: [AuditorPortalController],
  providers: [AuditorPortalRepository, AuditorPortalService],
  exports: [AuditorPortalService],
})
export class AuditorModule {}
