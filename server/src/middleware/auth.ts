import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '4h';

/**
 * Hash password using SHA256
 */
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Verify password against hash
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

/**
 * Generate JWT token
 */
export const generateToken = (userId: number, role: string, cpf?: string): string => {
  return jwt.sign(
    { sub: userId, role, cpf },
    JWT_SECRET as any,
    { expiresIn: JWT_EXPIRE as any }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};
