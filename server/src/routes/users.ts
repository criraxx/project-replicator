import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { authMiddleware, requireRole } from '../utils/auth';
import { AuditService } from '../services/AuditService';
import { hashPassword } from '../middleware/auth';
import { UserRole } from '../entities/User';

const router = Router();
const userService = new UserService();
const auditService = new AuditService();

// GET /api/users
router.get('/users', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { role, active } = req.query;
    const users = await userService.listUsers(
      role as UserRole | undefined,
      active !== undefined ? active === 'true' : undefined
    );
    res.json(users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      institution: u.institution,
      is_active: u.is_active,
      created_at: u.created_at,
      last_login: u.last_login,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/users/:id
router.get('/users/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/users
router.post('/users', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, institution } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
    }

    const user = await userService.createUser(email, name, password, role, institution, req.user!.id);

    await auditService.log({
      action: 'CREATE_USER',
      userId: req.user!.id,
      details: `Usuário criado: ${email} (${role})`,
      severity: 'medium',
      ipAddress: req.ip || 'unknown',
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/users/batch - Criação em lote
router.post('/users/batch', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { users: usersData } = req.body;

    if (!Array.isArray(usersData) || usersData.length === 0) {
      return res.status(400).json({ error: 'Lista de usuários é obrigatória' });
    }

    const defaultPassword = req.body.default_password || 'cebio2024';
    const results: { success: any[]; errors: any[] } = { success: [], errors: [] };

    for (const userData of usersData) {
      try {
        if (!userData.email || !userData.name) {
          results.errors.push({ email: userData.email, error: 'Email e nome são obrigatórios' });
          continue;
        }

        const user = await userService.createUser(
          userData.email,
          userData.name,
          defaultPassword,
          userData.role || 'bolsista',
          userData.institution,
          req.user!.id
        );

        results.success.push({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } catch (err: any) {
        results.errors.push({ email: userData.email, error: err.message });
      }
    }

    await auditService.log({
      action: 'BATCH_CREATE_USERS',
      userId: req.user!.id,
      details: `Criação em lote: ${results.success.length} criados, ${results.errors.length} erros`,
      severity: 'high',
      ipAddress: req.ip || 'unknown',
    });

    res.status(201).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/users/:id
router.put('/users/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const user = await userService.updateUser(Number(req.params.id), updates);

    await auditService.log({
      action: 'UPDATE_USER',
      userId: req.user!.id,
      details: `Usuário atualizado: ${user.email}`,
      severity: 'medium',
      ipAddress: req.ip || 'unknown',
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      is_active: user.is_active,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/users/:id/reset-password - Reset de senha pelo admin
router.put('/users/:id/reset-password', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const newPassword = req.body.new_password || 'cebio2024';

    await userService.updateUser(userId, {
      hashed_password: hashPassword(newPassword),
      is_temp_password: true,
      must_change_password: true,
    });

    await auditService.log({
      action: 'RESET_PASSWORD',
      userId: req.user!.id,
      details: `Senha resetada para: ${user.email}`,
      severity: 'high',
      ipAddress: req.ip || 'unknown',
    });

    res.json({ message: 'Senha resetada com sucesso', temporary_password: newPassword });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// DELETE /api/users/:id
router.delete('/users/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await userService.deleteUser(Number(req.params.id));

    await auditService.log({
      action: 'DELETE_USER',
      userId: req.user!.id,
      details: `Usuário removido: ${user.email}`,
      severity: 'critical',
      ipAddress: req.ip || 'unknown',
    });

    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
