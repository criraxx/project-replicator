import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './Project';
import { User } from './User';

export type AuthorApprovalStatus = 'pendente' | 'aprovado' | 'rejeitado';

@Entity('project_authors')
export class ProjectAuthor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  project_id!: number;

  @Column({ type: 'int', nullable: true })
  user_id?: number;

  @Column({ type: 'varchar', length: 20 })
  cpf!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  institution?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  academic_level?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role_in_project?: string;

  @Column({ type: 'boolean', default: false })
  is_owner: boolean = false;

  @Column({ type: 'enum', enum: ['pendente', 'aprovado', 'rejeitado'], default: 'pendente' })
  approval_status: AuthorApprovalStatus = 'pendente';

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  @Column({ type: 'datetime', nullable: true })
  responded_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Project, (project: Project) => project.authors)
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
