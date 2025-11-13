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
    unique: true
  })
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

  @ApiProperty({
    example: 'JBSWY3DPEHPK3PXP',
    description: '2FA secret key (base32 encoded)',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  twoFactorSecret: string | null;

  @ApiProperty({
    example: false,
    description: 'Whether 2FA is enabled for this user',
  })
  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  // Relations
  @ApiProperty({
    description: 'Products sold by this user',
    type: () => [Product],
  })
  @OneToMany('Product', 'seller')
  products: Product[];

  @ApiProperty({
    description: 'Orders made by this user',
    type: () => [Order],
  })
  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];
}
