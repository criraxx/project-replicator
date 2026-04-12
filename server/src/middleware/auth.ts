import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '4h';
const BCRYPT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 */
export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
};

/**
 * Legacy SHA256 hash (for migration only)
 */
const hashPasswordSha256 = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Verify password against hash (supports bcrypt + SHA256 fallback for migration)
 * Returns { valid: boolean, needsRehash: boolean }
 */
export const verifyPassword = (password: string, hash: string): { valid: boolean; needsRehash: boolean } => {
  // Try bcrypt first (hashes start with $2a$ or $2b$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return { valid: bcrypt.compareSync(password, hash), needsRehash: false };
  }

  // Fallback: SHA256 (64-char hex string) — legacy migration
  if (hash.length === 64) {
    const valid = hashPasswordSha256(password) === hash;
    return { valid, needsRehash: valid }; // if valid, flag for re-hash to bcrypt
  }

  return { valid: false, needsRehash: false };
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
