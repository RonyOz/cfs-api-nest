import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'text', 
    unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string; // TODO: store hashed password

  @Column({ 
    type: 'text',
    default: ['user']
  })
  role: string;
}
