import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { generateToken } from '../middleware/auth';
import { authMiddleware } from '../utils/auth';
import { AuditService } from '../services/AuditService';

const router = Router();
const userService = new UserService();
const auditService = new AuditService();

// POST /api/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await userService.validateCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    await userService.updateLastLogin(user.id);

    const token = generateToken(user.id, user.role, user.cpf);

    await auditService.logAction(
      'LOGIN',
      user.id,
      undefined,
      undefined,
      `Login realizado: ${user.email}`,
      req.ip || 'unknown',
      'low'
    );

    res.json({
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        must_change_password: user.must_change_password,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/auth/me
router.get('/auth/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      must_change_password: user.must_change_password,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// GET /api/auth/profile
router.get('/auth/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' });
    res.json({
      id: user.id, name: user.name, email: user.email, cpf: user.cpf,
      role: user.role, institution: user.institution, birth_date: user.birth_date,
      phone: user.phone, department: user.department, registration_number: user.registration_number,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/auth/profile
router.put('/auth/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    const updates: any = {};
    if (email) updates.email = email.toLowerCase().trim();
    if (phone !== undefined) updates.phone = phone;
    await userService.updateUser(req.user!.id, updates);
    await auditService.logAction('UPDATE_PROFILE', req.user!.id, undefined, undefined, 'Perfil atualizado', req.ip || 'unknown', 'low');
    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

// PUT /api/auth/change-password
router.put('/auth/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    await userService.changePassword(req.user!.id, current_password, new_password);

    await auditService.logAction(
      'CHANGE_PASSWORD',
      req.user!.id,
      undefined,
      undefined,
      'Senha alterada pelo próprio usuário',
      req.ip || 'unknown',
      'medium'
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
