import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'int', nullable: true })
  user_id?: number;

  @Column({ type: 'int', nullable: true })
  target_user_id?: number;

  @Column({ type: 'int', nullable: true })
  target_project_id?: number;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address?: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'low' })
  severity!: string;

  @Column({ type: 'datetime' })
  timestamp!: Date;

  @ManyToOne(() => User, (user: User) => user.audit_logs)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn()
  created_at!: Date;
}
