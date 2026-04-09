import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
 * Rate Limiter Global - Limita requisições por IP
 * Protege contra: Brute force, DDoS, Força bruta de login
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true, // Retorna info de rate limit em `RateLimit-*` headers
  legacyHeaders: false, // Desabilita `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Não aplicar rate limit para health check
    return req.path === '/health';
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP ${req.ip}`);
    res.status(429).json({
      error: 'Muitas requisições. Tente novamente em alguns minutos.',
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

/**
 * Rate Limiter para Login - Proteção contra brute force
 * Muito mais restritivo que o global
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  handler: (req: Request, res: Response) => {
    logger.warn(`Login brute force attempt from IP ${req.ip} for email ${req.body?.email}`);
    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    });
  },
});

/**
 * Rate Limiter para API - Proteção contra abuso
 * Limita requisições por usuário autenticado
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 requisições por minuto
  keyGenerator: (req: Request) => {
    // Usar user ID se autenticado, caso contrário usar IP
    return req.user?.id ? `user-${req.user.id}` : req.ip || 'unknown';
  },
  message: 'Muitas requisições. Tente novamente mais tarde.',
  handler: (req: Request, res: Response) => {
    logger.warn(`API rate limit exceeded for ${req.user?.id || req.ip}`);
    res.status(429).json({
      error: 'Muitas requisições. Tente novamente mais tarde.',
    });
  },
});

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
        return res.status(415).json({
          error: 'Content-Type deve ser application/json',
        });
      }
    }
  }

  next();
};

/**
 * Middleware para logar requisições suspeitas
 */
export const suspiciousRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Detectar tentativas de SQL injection
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE)\b)/gi;
  const bodyStr = JSON.stringify(req.body);
  const queryStr = JSON.stringify(req.query);

  if (sqlPatterns.test(bodyStr) || sqlPatterns.test(queryStr)) {
    logger.warn(`Possible SQL injection attempt from IP ${req.ip}`, {
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
    });
  }

  // Detectar tentativas de XSS
  const xssPatterns = /(<script|javascript:|onerror|onload|onclick)/gi;
  if (xssPatterns.test(bodyStr) || xssPatterns.test(queryStr)) {
    logger.warn(`Possible XSS attempt from IP ${req.ip}`, {
      path: req.path,
      method: req.method,
    });
  }

  next();
};
