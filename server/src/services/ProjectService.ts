import { AppDataSource } from '../config/database';
import { Project, ProjectStatus } from '../entities/Project';
import { ProjectVersion } from '../entities/ProjectVersion';
import { ProjectComment } from '../entities/ProjectComment';
import { AppError } from '../middleware/errorHandler';

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private versionRepository = AppDataSource.getRepository(ProjectVersion);
  private commentRepository = AppDataSource.getRepository(ProjectComment);

  async createProject(
    title: string,
    summary: string,
    description: string,
    category: string,
    academicLevel: string,
    ownerId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<Project> {
    const project = this.projectRepository.create({
      title,
      summary,
      description,
      category,
      academic_level: academicLevel,
      owner_id: ownerId,
      status: 'pendente',
      start_date: startDate,
      end_date: endDate,
    });

    return await this.projectRepository.save(project);
  }

  async getProjectById(id: number): Promise<Project | null> {
    return await this.projectRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['owner', 'versions', 'comments', 'authors', 'links', 'files'],
    });
  }

  async listProjects(
    ownerId?: number,
    status?: ProjectStatus,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ projects: Project[]; total: number }> {
    let query = this.projectRepository.createQueryBuilder('project')
      .where('project.is_deleted = :deleted', { deleted: false });

    if (ownerId) {
      query = query.andWhere('project.owner_id = :ownerId', { ownerId });
    }

    if (status) {
      query = query.andWhere('project.status = :status', { status });
    }

    const total = await query.getCount();
    const projects = await query
      .leftJoinAndSelect('project.owner', 'owner')
      .orderBy('project.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return { projects, total };
  }

  async getPendingProjects(limit: number = 100, offset: number = 0) {
    return this.listProjects(undefined, 'pendente', limit, offset);
  }

  async updateProject(id: number, updates: Partial<Project>, changedBy: number): Promise<Project> {
    const project = await this.getProjectById(id);
    if (!project) {
      throw new AppError(404, 'Projeto não encontrado');
    }

    // Record version history
    for (const [field, newValue] of Object.entries(updates)) {
      const oldValue = (project as any)[field];
      if (oldValue !== newValue) {
        const version = this.versionRepository.create({
          project_id: id,
          field_changed: field,
          old_value: String(oldValue),
          new_value: String(newValue),
          changed_by: changedBy,
        });
        await this.versionRepository.save(version);
      }
    }

    await this.projectRepository.update(id, updates);
    const updated = await this.getProjectById(id);
    if (!updated) {
      throw new AppError(404, 'Projeto não encontrado');
    }
    return updated;
  }

  async approveProject(id: number, reviewedBy: number, comment?: string): Promise<Project> {
    return this.updateProject(id, {
      status: 'aprovado',
      reviewed_by: reviewedBy,
      review_comment: comment,
      reviewed_at: new Date(),
    }, reviewedBy);
  }

  async rejectProject(id: number, reviewedBy: number, comment?: string): Promise<Project> {
    return this.updateProject(id, {
      status: 'rejeitado',
      reviewed_by: reviewedBy,
      review_comment: comment,
      reviewed_at: new Date(),
    }, reviewedBy);
  }

  async deleteProject(id: number, deletedBy: number): Promise<void> {
    await this.projectRepository.update(id, {
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy,
    });
  }

  async addComment(projectId: number, userId: number, content: string): Promise<ProjectComment> {
    const comment = this.commentRepository.create({
      project_id: projectId,
      user_id: userId,
      content,
    });
    return await this.commentRepository.save(comment);
  }

  async getProjectStats() {
    const total = await this.projectRepository.count({ where: { is_deleted: false } });
    const pending = await this.projectRepository.count({ where: { status: 'pendente', is_deleted: false } });
    const approved = await this.projectRepository.count({ where: { status: 'aprovado', is_deleted: false } });
    const rejected = await this.projectRepository.count({ where: { status: 'rejeitado', is_deleted: false } });

    return { total, pending, approved, rejected };
  }

  async batchApprove(projectIds: number[], reviewedBy: number): Promise<void> {
    for (const id of projectIds) {
      await this.approveProject(id, reviewedBy);
    }
  }

  async batchReject(projectIds: number[], reviewedBy: number): Promise<void> {
    for (const id of projectIds) {
      await this.rejectProject(id, reviewedBy);
    }
  }
}
