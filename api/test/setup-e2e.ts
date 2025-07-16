import { INestApplication, ValidationPipe } from '@nestjs/common';

export async function setupApp(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
} 