import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { UsersModule } from 'src/modules/users/users.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
    controllers: [SeedController],
    providers: [SeedService],
    imports: [PassportModule, AuthModule, UsersModule, ProductsModule, OrdersModule]
})
export class SeedModule { }