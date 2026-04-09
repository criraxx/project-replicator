import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './Project';

@Entity('project_authors')
export class ProjectAuthor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  project_id!: number;

  @Column({ type: 'varchar', length: 20 })
  cpf!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ManyToOne(() => Project, (project: Project) => project.authors)
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
