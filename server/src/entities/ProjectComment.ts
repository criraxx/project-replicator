import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';

@Entity('project_comments')
export class ProjectComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  project_id!: number;

  @Column({ type: 'int' })
  user_id!: number;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Project, (project: Project) => project.comments)
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
