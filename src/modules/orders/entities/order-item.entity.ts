import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * Entidad OrderItem
 * Representa cada item individual dentro de una orden
 * 
 * Relaciones:
 * - ManyToOne con Order: La orden a la que pertenece este item
 * - ManyToOne con Product: El producto que se está comprando
 * 
 * Importante:
 * - El price se guarda al momento de la compra (puede diferir del precio actual del producto)
 * - La quantity representa cuántas unidades de ese producto se compraron
 */
@Entity('order_items')
export class OrderItem {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order item unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product in the order',
  })
  @Column({
    type: 'int',
  })
  quantity: number;

  /**
   * Precio del producto al momento de la compra
   * Se almacena para mantener histórico correcto
   * (el precio actual del producto puede cambiar)
   */
  @ApiProperty({
    example: 999.99,
    description: 'Price of the product at the time of purchase',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  /**
   * Relación ManyToOne con Order
   * Muchos items pertenecen a una orden
   * onDelete: 'CASCADE' -> Si se elimina la orden, se eliminan sus items
   */
  @ApiProperty({
    description: 'Order that this item belongs to',
    type: () => Order,
  })
  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  /**
   * Relación ManyToOne con Product
   * Necesitamos la referencia al producto para:
   * - Validar stock
   * - Obtener información del seller
   * - Mostrar detalles del producto en la orden
   */
  @ApiProperty({
    description: 'Product being ordered',
    type: () => Product,
  })
  @ManyToOne(() => Product, (product) => product.orderItems, {
    eager: true, // Cargar automáticamente el producto con el item
    onDelete: 'CASCADE', // Al eliminar producto, eliminar order items (y sus órdenes)
  })
  product: Product;
}