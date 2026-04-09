import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import xss from 'xss';
import logger from '../utils/logger';

/**
 * Middleware para tratar erros de validação
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error from IP ${req.ip}`, { errors: errors.array() });
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array().map((e: any) => ({
        field: e.param || e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * Sanitização de strings - Remove XSS
 */
export const sanitizeString = (value: string): string => {
  if (typeof value !== 'string') return value;
  return xss(value, {
    whiteList: {},
    stripIgnoreTag: true,
  });
};

/**
 * Validadores para Autenticação
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
];

export const validateChangePassword = [
  body('current_password')
    .isLength({ min: 6 })
    .withMessage('Senha atual inválida'),
  body('new_password')
    .isLength({ min: 8 })
    .withMessage('Nova senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter maiúscula, minúscula, número e caractere especial'),
];

/**
 * Validadores para Usuários
 */
export const validateCreateUser = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres')
    .customSanitizer(value => sanitizeString(value)),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter maiúscula, minúscula, número e caractere especial'),
  body('role')
    .isIn(['admin', 'pesquisador', 'bolsista'])
    .withMessage('Role inválido'),
  body('institution')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .customSanitizer(value => sanitizeString(value)),
];

export const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .customSanitizer(value => sanitizeString(value)),
  body('institution')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .customSanitizer(value => sanitizeString(value)),
  body('role')
    .optional()
    .isIn(['admin', 'pesquisador', 'bolsista']),
  body('is_active')
    .optional()
    .isBoolean(),
];

/**
 * Validadores para Projetos
 */
export const validateCreateProject = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Título deve ter entre 5 e 255 caracteres')
    .customSanitizer(value => sanitizeString(value)),
  body('summary')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Resumo deve ter entre 10 e 500 caracteres')
    .customSanitizer(value => sanitizeString(value)),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .customSanitizer(value => sanitizeString(value)),
  body('category')
    .trim()
    .isLength({ min: 3, max: 100 })
    .customSanitizer(value => sanitizeString(value)),
  body('academic_level')
    .trim()
    .isLength({ min: 3, max: 100 })
    .customSanitizer(value => sanitizeString(value)),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Data de início inválida'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Data de término inválida'),
];

export const validateUpdateProject = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .customSanitizer(value => sanitizeString(value)),
  body('summary')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .customSanitizer(value => sanitizeString(value)),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .customSanitizer(value => sanitizeString(value)),
  body('status')
    .optional()
    .isIn(['pendente', 'em_revisao', 'aprovado', 'rejeitado']),
];

/**
 * Validadores para Categorias
 */
export const validateCreateCategory = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .customSanitizer(value => sanitizeString(value)),
  body('slug')
    .trim()
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .customSanitizer(value => sanitizeString(value)),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Cor deve ser um código hexadecimal válido'),
];

/**
 * Validadores para Notificações
 */
export const validateBroadcastNotification = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .customSanitizer(value => sanitizeString(value)),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .customSanitizer(value => sanitizeString(value)),
  body('type')
    .optional()
    .isIn(['info', 'success', 'warning', 'error']),
];

/**
 * Validadores para Query Parameters
 */
export const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve estar entre 1 e 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser maior ou igual a 0'),
];

export const validateUserFilter = [
  query('role')
    .optional()
    .isIn(['admin', 'pesquisador', 'bolsista']),
  query('active')
    .optional()
    .isBoolean(),
];

export const validateProjectFilter = [
  query('status')
    .optional()
    .isIn(['pendente', 'em_revisao', 'aprovado', 'rejeitado']),
  query('owner_id')
    .optional()
    .isInt({ min: 1 }),
];

/**
 * Validador de ID
 */
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
];
