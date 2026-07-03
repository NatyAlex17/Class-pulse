import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

import { AppModule } from './app.module';
import { UPLOADS_DIR, UPLOADS_URL_PREFIX } from './common/utils/upload-paths';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST?.trim() || '127.0.0.1';
  const configuredOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins =
    configuredOrigins && configuredOrigins.length > 0
      ? configuredOrigins
      : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
  });

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  app.useStaticAssets(UPLOADS_DIR, { prefix: `${UPLOADS_URL_PREFIX}/` });

  await app.listen(port, host);
}
bootstrap();
