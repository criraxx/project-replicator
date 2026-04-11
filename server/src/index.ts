import 'reflect-metadata';
import express, { Express } from 'express';
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

app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:8080').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 horas
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
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', categoryRoutes);
app.use('/api', auditRoutes);
app.use('/api', notificationRoutes);
app.use('/api', adminRoutes);
app.use('/api', authorApprovalRoutes);
app.use('/api', exportRoutes);

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

app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method,
  });
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
    // Inicializar banco de dados
    await AppDataSource.initialize();
    logger.info('✅ Database connection established');

    // Iniciar servidor
    app.listen(PORT, () => {
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
