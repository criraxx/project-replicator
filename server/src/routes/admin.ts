import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../utils/auth';
import { AppDataSource } from '../config/database';
import { enableMaintenance, disableMaintenance, getMaintenanceStatus } from '../middleware/maintenance';
import { UserService } from '../services/UserService';
import { ProjectService } from '../services/ProjectService';

const router = Router();
const userService = new UserService();
const projectService = new ProjectService();

// GET /api/admin/status
router.get('/admin/status', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'ok',
      database: AppDataSource.isInitialized,
      maintenance: getMaintenanceStatus(),
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
      maintenance: getMaintenanceStatus(),
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
    if (enabled) {
      enableMaintenance(message);
    } else {
      disableMaintenance();
    }
    res.json(getMaintenanceStatus());
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/reports/dashboard
router.get('/reports/dashboard', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const users = await userService.listUsers();
    const projectStats = await projectService.getProjectStats();

    res.json({
      total_users: users.length,
      active_users: users.filter((u) => u.is_active).length,
      total_projects: projectStats.total,
      pending_projects: projectStats.pending,
      approved_projects: projectStats.approved,
      rejected_projects: projectStats.rejected,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
