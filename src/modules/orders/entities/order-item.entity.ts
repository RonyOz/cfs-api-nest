import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'int',
  })
  quantity: number;

  /**
   * Precio del producto al momento de la compra
   * Se almacena para mantener histórico correcto
   * (el precio actual del producto puede cambiar)
   */
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
  @ManyToOne(() => Product, (product) => product.orderItems, {
    eager: true, // Cargar automáticamente el producto con el item
    onDelete: 'RESTRICT', // No permitir eliminar productos con órdenes
  })
  product: Product;
}