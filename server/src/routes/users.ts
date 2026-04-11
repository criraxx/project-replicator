import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { authMiddleware, requireRole } from '../utils/auth';
import { AuditService } from '../services/AuditService';
import { hashPassword } from '../middleware/auth';
import { UserRole } from '../entities/User';
import {
  validateCreateUser,
  validateUpdateUser,
  validateId,
  validateUserFilter,
  handleValidationErrors,
} from '../middleware/validation';

const router = Router();
const userService = new UserService();
const auditService = new AuditService();

const digitsOnly = (value?: string) => value?.replace(/\D/g, '') || undefined;

const normalizeBirthDate = (value?: string) => {
  if (!value) return undefined;

  if (value.includes('/')) {
    const [day, month, year] = value.split('/');
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  return value;
};

const normalizeRole = (value?: string): UserRole => {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'admin' || normalized === 'administrador') return 'admin';
  if (normalized === 'pesquisador') return 'pesquisador';
  return 'bolsista';
};

const serializeUser = (user: any) => ({
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
  is_temp_password: user.is_temp_password,
  must_change_password: user.must_change_password,
  created_at: user.created_at,
  last_login: user.last_login,
});

// GET /api/users
router.get('/users', authMiddleware, requireRole('admin'), validateUserFilter, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { role, active } = req.query;
    const users = await userService.listUsers(
      role as UserRole | undefined,
      active !== undefined ? active === 'true' : undefined
    );

    res.json(users.map(serializeUser));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/users/by-cpf/:cpf
router.get('/users/by-cpf/:cpf', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserByCpf(req.params.cpf);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      institution: user.institution,
      role: user.role,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/users/:id
router.get('/users/:id', authMiddleware, requireRole('admin'), ...validateId, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(serializeUser(user));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/users
router.post('/users', authMiddleware, requireRole('admin'), ...validateCreateUser, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const {
      email,
      name,
      password,
      role,
      institution,
      cpf,
      birth_date,
      phone,
      department,
      registration_number,
    } = req.body;

    if (!email || !name || !password || !cpf || !birth_date || !role) {
      return res.status(400).json({ error: 'Nome, email, CPF, data de nascimento, função/perfil e senha são obrigatórios' });
    }

    const cleanCpf = digitsOnly(cpf);
    const normalizedBirthDate = normalizeBirthDate(birth_date);

    if (!cleanCpf || cleanCpf.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    if (!normalizedBirthDate) {
      return res.status(400).json({ error: 'Data de nascimento inválida' });
    }

    const user = await userService.createUser(
      email,
      name,
      password,
      normalizeRole(role),
      institution,
      req.user!.id,
      cleanCpf,
      normalizedBirthDate,
      digitsOnly(phone),
      department,
      registration_number,
    );

    await auditService.logAction(
      'CREATE_USER',
      req.user!.id,
      user.id,
      undefined,
      `Usuário criado: ${email} (${user.role})`,
      req.ip || 'unknown',
      'medium'
    );

    res.status(201).json(serializeUser(user));
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
        const cleanCpf = digitsOnly(userData.cpf);
        const normalizedBirthDate = normalizeBirthDate(userData.birth_date);

        if (!userData.name || !userData.email || !userData.role || !cleanCpf || !normalizedBirthDate) {
          results.errors.push({
            email: userData.email,
            error: 'Nome, email, CPF, data de nascimento e função/perfil são obrigatórios',
          });
          continue;
        }

        if (cleanCpf.length !== 11) {
          results.errors.push({ email: userData.email, error: 'CPF inválido' });
          continue;
        }

        const user = await userService.createUser(
          userData.email,
          userData.name,
          defaultPassword,
          normalizeRole(userData.role),
          userData.institution,
          req.user!.id,
          cleanCpf,
          normalizedBirthDate,
          digitsOnly(userData.phone),
          userData.department,
          userData.registration_number,
        );

        results.success.push(serializeUser(user));
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
router.put('/users/:id', authMiddleware, requireRole('admin'), ...validateUpdateUser, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };

    if (updates.email) updates.email = String(updates.email).toLowerCase().trim();
    if (updates.cpf !== undefined) updates.cpf = digitsOnly(updates.cpf);
    if (updates.phone !== undefined) updates.phone = digitsOnly(updates.phone);
    if (updates.birth_date !== undefined) updates.birth_date = normalizeBirthDate(updates.birth_date);
    if (updates.role !== undefined) updates.role = normalizeRole(updates.role);

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

    res.json(serializeUser(user));
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

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

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

// POST /api/users/batch-reset-password
router.post('/users/batch-reset-password', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { user_ids, new_password } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'Lista de usuários é obrigatória' });
    }

    const password = new_password || 'cebio2024';

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    let success = 0;
    let errors = 0;

    for (const id of user_ids) {
      try {
        const user = await userService.getUserById(Number(id));

        if (!user) {
          errors++;
          continue;
        }

        await userService.updateUser(Number(id), {
          hashed_password: hashPassword(password),
          is_temp_password: true,
          must_change_password: true,
        });

        await auditService.logAction(
          'RESET_PASSWORD',
          req.user!.id,
          Number(id),
          undefined,
          `Senha resetada em lote para: ${user.email}`,
          req.ip || 'unknown',
          'high'
        );

        success++;
      } catch {
        errors++;
      }
    }

    res.json({ success, errors, temporary_password: password });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
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
