import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { ProjectVersion } from '../entities/ProjectVersion';
import { ProjectComment } from '../entities/ProjectComment';
import { ProjectAuthor } from '../entities/ProjectAuthor';
import { ProjectLink } from '../entities/ProjectLink';
import { ProjectFile } from '../entities/ProjectFile';
import { Category } from '../entities/Category';
import { AcademicLevel } from '../entities/AcademicLevel';
import { AuditLog } from '../entities/AuditLog';
import { Notification } from '../entities/Notification';
import { SystemConfig } from '../entities/SystemConfig';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cebio_brasil',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Project,
    ProjectVersion,
    ProjectComment,
    ProjectAuthor,
    ProjectLink,
    ProjectFile,
    Category,
    AcademicLevel,
    AuditLog,
    Notification,
    SystemConfig,
  ],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscribers/**/*.ts'],
});
