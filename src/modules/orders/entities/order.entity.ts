import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO: Add enum for order status
  @Column({ default: 'pending' })
  status: string;

  @Column('decimal', { default: 0 })
  total: number;

  @ManyToOne('User', 'orders', { eager: false })
  buyer: User;

  @OneToMany('OrderItem', 'order', { cascade: true, eager: true })
  items: OrderItem[];
}
