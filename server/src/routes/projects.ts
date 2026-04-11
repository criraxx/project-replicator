import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { AuthorApprovalService } from '../services/AuthorApprovalService';
import { authMiddleware, requireRole } from '../utils/auth';
import { AuditService } from '../services/AuditService';
import { ProjectStatus } from '../entities/Project';
import { AppDataSource } from '../config/database';
import { ProjectLink } from '../entities/ProjectLink';
import {
  validateCreateProject,
  validateUpdateProject,
  validateId,
  validateProjectFilter,
  validatePagination,
  handleValidationErrors,
} from '../middleware/validation';

const router = Router();
const projectService = new ProjectService();
const auditService = new AuditService();
const authorApprovalService = new AuthorApprovalService();

// GET /api/projects/search
router.get('/projects/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) {
      return res.json([]);
    }
    const results = await projectService.searchProjects(
      String(q).trim(),
      req.user!.id,
      req.user!.role === 'admin',
      req.user!.cpf
    );
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects/stats (must be before :id)
router.get('/projects/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await projectService.getProjectStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects/pending (must be before :id)
router.get('/projects/pending', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const result = await projectService.getPendingProjects(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects/pending-edits (admin only)
router.get('/projects/pending-edits', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const projects = await projectService.listPendingEdits();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/batch/approve (must be before :id)
router.post('/projects/batch/approve', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { project_ids } = req.body;
    await projectService.batchApprove(project_ids, req.user!.id);

    await auditService.logAction(
      'BATCH_APPROVE',
      req.user!.id,
      undefined,
      undefined,
      `Aprovacao em lote: ${project_ids.length} projetos`,
      req.ip || 'unknown',
      'high'
    );

    res.json({ message: `${project_ids.length} projetos aprovados` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/batch/reject (must be before :id)
router.post('/projects/batch/reject', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { project_ids, comment } = req.body;
    await projectService.batchReject(project_ids, req.user!.id, comment);

    await auditService.logAction(
      'BATCH_REJECT',
      req.user!.id,
      undefined,
      undefined,
      `Rejeicao em lote: ${project_ids.length} projetos`,
      req.ip || 'unknown',
      'high'
    );

    res.json({ message: `${project_ids.length} projetos rejeitados` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects
router.get('/projects', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, owner_id, limit, offset } = req.query;

    if (req.user!.role === 'admin') {
      const result = await projectService.listProjects(
        owner_id ? Number(owner_id) : undefined,
        status as ProjectStatus | undefined,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined
      );
      return res.json(result);
    }

    // Non-admin: own projects + projects linked by CPF
    const result = await projectService.listUserProjects(
      req.user!.id,
      req.user!.cpf,
      status as ProjectStatus | undefined,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects/:id
router.get('/projects/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ error: 'Projeto nao encontrado' });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects
router.post('/projects', authMiddleware, ...validateCreateProject, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { title, summary, description, category, academic_level, start_date, end_date, authors, links } = req.body;

    const project = await projectService.createProject(
      title,
      summary,
      description,
      category,
      academic_level,
      req.user!.id,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined,
      'pendente'
    );

    if (authors && authors.length > 0) {
      await authorApprovalService.addAuthorsToProject(
        project.id,
        authors.map((a: any, i: number) => ({
          ...a,
          is_owner: i === 0,
        })),
        req.user!.id
      );
    }

    // Save links
    if (links && Array.isArray(links) && links.length > 0) {
      const linkRepo = AppDataSource.getRepository(ProjectLink);
      for (const l of links) {
        if (l.url) {
          const link = linkRepo.create({
            project_id: project.id,
            title: l.title || l.url,
            url: l.url,
          });
          await linkRepo.save(link);
        }
      }
    }

    const hasCoAuthors = authors && authors.length > 1;
    await auditService.logAction(
      'CREATE_PROJECT',
      req.user!.id,
      undefined,
      project.id,
      `Projeto criado: ${project.title}${hasCoAuthors ? ' (aguardando aprovacao de coautores)' : ''}`,
      req.ip || 'unknown',
      'low'
    );

    res.status(201).json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/projects/:id
router.put('/projects/:id', authMiddleware, ...validateUpdateProject, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const project = await projectService.updateProject(Number(req.params.id), req.body, req.user!.id, isAdmin);

    const action = (!isAdmin && project.has_pending_edit) ? 'REQUEST_EDIT' : 'UPDATE_PROJECT';
    const desc = (!isAdmin && project.has_pending_edit)
      ? `Solicitacao de edicao: ${project.title}`
      : `Projeto atualizado: ${project.title}`;

    await auditService.logAction(
      action,
      req.user!.id,
      undefined,
      project.id,
      desc,
      req.ip || 'unknown',
      'low'
    );

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/:id/approve
router.post('/projects/:id/approve', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.approveProject(Number(req.params.id), req.user!.id, req.body.comment);

    await auditService.logAction(
      'APPROVE_PROJECT',
      req.user!.id,
      undefined,
      project.id,
      `Projeto aprovado: ${project.title}`,
      req.ip || 'unknown',
      'medium'
    );

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/:id/reject
router.post('/projects/:id/reject', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.rejectProject(Number(req.params.id), req.user!.id, req.body.comment);

    await auditService.logAction(
      'REJECT_PROJECT',
      req.user!.id,
      undefined,
      project.id,
      `Projeto rejeitado: ${project.title}`,
      req.ip || 'unknown',
      'medium'
    );

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/:id/approve-edit (admin approves a pending edit)
router.post('/projects/:id/approve-edit', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.approvePendingEdit(Number(req.params.id), req.user!.id, req.body.comment);

    await auditService.logAction(
      'APPROVE_EDIT',
      req.user!.id,
      undefined,
      project.id,
      `Edicao aprovada: ${project.title}`,
      req.ip || 'unknown',
      'medium'
    );

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/:id/reject-edit (admin rejects a pending edit)
router.post('/projects/:id/reject-edit', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.rejectPendingEdit(Number(req.params.id), req.user!.id, req.body.comment);

    await auditService.logAction(
      'REJECT_EDIT',
      req.user!.id,
      undefined,
      project.id,
      `Edicao rejeitada: ${project.title}`,
      req.ip || 'unknown',
      'medium'
    );

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// DELETE /api/projects/:id (admin only)
router.delete('/projects/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ error: 'Projeto nao encontrado' });
    }

    await projectService.deleteProject(Number(req.params.id), req.user!.id);

    await auditService.logAction(
      'DELETE_PROJECT',
      req.user!.id,
      undefined,
      Number(req.params.id),
      `Projeto removido: ${project.title}`,
      req.ip || 'unknown',
      'high'
    );

    res.json({ message: 'Projeto removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
