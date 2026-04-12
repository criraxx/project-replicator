import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Project, ProjectStatus } from '../entities/Project';
import { ProjectVersion } from '../entities/ProjectVersion';
import { ProjectComment } from '../entities/ProjectComment';
import { AppError } from '../middleware/errorHandler';

export class ProjectService {
  private projectRepository: Repository<Project>;
  private versionRepository: Repository<ProjectVersion>;
  private commentRepository: Repository<ProjectComment>;

  constructor() {
    this.projectRepository = AppDataSource.getRepository(Project);
    this.versionRepository = AppDataSource.getRepository(ProjectVersion);
    this.commentRepository = AppDataSource.getRepository(ProjectComment);
  }

  async createProject(
    title: string,
    summary: string,
    description: string,
    category: string,
    academicLevel: string,
    ownerId: number,
    startDate?: Date,
    endDate?: Date,
    status: ProjectStatus = 'pendente'
  ): Promise<Project> {
    const project = this.projectRepository.create({
      title,
      summary,
      description,
      category,
      academic_level: academicLevel,
      owner_id: ownerId,
      start_date: startDate,
      end_date: endDate,
      status,
    });
    return await this.projectRepository.save(project);
  }

  async getProjectById(id: number, userId?: number, isAdmin: boolean = false): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['owner', 'versions', 'comments', 'authors'],
    });
    if (!project) return null;

    // Security Check: Visibility rules
    if (!isAdmin) {
      // 1. If user is the owner, they ALWAYS have access
      if (project.owner_id === userId) {
        // Access granted
      } else {
        // 2. Drafts are ONLY visible to the owner
        if (project.status === 'rascunho') {
          return null;
        }

        // 3. For all other statuses, user must be an invited author/collaborator
        const userRepo = AppDataSource.getRepository('User');
        const user = await userRepo.findOne({ where: { id: userId } }) as any;
        const userCpf = user?.cpf?.replace(/\D/g, '');
        
        const isInvitedAuthor = project.authors?.some(a => a.cpf.replace(/\D/g, '') === userCpf);
        if (!isInvitedAuthor) {
          return null; // Access denied: user is neither owner nor collaborator
        }
      }
    }

    // Load links and files separately to avoid errors if tables are not yet migrated
    try {
      const linkRepo = AppDataSource.getRepository('ProjectLink');
      const fileRepo = AppDataSource.getRepository('ProjectFile');
      
      project.links = await linkRepo.find({ where: { project_id: id } }) as any[] || [];
      project.files = await fileRepo.find({ where: { project_id: id } }) as any[] || [];
    } catch (err) {
      console.error('Error loading project relations:', err);
      project.links = [];
      project.files = [];
    }

    return project;
  }

  async listProjects(
    ownerId?: number,
    status?: ProjectStatus,
    limit: number = 100,
    offset: number = 0,
    isAdmin: boolean = false
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
      .leftJoinAndSelect('project.authors', 'authors')
      .orderBy('project.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return { projects, total };
  }

  async listUserProjects(
    userId: number,
    cpf: string,
    status?: ProjectStatus,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ projects: Project[]; total: number }> {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Subquery to find project IDs where user is an author
    const authorSubquery = AppDataSource.getRepository('ProjectAuthor')
      .createQueryBuilder('author')
      .select('author.project_id')
      .where('author.cpf = :cleanCpf', { cleanCpf });

    let query = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.authors', 'authors')
      .where('project.is_deleted = :deleted', { deleted: false })
      .andWhere('(project.owner_id = :userId OR project.id IN (' + authorSubquery.getQuery() + '))', { userId, cleanCpf });

    if (status) {
      query = query.andWhere('project.status = :status', { status });
    }

    const total = await query.getCount();
    const projects = await query
      .orderBy('project.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return { projects, total };
  }

  async searchProjects(query: string, userId: number, isAdmin: boolean = false, userCpf?: string): Promise<Project[]> {
    const cleanCpf = userCpf?.replace(/\D/g, '');
    
    let qb = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('project.is_deleted = :deleted', { deleted: false })
      .andWhere('(project.title LIKE :query OR project.summary LIKE :query)', { query: `%${query}%` });

    if (!isAdmin) {
      const authorSubquery = AppDataSource.getRepository('ProjectAuthor')
        .createQueryBuilder('author')
        .select('author.project_id')
        .where('author.cpf = :cleanCpf', { cleanCpf });

      qb = qb.andWhere('(project.owner_id = :userId OR project.id IN (' + authorSubquery.getQuery() + '))', { userId, cleanCpf });
      // Non-admins cannot search drafts of others
      qb = qb.andWhere('(project.status != :draft OR project.owner_id = :userId)', { draft: 'rascunho', userId });
    }

    return await qb.limit(20).getMany();
  }

  async getPendingProjects(limit: number = 100, offset: number = 0) {
    return this.listProjects(undefined, 'pendente', limit, offset);
  }

  async updateProject(id: number, updates: Partial<Project>, changedBy: number, isAdmin: boolean = false): Promise<Project> {
    const project = await this.getProjectById(id, changedBy, isAdmin);
    if (!project) {
      throw new AppError(404, 'Projeto nao encontrado');
    }

    // If NOT admin and project is approved, store as pending edit request
    if (!isAdmin && project.status === 'aprovado') {
      const { status, is_deleted, deleted_at, deleted_by, reviewed_by, reviewed_at, review_comment, ...editableUpdates } = updates as any;

      await this.projectRepository.update(id, {
        has_pending_edit: true,
        pending_edit_data: JSON.stringify(editableUpdates),
        pending_edit_by: changedBy,
        pending_edit_at: new Date(),
        pending_edit_comment: (updates as any).edit_reason || 'Solicitacao de alteracao',
      });

      const updated = await this.getProjectById(id, changedBy, isAdmin);
      if (!updated) throw new AppError(404, 'Projeto nao encontrado');
      return updated;
    }

    // Admin or project not yet approved (or is draft): apply directly
    if (!isAdmin && project.owner_id !== changedBy) {
      throw new AppError(403, 'Voce nao tem permissao para editar este projeto');
    }

    for (const [field, newValue] of Object.entries(updates)) {
      if (field === 'edit_reason' || field === 'authors' || field === 'links') continue; 
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

    const { edit_reason, authors, links, ...cleanUpdates } = updates as any;
    if (Object.keys(cleanUpdates).length > 0) {
      await this.projectRepository.update(id, cleanUpdates);
    }
    
    const updated = await this.getProjectById(id, changedBy, isAdmin);
    if (!updated) throw new AppError(404, 'Projeto nao encontrado');
    return updated;
  }

  async approveProject(id: number, reviewedBy: number, comment?: string): Promise<Project> {
    return this.updateProject(id, {
      status: 'aprovado',
      reviewed_by: reviewedBy,
      review_comment: comment,
      reviewed_at: new Date(),
    } as any, reviewedBy, true);
  }

  async rejectProject(id: number, reviewedBy: number, comment?: string): Promise<Project> {
    return this.updateProject(id, {
      status: 'rejeitado',
      reviewed_by: reviewedBy,
      review_comment: comment,
      reviewed_at: new Date(),
    } as any, reviewedBy, true);
  }

  async deleteProject(id: number, userId: number, isAdmin: boolean = false): Promise<void> {
    const project = await this.getProjectById(id, userId, isAdmin);
    if (!project) throw new AppError(404, 'Projeto nao encontrado');
    
    if (!isAdmin && project.owner_id !== userId) {
      throw new AppError(403, 'Voce nao tem permissao para excluir este projeto');
    }

    await this.projectRepository.update(id, {
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: userId,
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

  async batchReject(projectIds: number[], reviewedBy: number, comment?: string): Promise<void> {
    for (const id of projectIds) {
      await this.rejectProject(id, reviewedBy, comment);
    }
  }

  async listPendingEdits(): Promise<Project[]> {
    return await this.projectRepository.find({
      where: { has_pending_edit: true, is_deleted: false },
      relations: ['owner'],
      order: { pending_edit_at: 'DESC' },
    });
  }

  async approvePendingEdit(id: number, adminId: number, comment?: string): Promise<Project> {
    const project = await this.getProjectById(id);
    if (!project) throw new AppError(404, 'Projeto nao encontrado');
    if (!project.has_pending_edit || !project.pending_edit_data) {
      throw new AppError(400, 'Nenhuma edicao pendente para este projeto');
    }

    const edits = JSON.parse(project.pending_edit_data);

    for (const [field, newValue] of Object.entries(edits)) {
      const oldValue = (project as any)[field];
      if (oldValue !== newValue) {
        const version = this.versionRepository.create({
          project_id: id,
          field_changed: field,
          old_value: String(oldValue),
          new_value: String(newValue),
          changed_by: adminId,
        });
        await this.versionRepository.save(version);
      }
    }

    await this.projectRepository.update(id, {
      ...edits,
      has_pending_edit: false,
      pending_edit_data: undefined,
      pending_edit_by: undefined,
      pending_edit_at: undefined,
      pending_edit_comment: undefined,
    });

    if (comment) {
      await this.addComment(id, adminId, `Edicao aprovada: ${comment}`);
    }

    const updated = await this.getProjectById(id);
    if (!updated) throw new AppError(404, 'Projeto nao encontrado');
    return updated;
  }

  async rejectPendingEdit(id: number, adminId: number, comment?: string): Promise<Project> {
    const project = await this.getProjectById(id);
    if (!project) throw new AppError(404, 'Projeto nao encontrado');
    if (!project.has_pending_edit) {
      throw new AppError(400, 'Nenhuma edicao pendente para este projeto');
    }

    await this.projectRepository.update(id, {
      has_pending_edit: false,
      pending_edit_data: undefined,
      pending_edit_by: undefined,
      pending_edit_at: undefined,
      pending_edit_comment: undefined,
    });

    if (comment) {
      await this.addComment(id, adminId, `Edicao rejeitada: ${comment}`);
    }

    const updated = await this.getProjectById(id);
    if (!updated) throw new AppError(404, 'Projeto nao encontrado');
    return updated;
  }
}
