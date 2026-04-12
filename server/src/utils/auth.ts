import { Request, Response, NextFunction } from 'express';
import { extractToken, verifyToken } from '../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        cpf?: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('Auth Header:', req.headers.authorization);
  const token = extractToken(req.headers.authorization);
  console.log('Extracted Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  req.user = {
    id: decoded.sub,
    role: decoded.role,
    cpf: decoded.cpf,
  };

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
};

// Re-export auth utilities for convenience
export { hashPassword, verifyPassword, generateToken } from '../middleware/auth';
