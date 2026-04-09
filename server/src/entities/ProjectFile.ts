import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './Project';

@Entity('project_files')
export class ProjectFile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  project_id!: number;

  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Column({ type: 'varchar', length: 100 })
  file_type!: string;

  @Column({ type: 'varchar', length: 500 })
  file_path!: string;

  @Column({ type: 'int' })
  file_size!: number;

  @ManyToOne(() => Project, (project: Project) => project.files)
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
