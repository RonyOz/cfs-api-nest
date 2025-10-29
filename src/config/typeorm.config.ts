import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const TypeormConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => {
    // Si DATABASE_URL existe (producción en Render)
    if (process.env.DATABASE_URL) {
      return {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' || false,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    }

    // Si no existe DATABASE_URL, variables separadas (desarrollo local)
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'cfs',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' || false,
    };
  },
};
