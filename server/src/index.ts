import 'reflect-metadata';
import express, { Express } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import {
  securityHeaders,
  globalLimiter,
  customSecurityHeaders,
  validateContentType,
  suspiciousRequestLogger,
} from './middleware/security';
import logger from './utils/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import categoryRoutes from './routes/categories';
import auditRoutes from './routes/audit';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import authorApprovalRoutes from './routes/authorApproval';
import exportRoutes from './routes/exports';
import fullExportRoutes from './routes/fullExport';
import fileRoutes from './routes/files';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

// ============================================
// SEGURANÇA - Middleware de Segurança
// ============================================

// Helmet - Headers de segurança HTTP
app.use(securityHeaders);

// Headers customizados
app.use(customSecurityHeaders);

// Rate Limiting Global
app.use(globalLimiter);

// Validação de Content-Type
app.use(validateContentType);

// Logger de requisições suspeitas
app.use(suspiciousRequestLogger);

// ============================================
// CORS - Configuração de CORS
// ============================================

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : true; // em dev aceita tudo; em prod configure CORS_ORIGINS no .env

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// ============================================
// PARSERS - Body Parsers
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// LOGGING - Request Logging
// ============================================

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================
// ROTAS - API Routes
// ============================================

app.use('/api', authRoutes);
app.use('/api', fileRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', categoryRoutes);
app.use('/api', auditRoutes);
app.use('/api', notificationRoutes);
app.use('/api', adminRoutes);
app.use('/api', authorApprovalRoutes);
app.use('/api', exportRoutes);
app.use('/api', fullExportRoutes);

// ============================================
// FRONTEND ESTÁTICO E UPLOADS
// ============================================
const uploadsPath = path.join(__dirname, '../../uploads');
const frontendPath = path.join(__dirname, '../public');

app.use('/uploads', express.static(uploadsPath));
app.use(express.static(frontendPath));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/health')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    logger.warn(`404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
      error: 'Rota não encontrada',
      path: req.path,
      method: req.method,
    });
  }
});

// ============================================
// ERROR HANDLER - Deve ser o último middleware
// ============================================

app.use(errorHandler);

// ============================================
// DATABASE E SERVER STARTUP
// ============================================

const startServer = async () => {
  try {
    // Validar JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 32) {
      logger.error('❌ JWT_SECRET muito fraco! Use uma chave de pelo menos 32 caracteres.');
      process.exit(1);
    }

    // Inicializar banco de dados
    await AppDataSource.initialize();
    logger.info('✅ Database connection established');

    // Iniciar servidor
    app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`✅ Server running on port ${PORT}`);
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🚀 CEBIO Brasil Backend - Node.js + TypeScript     ║
║                                                            ║
║  🌐 API:        http://localhost:${PORT}                  ║
║  📊 Health:     http://localhost:${PORT}/health           ║
║  🔐 Segurança:  ✅ Helmet, Rate Limit, Validation         ║
║  🗄️  Banco:      ✅ MySQL + TypeORM                       ║
║  📝 Logs:       ./logs/                                   ║
║                                                            ║
║  Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(24)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
