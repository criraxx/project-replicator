import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './Project';

@Entity('project_files')
export class ProjectFile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  project_id!: number;

  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Column({ type: 'varchar', length: 255 })
  original_name!: string;

  @Column({ type: 'varchar', length: 100 })
  file_type!: string;

  @Column({ type: 'varchar', length: 500 })
  file_path!: string;

  @Column({ type: 'int' })
  file_size!: number;

  @Column({ type: 'varchar', length: 20, default: 'other' })
  file_category: string = 'other'; // 'photo' | 'pdf' | 'other'

  @Column({ type: 'int', nullable: true })
  uploaded_by?: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Project, (project: Project) => project.files)
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
