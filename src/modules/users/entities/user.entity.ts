import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @Column({ 
    type: 'text', 
    unique: true })
  email: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Username',
  })
  @Column()
  username: string;

  @Column()
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'User role',
    enum: ['user', 'admin'],
  })
  @Column({ 
    type: 'text',
    default: ['user']
  })
  role: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  twoFactorSecret: string | null;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  // Relations
  @OneToMany(() => Product, (product) => product.seller, { lazy: true })
  products: Product[];

  @OneToMany(() => Order, (order) => order.buyer, { lazy: true })
  orders: Order[];
}
