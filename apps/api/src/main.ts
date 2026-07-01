import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';
  const allowedOrigins =
    configuredOrigins && configuredOrigins.length > 0
      ? configuredOrigins
      : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: isDevelopment ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
