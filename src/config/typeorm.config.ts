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
    // build extra/ssl options
    const dbSsl = process.env.DB_SSL === 'true' || (process.env.DB_HOST || '').includes('supabase.co');
    const sslOption = dbSsl ? { rejectUnauthorized: process.env.DB_SSL_STRICT === 'true' } : false;

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'cfs',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' || false,
      // Enable basic logging to help debug connection issues during startup
      logging: process.env.TYPEORM_LOGGING === 'true' || ['error'],
      // Provide top-level ssl option (pg accepts this) and extra options for the pool
      ssl: sslOption,
      extra: (() => {
        const extra: any = {};
        // connection timeout (ms) - fail fast if DB unreachable
        extra['connectionTimeoutMillis'] = parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '10000', 10);
        // some drivers expect ssl under extra as well
        if (dbSsl) extra['ssl'] = sslOption;
        return extra;
      })(),
      // TODO: adjust migrations and other connection options
    };
  },
};
