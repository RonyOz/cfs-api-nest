import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column('int')
  quantity: number;

  @Column({ default: 'pending' })
  status: string;
}
