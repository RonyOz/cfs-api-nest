import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number; // Precio del producto al momento de la compra

  @ManyToOne('Order', 'items', { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne('Product', 'orderItems', { eager: true })
  product: Product;
}