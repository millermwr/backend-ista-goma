import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3001',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('ISTAG Oma - Système Académique API')
    .setDescription(
      'API RESTful pour la gestion académique LMD RDC - Licence, Master, Doctorat',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  console.log(`✅ Application démarrée sur http://localhost:${port}`);
  console.log(`📚 Documentation Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Erreur au démarrage:', error);
  process.exit(1);
});
