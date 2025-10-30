import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'Product name',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Latest iPhone with A17 Pro chip',
    description: 'Product description',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price',
  })
  @Column('decimal', { default: 0 })
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Available stock quantity',
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    description: 'Product seller information',
    type: () => User,
  })
  @ManyToOne('User', 'products', { eager: false })
  seller: User;

// @OneToMany('OrderItem', 'product')
// orderItems: OrderItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
