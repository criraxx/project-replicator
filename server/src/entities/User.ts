import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './Project';
import { AuditLog } from './AuditLog';
import { Notification } from './Notification';

export type UserRole = 'admin' | 'pesquisador' | 'bolsista';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  cpf?: string;

  @Column({ type: 'varchar', length: 255 })
  hashed_password!: string;

  @Column({ type: 'enum', enum: ['admin', 'pesquisador', 'bolsista'], default: 'bolsista' })
  role: UserRole = 'bolsista';

  @Column({ type: 'varchar', length: 300, nullable: true })
  institution?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean = true;

  @Column({ type: 'boolean', default: true })
  is_temp_password: boolean = true;

  @Column({ type: 'boolean', default: false })
  must_change_password: boolean = false;

  @Column({ type: 'datetime', nullable: true })
  last_login?: Date;

  @Column({ type: 'int', nullable: true })
  created_by?: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationships
  @OneToMany(() => Project, (project: Project) => project.owner)
  projects!: Project[];

  @OneToMany(() => AuditLog, (log: AuditLog) => log.user)
  audit_logs!: AuditLog[];

  @OneToMany(() => Notification, (notification: Notification) => notification.user)
  notifications!: Notification[];
}
