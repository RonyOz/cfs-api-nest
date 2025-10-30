import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: string; // pending, accepted, delivered, canceled

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: number;

  /**
   * Relación ManyToOne con User (buyer)
   * Un usuario puede tener muchas órdenes como comprador
   */
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
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}