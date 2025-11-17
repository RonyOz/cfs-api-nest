import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request, Response } from 'express';
import { TypeormConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StorageModule } from './modules/storage/storage.module';
import { SeedModule } from './seeds/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(TypeormConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    StorageModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
