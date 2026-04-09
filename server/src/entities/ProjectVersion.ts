import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';

@Entity('project_versions')
export class ProjectVersion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  project_id!: number;

  @Column({ type: 'varchar', length: 100 })
  field_changed!: string;

  @Column({ type: 'text', nullable: true })
  old_value?: string;

  @Column({ type: 'text', nullable: true })
  new_value?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'int' })
  changed_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relationships
  @ManyToOne(() => Project, (project: Project) => project.versions)
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  user!: User;
}
