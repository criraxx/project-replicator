import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './Project';

@Entity('project_links')
export class ProjectLink {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  project_id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 2048 })
  url!: string;

  @ManyToOne(() => Project, (project: Project) => project.links)
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
