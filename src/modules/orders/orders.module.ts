import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';


/**
 * Módulo de Orders
 * Maneja todo lo relacionado con órdenes de compra:
 * - Creación de órdenes
 * - Gestión de estados
 * - Cancelación y restauración de stock
 * - Validaciones de ownership (buyer/seller)
 */
@Module({
  imports: [
    // TypeORM entities necesarias
    TypeOrmModule.forFeature([
      Order, // Entidad principal de órdenes
      OrderItem, // Items de cada orden
      Product, // Necesario para validar stock y sellers
      User, // Necesario para testing y validaciones
    ]),
    // AuthModule para usar guards y decoradores (@Auth, @GetUser)
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // Exportar por si otros módulos lo necesitan
})
export class OrdersModule {}