import { Module } from '@nestjs/common';

import { AdminPortalController } from './controllers/admin-portal.controller';
import { AdminPortalRepository } from './services/admin-portal.repository';
import { AdminPortalService } from './services/admin-portal.service';

@Module({
  controllers: [AdminPortalController],
  providers: [AdminPortalRepository, AdminPortalService],
  exports: [AdminPortalService],
})
export class AdminModule {}
