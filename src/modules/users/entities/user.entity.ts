import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'text', 
    unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ 
    type: 'text',
    default: ['user']
  })
  role: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  twoFactorSecret: string | null;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;
}
