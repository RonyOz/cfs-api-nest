import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

/**
 * Entidad Order
 * Representa una orden de compra en el sistema
 * 
 * Relaciones:
 * - ManyToOne con User (buyer): El comprador de la orden
 * - OneToMany con OrderItem: Los items que componen la orden
 */
@Entity('orders')
export class Order {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'pending',
    description: 'Order status',
    enum: ['pending', 'accepted', 'delivered', 'canceled'],
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: string; // pending, accepted, delivered, canceled

  @ApiProperty({
    example: 1999.99,
    description: 'Total amount of the order',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: number;

  @ApiProperty({
    example: 'Edificio E, Segundo piso',
    description: 'Meeting place where the buyer will receive the product',
    default: 'No especificado',
  })
  @Column({
    type: 'varchar',
    length: 255,
    default: 'No especificado',
  })
  meetingPlace: string;

  @ApiProperty({
    example: 'Efectivo',
    description: 'Payment method for the order',
    enum: ['Efectivo', 'Nequi', 'Daviplata', 'Transferencia bancaria', 'Otro'],
    default: 'Efectivo',
  })
  @Column({
    type: 'varchar',
    length: 100,
    default: 'Efectivo',
  })
  paymentMethod: string;

  /**
   * Relación ManyToOne con User (buyer)
   * Un usuario puede tener muchas órdenes como comprador
   */
  @ApiProperty({
    description: 'Buyer information',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.orders, {
    eager: false,
    onDelete: 'CASCADE',
  })
  buyer: User;

  /**
   * Relación OneToMany con OrderItem
   * Una orden puede tener muchos items
   * cascade: true -> Al guardar/eliminar orden, se guardan/eliminan items
   * eager: true -> Los items se cargan automáticamente con la orden
   */
  @ApiProperty({
    description: 'List of items in the order',
    type: () => [OrderItem],
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Order creation timestamp',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Order last update timestamp',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}