import { Router, Request, Response } from 'express';
import { AuthorApprovalService } from '../services/AuthorApprovalService';
import { authMiddleware } from '../utils/auth';

const router = Router();
const authorApprovalService = new AuthorApprovalService();

// GET /api/author-approvals/pending — get my pending co-author requests
router.get('/author-approvals/pending', authMiddleware, async (req: Request, res: Response) => {
  try {
    const approvals = await authorApprovalService.getPendingApprovals(req.user!.id);
    res.json(approvals);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/projects/:id/authors — get all authors for a project
router.get('/projects/:id/authors', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authors = await authorApprovalService.getProjectAuthors(Number(req.params.id));
    res.json(authors);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/author-approvals/:id/approve — approve co-authorship
router.post('/author-approvals/:id/approve', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await authorApprovalService.approveParticipation(Number(req.params.id), req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/author-approvals/:id/reject — reject co-authorship with reason
router.post('/author-approvals/:id/reject', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const result = await authorApprovalService.rejectParticipation(Number(req.params.id), req.user!.id, reason);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
