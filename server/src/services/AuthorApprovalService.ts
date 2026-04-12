import { AppDataSource } from '../config/database';
import { ProjectAuthor } from '../entities/ProjectAuthor';
import { Project } from '../entities/Project';
import { User } from '../entities/User';
import { NotificationService } from './NotificationService';
import { AppError } from '../middleware/errorHandler';

export class AuthorApprovalService {
  private authorRepository = AppDataSource.getRepository(ProjectAuthor);
  private projectRepository = AppDataSource.getRepository(Project);
  private userRepository = AppDataSource.getRepository(User);
  private notificationService = new NotificationService();

  /**
   * Add authors to a project and send notifications.
   * The project owner is auto-approved; co-authors get status 'pendente'.
   */
  async addAuthorsToProject(
    projectId: number,
    authors: Array<{
      name: string;
      cpf: string;
      institution?: string;
      academic_level?: string;
      role_in_project?: string;
      is_owner?: boolean;
    }>,
    ownerId: number
  ): Promise<ProjectAuthor[]> {
    const savedAuthors: ProjectAuthor[] = [];

    for (const authorData of authors) {
      // Try to find a matching user by CPF
      const matchedUser = await this.userRepository.findOne({ where: { cpf: authorData.cpf } });

      const author = this.authorRepository.create({
        project_id: projectId,
        user_id: matchedUser?.id,
        cpf: authorData.cpf,
        name: authorData.name,
        institution: authorData.institution,
        academic_level: authorData.academic_level,
        role_in_project: authorData.role_in_project || 'Coautor',
        is_owner: authorData.is_owner || false,
        // Owner is auto-approved
        approval_status: authorData.is_owner ? 'aprovado' : 'pendente',
        responded_at: authorData.is_owner ? new Date() : undefined,
      });

      const saved = await this.authorRepository.save(author);
      savedAuthors.push(saved);

      // Send notification to collaborators (not the owner)
      if (!authorData.is_owner && matchedUser) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        await this.notificationService.createNotification(
          matchedUser.id,
          'Solicitação de Participação',
          `Você foi adicionado como colaborador no projeto "${project?.title}". Acesse seus projetos para aprovar ou rejeitar sua participação.`,
          'warning',
          'coautoria',
          projectId
        );
      }
    }

    return savedAuthors;
  }

  /**
   * Clear all authors for a project (used before re-adding during update)
   */
  async clearAuthors(projectId: number): Promise<void> {
    await this.authorRepository.delete({ project_id: projectId });
  }

  /**
   * Get pending co-author approvals for a user
   */
  async getPendingApprovals(userId: number): Promise<ProjectAuthor[]> {
    return this.authorRepository.find({
      where: { user_id: userId, approval_status: 'pendente' },
      relations: ['project', 'project.owner'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Co-author approves their participation
   */
  async approveParticipation(authorId: number, userId: number): Promise<ProjectAuthor> {
    const author = await this.authorRepository.findOne({
      where: { id: authorId },
      relations: ['project', 'project.owner'],
    });

    if (!author) throw new AppError(404, 'Registro de autor não encontrado');
    if (author.user_id !== userId) throw new AppError(403, 'Você não tem permissão para esta ação');
    if (author.approval_status !== 'pendente') throw new AppError(400, 'Esta solicitação já foi respondida');

    author.approval_status = 'aprovado';
    author.responded_at = new Date();
    await this.authorRepository.save(author);

    // Check if all authors approved → advance project to 'pendente'
    await this.checkAndAdvanceProject(author.project_id);

    return author;
  }

  /**
   * Co-author rejects their participation with a reason
   */
  async rejectParticipation(authorId: number, userId: number, reason: string): Promise<ProjectAuthor> {
    if (!reason || reason.trim().length === 0) {
      throw new AppError(400, 'É obrigatório informar o motivo da rejeição');
    }

    const author = await this.authorRepository.findOne({
      where: { id: authorId },
      relations: ['project', 'project.owner'],
    });

    if (!author) throw new AppError(404, 'Registro de autor não encontrado');
    if (author.user_id !== userId) throw new AppError(403, 'Você não tem permissão para esta ação');
    if (author.approval_status !== 'pendente') throw new AppError(400, 'Esta solicitação já foi respondida');

    author.approval_status = 'rejeitado';
    author.rejection_reason = reason.trim();
    author.responded_at = new Date();
    await this.authorRepository.save(author);

    // Notify the project owner about the rejection
    const projToNotify = author.project;
    await this.notificationService.createNotification(
      projToNotify.owner_id,
      'Colaborador Rejeitou Participação',
      `${author.name} rejeitou participar do projeto "${projToNotify.title}". Motivo: ${reason.trim()}`,
      'error',
      'coautoria',
      projToNotify.id
    );

    // Send project back to owner (devolvido) so they can edit and resubmit
    await this.projectRepository.update(author.project_id, { 
      status: 'devolvido',
      review_comment: `Colaborador ${author.name} rejeitou participação. Motivo: ${reason.trim()}`
    });

    return author;
  }

  /**
   * Reset all non-owner author statuses to 'pendente' (used when owner resubmits after devolvido)
   */
  async resetAuthorStatuses(projectId: number): Promise<void> {
    await this.authorRepository
      .createQueryBuilder()
      .update(ProjectAuthor)
      .set({ approval_status: 'pendente', responded_at: undefined as any, rejection_reason: undefined as any })
      .where('project_id = :projectId AND is_owner = :isOwner', { projectId, isOwner: false })
      .execute();
  }

  /**
   * Check if all co-authors approved. If yes, advance to 'pendente' and notify the owner.
   */
  private async checkAndAdvanceProject(projectId: number): Promise<void> {
    const allAuthors = await this.authorRepository.find({ where: { project_id: projectId } });

    const allApproved = allAuthors.every(a => a.approval_status === 'aprovado');

    if (allApproved) {
      const project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (project && project.status === 'aguardando_autores') {
        project.status = 'pendente';
        await this.projectRepository.save(project);

        await this.notificationService.createNotification(
          project.owner_id,
          'Todos os Colaboradores Aprovaram',
          `Todos os colaboradores do projeto "${project.title}" aprovaram sua participação. O projeto agora está pendente de revisão administrativa.`,
          'success',
          'coautoria',
          projectId
        );
      }
    }
  }

  /**
   * Get author approvals for a specific project
   */
  async getProjectAuthors(projectId: number): Promise<ProjectAuthor[]> {
    return this.authorRepository.find({
      where: { project_id: projectId },
      relations: ['user'],
      order: { is_owner: 'DESC', created_at: 'ASC' },
    });
  }
}
