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
      cpf: u.cpf,
      role: u.role,
      institution: u.institution,
      birth_date: u.birth_date,
      phone: u.phone,
      department: u.department,
      registration_number: u.registration_number,
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
      cpf: user.cpf,
      role: user.role,
      institution: user.institution,
      birth_date: user.birth_date,
      phone: user.phone,
      department: user.department,
      registration_number: user.registration_number,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/users/by-cpf/:cpf
router.get('/users/by-cpf/:cpf', authMiddleware, async (req: Request, res: Response) => {
  try {
    const cpf = req.params.cpf.replace(/\D/g, '');
    const user = await userService.getUserByCpf(cpf);
    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }
    res.json({ id: user.id, name: user.name, institution: user.institution, cpf: user.cpf });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

router.post('/users', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, institution, cpf, birth_date, phone, department, registration_number } = req.body;

    if (!email || !name || !password || !cpf || !birth_date) {
      return res.status(400).json({ error: 'Email, nome, senha, CPF e data de nascimento sao obrigatorios' });
    }

    const user = await userService.createUser(email, name, password, role, institution, req.user!.id, cpf, birth_date, phone, department, registration_number);

    await auditService.logAction(
      'CREATE_USER',
      req.user!.id,
      user.id,
      undefined,
      `Usuário criado: ${email} (${role})`,
      req.ip || 'unknown',
      'medium'
    );

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
        if (!userData.email || !userData.name || !userData.cpf || !userData.birth_date) {
          results.errors.push({ email: userData.email, error: 'Nome, email, CPF e data de nascimento sao obrigatorios' });
          continue;
        }

        const user = await userService.createUser(
          userData.email,
          userData.name,
          defaultPassword,
          userData.role || 'bolsista',
          userData.institution,
          req.user!.id,
          userData.cpf?.replace(/\D/g, ''),
          userData.birth_date,
          userData.phone,
          userData.department,
          userData.registration_number,
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

    await auditService.logAction(
      'BATCH_CREATE_USERS',
      req.user!.id,
      undefined,
      undefined,
      `Criação em lote: ${results.success.length} criados, ${results.errors.length} erros`,
      req.ip || 'unknown',
      'high'
    );

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

    await auditService.logAction(
      'UPDATE_USER',
      req.user!.id,
      user.id,
      undefined,
      `Usuário atualizado: ${user.email}`,
      req.ip || 'unknown',
      'medium'
    );

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

    await auditService.logAction(
      'RESET_PASSWORD',
      req.user!.id,
      userId,
      undefined,
      `Senha resetada para: ${user.email}`,
      req.ip || 'unknown',
      'high'
    );

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

    await auditService.logAction(
      'DELETE_USER',
      req.user!.id,
      Number(req.params.id),
      undefined,
      `Usuário removido: ${user.email}`,
      req.ip || 'unknown',
      'high'
    );

    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
