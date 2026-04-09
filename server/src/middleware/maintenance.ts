import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Estado global de manutenção
 */
let maintenanceMode = {
  enabled: false,
  message: 'Sistema em manutenção. Tente novamente em alguns minutos.',
  startedAt: null as Date | null,
};

/**
 * Middleware de manutenção
 * Bloqueia requisições de usuários normais
 * Admins podem acessar normalmente
 */
export const maintenanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Se modo manutenção desabilitado, continuar
  if (!maintenanceMode.enabled) {
    return next();
  }

  // Admins podem acessar
  if (req.user?.role === 'admin') {
    logger.info(`Admin ${req.user.id} accessed during maintenance`);
    return next();
  }

  // Login é permitido mesmo em manutenção
  if (req.path === '/api/login') {
    return next();
  }

  // Bloquear outros usuários
  logger.warn(`Access blocked during maintenance for user ${req.user?.id || 'anonymous'}`);
  
  res.status(503).json({
    error: 'Sistema em manutenção',
    message: maintenanceMode.message,
    startedAt: maintenanceMode.startedAt,
  });
};

/**
 * Obter status de manutenção
 */
export const getMaintenanceStatus = () => {
  return {
    enabled: maintenanceMode.enabled,
    message: maintenanceMode.message,
    startedAt: maintenanceMode.startedAt,
  };
};

/**
 * Ativar modo manutenção
 */
export const enableMaintenance = (message?: string) => {
  maintenanceMode.enabled = true;
  maintenanceMode.message = message || 'Sistema em manutenção. Tente novamente em alguns minutos.';
  maintenanceMode.startedAt = new Date();
  
  logger.warn('🔧 Maintenance mode ENABLED', {
    message: maintenanceMode.message,
    startedAt: maintenanceMode.startedAt,
  });
};

/**
 * Desativar modo manutenção
 */
export const disableMaintenance = () => {
  const duration = maintenanceMode.startedAt 
    ? new Date().getTime() - maintenanceMode.startedAt.getTime()
    : 0;
  
  maintenanceMode.enabled = false;
  maintenanceMode.startedAt = null;
  
  logger.info('✅ Maintenance mode DISABLED', {
    duration: `${Math.round(duration / 1000)}s`,
  });
};

/**
 * Middleware para verificar se está em manutenção (retorna JSON)
 * Usado para endpoints que precisam saber o status
 */
export const getMaintenanceInfo = (req: Request, res: Response) => {
  res.json(getMaintenanceStatus());
};
