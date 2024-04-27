import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getAppConfig } from './configs/app.config';

async function bootstrap() {
  const appConfig = getAppConfig();

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Wooppay Inner')
    .setDescription('Wooppay Inner')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(appConfig.port);
}
bootstrap();
