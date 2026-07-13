import { Module } from '@nestjs/common';

import { ConfigStoreService } from './config-store.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService, ConfigStoreService],
  exports: [ConfigStoreService],
})
export class ConfigStoreModule {}
