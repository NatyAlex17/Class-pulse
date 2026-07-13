import { Module } from '@nestjs/common';

import { CdphPdfService } from './services/cdph-pdf.service';

@Module({
  providers: [CdphPdfService],
  exports: [CdphPdfService],
})
export class CdphPdfModule {}
