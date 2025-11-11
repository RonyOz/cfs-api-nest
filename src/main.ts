import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // allow all origins
  app.enableCors({ origin: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', allowedHeaders: '*', credentials: true });

  app.setGlobalPrefix('api/v1', {
    exclude: ['api-docs'],
  });

  const config = new DocumentBuilder()
    .setTitle('Campus Food Sharing (scaffold)')
    .setDescription('Minimal Nest.js scaffold for CFS API')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();