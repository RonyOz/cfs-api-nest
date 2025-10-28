import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { default: 0 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @ManyToOne(() => User, (user) => user.products, { eager: false })
  seller: User;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}
