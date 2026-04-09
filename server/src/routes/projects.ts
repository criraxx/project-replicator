import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { authMiddleware, requireRole } from '../utils/auth';
import { AuditService } from '../services/AuditService';

const router = Router();
const projectService = new ProjectService();
const auditService = new AuditService();

// GET /api/projects
router.get('/projects', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, owner_id, limit, offset } = req.query;
    const result = await projectService.listProjects({
      status: status as string | undefined,
      ownerId: owner_id ? Number(owner_id) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      userId: req.user!.id,
      userRole: req.user!.role,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects/stats
router.get('/projects/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await projectService.getStats(req.user!.id, req.user!.role);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects/pending
router.get('/projects/pending', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const result = await projectService.listProjects({ status: 'pendente', userId: req.user!.id, userRole: 'admin' });
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
    const project = await projectService.createProject(req.body, req.user!.id);

    await auditService.log({
      action: 'CREATE_PROJECT',
      userId: req.user!.id,
      targetProjectId: project.id,
      details: `Projeto criado: ${project.title}`,
      severity: 'low',
      ipAddress: req.ip || 'unknown',
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/projects/:id
router.put('/projects/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const project = await projectService.updateProject(Number(req.params.id), req.body, req.user!.id);

    await auditService.log({
      action: 'UPDATE_PROJECT',
      userId: req.user!.id,
      targetProjectId: project.id,
      details: `Projeto atualizado: ${project.title}`,
      severity: 'low',
      ipAddress: req.ip || 'unknown',
    });

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/:id/approve
router.post('/projects/:id/approve', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.approveProject(Number(req.params.id), req.user!.id, req.body.comment);

    await auditService.log({
      action: 'APPROVE_PROJECT',
      userId: req.user!.id,
      targetProjectId: project.id,
      details: `Projeto aprovado: ${project.title}`,
      severity: 'medium',
      ipAddress: req.ip || 'unknown',
    });

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/:id/reject
router.post('/projects/:id/reject', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.rejectProject(Number(req.params.id), req.user!.id, req.body.comment);

    await auditService.log({
      action: 'REJECT_PROJECT',
      userId: req.user!.id,
      targetProjectId: project.id,
      details: `Projeto rejeitado: ${project.title}`,
      severity: 'medium',
      ipAddress: req.ip || 'unknown',
    });

    res.json(project);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/batch/approve
router.post('/projects/batch/approve', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { project_ids } = req.body;
    for (const id of project_ids) {
      await projectService.approveProject(id, req.user!.id);
    }

    await auditService.log({
      action: 'BATCH_APPROVE',
      userId: req.user!.id,
      details: `Aprovação em lote: ${project_ids.length} projetos`,
      severity: 'high',
      ipAddress: req.ip || 'unknown',
    });

    res.json({ message: `${project_ids.length} projetos aprovados` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/projects/batch/reject
router.post('/projects/batch/reject', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { project_ids } = req.body;
    for (const id of project_ids) {
      await projectService.rejectProject(id, req.user!.id);
    }

    await auditService.log({
      action: 'BATCH_REJECT',
      userId: req.user!.id,
      details: `Rejeição em lote: ${project_ids.length} projetos`,
      severity: 'high',
      ipAddress: req.ip || 'unknown',
    });

    res.json({ message: `${project_ids.length} projetos rejeitados` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// DELETE /api/projects/:id
router.delete('/projects/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    await projectService.deleteProject(Number(req.params.id));

    await auditService.log({
      action: 'DELETE_PROJECT',
      userId: req.user!.id,
      targetProjectId: Number(req.params.id),
      details: `Projeto removido: ${project.title}`,
      severity: 'critical',
      ipAddress: req.ip || 'unknown',
    });

    res.json({ message: 'Projeto removido com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
