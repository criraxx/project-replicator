import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { AuthorApprovalService } from '../services/AuthorApprovalService';
import { authMiddleware, requireRole } from '../utils/auth';
import { AuditService } from '../services/AuditService';
import { ProjectStatus } from '../entities/Project';

const router = Router();
const projectService = new ProjectService();
const auditService = new AuditService();
const authorApprovalService = new AuthorApprovalService();

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
      `Aprovação em lote: ${project_ids.length} projetos`,
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
    const { project_ids } = req.body;
    await projectService.batchReject(project_ids, req.user!.id);

    await auditService.logAction(
      'BATCH_REJECT',
      req.user!.id,
      undefined,
      undefined,
      `Rejeição em lote: ${project_ids.length} projetos`,
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

    // Non-admin users can only see their own projects
    const ownerId = req.user!.role === 'admin'
      ? (owner_id ? Number(owner_id) : undefined)
      : req.user!.id;

    const result = await projectService.listProjects(
      ownerId,
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
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects
router.post('/projects', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, summary, description, category, academic_level, start_date, end_date, authors } = req.body;

    // Determine initial status: if there are co-authors, start as 'aguardando_autores'
    const hasCoAuthors = authors && authors.length > 1;

    const project = await projectService.createProject(
      title,
      summary,
      description,
      category,
      academic_level,
      req.user!.id,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined,
      hasCoAuthors ? 'aguardando_autores' : 'pendente'
    );

    // Add authors if provided
    if (authors && authors.length > 0) {
      await authorApprovalService.addAuthorsToProject(
        project.id,
        authors.map((a: any, i: number) => ({
          ...a,
          is_owner: i === 0, // First author is the owner
        })),
        req.user!.id
      );
    }

    await auditService.logAction(
      'CREATE_PROJECT',
      req.user!.id,
      undefined,
      project.id,
      `Projeto criado: ${project.title}${hasCoAuthors ? ' (aguardando aprovação de coautores)' : ''}`,
      req.ip || 'unknown',
      'low'
    );

    res.status(201).json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/projects/:id
router.put('/projects/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const project = await projectService.updateProject(Number(req.params.id), req.body, req.user!.id);

    await auditService.logAction(
      'UPDATE_PROJECT',
      req.user!.id,
      undefined,
      project.id,
      `Projeto atualizado: ${project.title}`,
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

// DELETE /api/projects/:id
router.delete('/projects/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
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
