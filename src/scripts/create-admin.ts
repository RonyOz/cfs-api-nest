import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { ValidRoles } from '../modules/auth/enums/roles.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const usersService = app.get(UsersService);

  const email = 'admin@mail.com';

  const existing = await usersService.findByEmail(email);
  if (existing) {
    console.log('⚠️ Admin ya existe. Nada que hacer.');
    process.exit(0);
  }

  await usersService.create({
    username: 'Admin',
    email,
    password: 'admin123',
    phoneNumber: '+10000000000',
    role: ValidRoles.admin,
  });

  console.log('✅ Admin creado con éxito');
  await app.close();
  process.exit(0);
}

bootstrap();
