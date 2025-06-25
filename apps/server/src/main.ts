import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import {  AppConfigService, LoggerService } from './config';

async function bootstrap() {
  const logger = new LoggerService();
  const app = await NestFactory.create(AppModule, { logger: logger.createLogger() });
  const configService = app.get(AppConfigService);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  if (configService.isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('LearnTube API')
      .setDescription('API for LearnTube')
      .setVersion('1.0')
      .addTag('webhooks')
      .addTag('health')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.port;
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap().catch((error) => {
  Logger.error('❌ Error starting server', error, 'Bootstrap');
  process.exit(1);
});
