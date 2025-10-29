import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { UsersModule } from 'src/modules/users/users.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { OrdersModule } from 'src/modules/orders/orders.module';

@Module({
    controllers: [SeedController],
    providers: [SeedService],
    imports: [UsersModule, ProductsModule, OrdersModule]
})
export class SeedModule { }