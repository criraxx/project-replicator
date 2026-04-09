import { Router, Request, Response } from 'express';
import { AuditService } from '../services/AuditService';
import { authMiddleware, requireRole } from '../utils/auth';

const router = Router();
const auditService = new AuditService();

// GET /api/audit
router.get('/audit', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const result = await auditService.listLogs(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/audit/stats
router.get('/audit/stats', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const stats = await auditService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
