import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../utils/auth';
import { AppDataSource } from '../config/database';

const router = Router();

// GET /api/admin/status
router.get('/admin/status', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'ok',
      database: AppDataSource.isInitialized,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/admin/config
router.get('/admin/config', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    res.json({
      maintenance_mode: false,
      max_upload_size: '10mb',
      allowed_file_types: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/admin/maintenance
router.post('/admin/maintenance', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { enabled, message } = req.body;
    res.json({ maintenance_mode: enabled, message: message || 'Sistema em manutenção' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/reports/dashboard
router.get('/reports/dashboard', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    res.json({
      total_users: 0,
      total_projects: 0,
      pending_projects: 0,
      approved_projects: 0,
      rejected_projects: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
