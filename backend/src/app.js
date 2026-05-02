/**
 * E-Banking Application - Main Entry Point
 * ==========================================
 * Configures Express server with security, logging, and routing.
 */
 
require('dotenv').config();
const { validateEnvironment } = require('./utils/validateEnv');
 
validateEnvironment();
 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
 
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
 
// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const adminRoutes = require('./routes/admin.routes');
const gestionnaireRoutes = require('./routes/gestionnaire.routes');
const loanRoutes = require('./routes/loan.routes');
 
const app = express();
 
// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
 
// ─── Rate Limiting ──────────────────────────────────────────────────────────
// General API limiter — applied to all /api/ routes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200, // Raised from 100 to 200
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);
 
// ⚠️  FIX: Auth limiter is ONLY applied to sensitive mutation endpoints.
// It must NOT cover GET /api/auth/me — that's called on every page load.
// 10 requests per 15 min was burning the limit instantly during normal use.
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 30, // Raised to 30, configurable
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
 
// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
 
// ─── Logging ────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));
 
// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
 
// ─── Routes ─────────────────────────────────────────────────────────────────
// ⚠️  FIX: authLimiter is now scoped ONLY to login and register,
// not to /api/auth/me or /api/auth/refresh (those are fine to call freely).
app.use('/api/auth', authRoutes);           // Auth router handles limiter internally now
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gestionnaire', gestionnaireRoutes);
app.use('/api/loans', loanRoutes);
 
// ─── Dev-only: Admin Seeder Route ───────────────────────────────────────────
// Accessible at POST /api/dev/seed-admin in development mode only
// Remove or comment out before deploying to production
if (process.env.NODE_ENV === 'development') {
  app.post('/api/dev/seed-admin', async (req, res) => {
    try {
      const { User, Account } = require('./models');
      const bcrypt = require('bcryptjs');
 
      const email = req.body.email || 'admin@ebanking.com';
      const password = req.body.password || 'Admin@1234';
      const firstName = req.body.firstName || 'Super';
      const lastName = req.body.lastName || 'Admin';
 
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        // If already exists, force role to admin and activate
        await existing.update({ role: 'admin', isActive: true });
        return res.json({
          message: `Existing user updated to admin role.`,
          email,
          password: '(unchanged — use your existing password)',
        });
      }
 
      const admin = await User.create({
        firstName,
        lastName,
        email,
        password, // hashed by model hook
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      });
 
      // Give admin a checking account too
      await Account.create({
        userId: admin.id,
        type: 'checking',
        balance: 0.00,
        currency: 'USD',
      });
 
      res.status(201).json({
        message: '✅ Admin account created successfully.',
        email,
        password, // shown once for dev convenience
        note: 'Change this password after first login!',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
 
  logger.info('🛠️  Dev seeder available: POST /api/dev/seed-admin');
}
 
// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});
 
// ─── Global Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);
 
// ─── Database Connection & Server Start ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
 
(async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
 
    await sequelize.sync(); // Removed { alter: true } to prevent MariaDB crash
    logger.info('✅ Database models synchronized');

    // ─── Auto-seed demo accounts in development ─────────────────────────
    if (process.env.NODE_ENV === 'development') {
      const { User, Account } = require('./models');

      // Seed admin account
      const adminEmail = 'admin@ebanking.com';
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });
      if (!existingAdmin) {
        const admin = await User.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: adminEmail,
          password: 'Admin@1234', // hashed by model hook
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
        });
        await Account.create({
          userId: admin.id,
          type: 'checking',
          balance: 10000.00,
          currency: 'USD',
        });
        logger.info('🌱 Demo admin account seeded: admin@ebanking.com / Admin@1234');
      } else if (existingAdmin.role !== 'admin') {
        await existingAdmin.update({ role: 'admin', isActive: true });
        logger.info('🌱 Existing user promoted to admin: admin@ebanking.com');
      }

      // Seed demo client account
      const clientEmail = 'john.doe@example.com';
      const existingClient = await User.findOne({ where: { email: clientEmail } });
      if (!existingClient) {
        const client = await User.create({
          firstName: 'John',
          lastName: 'Doe',
          email: clientEmail,
          password: 'Client@1234', // hashed by model hook
          role: 'client',
          isActive: true,
          isEmailVerified: true,
        });
        await Account.create({
          userId: client.id,
          type: 'checking',
          balance: 5000.00,
          currency: 'USD',
        });
        logger.info('🌱 Demo client account seeded: john.doe@example.com / Client@1234');
      }

      // Seed demo gestionnaire account
      const gestEmail = 'manager@ebanking.com';
      const existingGest = await User.findOne({ where: { email: gestEmail } });
      if (!existingGest) {
        const gest = await User.create({
          firstName: 'Sarah',
          lastName: 'Manager',
          email: gestEmail,
          password: 'Manager@1234',
          role: 'gestionnaire',
          isActive: true,
          isEmailVerified: true,
        });
        await Account.create({
          userId: gest.id,
          type: 'checking',
          balance: 0.00,
          currency: 'USD',
        });
        logger.info('🌱 Demo gestionnaire account seeded: manager@ebanking.com / Manager@1234');
      } else if (existingGest.role !== 'gestionnaire') {
        await existingGest.update({ role: 'gestionnaire', isActive: true });
        logger.info('🌱 Existing user updated to gestionnaire: manager@ebanking.com');
      }
    }
 
    app.listen(PORT, () => {
      logger.info(`🚀 E-Banking API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error(`\n❌ FATAL STARTUP ERROR:`, error);
    logger.error(`❌ Failed to start server: ${error.message || 'Unknown error'}`, { error });
    
    // Give logger a moment to flush before exiting
    setTimeout(() => process.exit(1), 500);
  }
})();
 
module.exports = app;
 