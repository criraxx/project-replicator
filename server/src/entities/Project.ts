import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { ProjectVersion } from './ProjectVersion';
import { ProjectComment } from './ProjectComment';
import { ProjectAuthor } from './ProjectAuthor';
import { ProjectLink } from './ProjectLink';
import { ProjectFile } from './ProjectFile';

export type ProjectStatus = 'rascunho' | 'pendente' | 'em_revisao' | 'aprovado' | 'rejeitado' | 'aguardando_autores' | 'devolvido';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  academic_level?: string;

  @Column({ type: 'enum', enum: ['rascunho', 'pendente', 'em_revisao', 'aprovado', 'rejeitado', 'aguardando_autores', 'devolvido'], default: 'rascunho' })
  status: ProjectStatus = 'rascunho';

  @Column({ type: 'int' })
  owner_id!: number;

  @Column({ type: 'int', nullable: true })
  reviewed_by?: number;

  @Column({ type: 'text', nullable: true })
  review_comment?: string;

  @Column({ type: 'datetime', nullable: true })
  reviewed_at?: Date;

  @Column({ type: 'date', nullable: true })
  start_date?: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean = false;

  @Column({ type: 'datetime', nullable: true })
  deleted_at?: Date;

  @Column({ type: 'int', nullable: true })
  deleted_by?: number;

  // Pending edit fields - when author requests changes on approved project
  @Column({ type: 'boolean', default: false })
  has_pending_edit: boolean = false;

  @Column({ type: 'text', nullable: true })
  pending_edit_data?: string; // JSON string of proposed changes

  @Column({ type: 'int', nullable: true })
  pending_edit_by?: number;

  @Column({ type: 'datetime', nullable: true })
  pending_edit_at?: Date;

  @Column({ type: 'text', nullable: true })
  pending_edit_comment?: string; // Author's reason for edit

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => User, (user: User) => user.projects)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => ProjectVersion, (version: ProjectVersion) => version.project)
  versions!: ProjectVersion[];

  @OneToMany(() => ProjectComment, (comment: ProjectComment) => comment.project)
  comments!: ProjectComment[];

  @OneToMany(() => ProjectAuthor, (author: ProjectAuthor) => author.project)
  authors!: ProjectAuthor[];

  @OneToMany(() => ProjectLink, (link: ProjectLink) => link.project)
  links!: ProjectLink[];

  @OneToMany(() => ProjectFile, (file: ProjectFile) => file.project)
  files!: ProjectFile[];
}
