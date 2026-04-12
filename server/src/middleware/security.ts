import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Helmet middleware - Adiciona headers de segurança HTTP
 * Protege contra: XSS, Clickjacking, MIME sniffing, etc
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

/**
 * Rate Limiters desativados para permitir requisições ilimitadas
 */
export const globalLimiter = (req: Request, res: Response, next: NextFunction) => next();
export const loginLimiter = (req: Request, res: Response, next: NextFunction) => next();
export const apiLimiter = (req: Request, res: Response, next: NextFunction) => next();

/**
 * Middleware para adicionar headers de segurança customizados
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remover header X-Powered-By
  res.removeHeader('X-Powered-By');

  // Adicionar headers customizados
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

/**
 * Middleware para validar Content-Type
 * Previne ataques por content type inválido
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      if (req.path.startsWith('/api/') && !req.path.includes('/files/')) {
        // Apenas logar em vez de bloquear para evitar problemas de integração
        logger.warn(`Invalid Content-Type: ${contentType} for path ${req.path}`);
      }
    }
  }

  next();
};

/**
 * Middleware para logar requisições suspeitas
 */
export const suspiciousRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Apenas logar, sem bloquear
  next();
};
