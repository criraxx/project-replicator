import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { authMiddleware, requireRole } from '../utils/auth';

const router = Router();
const notificationService = new NotificationService();

// GET /api/notifications
router.get('/notifications', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    const result = await notificationService.listNotifications(
      req.user!.id,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/notifications/:id/read
router.put('/notifications/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    await notificationService.markAsRead(Number(req.params.id), req.user!.id);
    res.json({ message: 'Notificação marcada como lida' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/notifications/broadcast
router.post('/notifications/broadcast', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { title, message, type } = req.body;
    await notificationService.broadcast(title, message, type);
    res.json({ message: 'Notificação enviada para todos' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
