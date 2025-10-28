import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  twoFactorSecret: string | null;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;
}
