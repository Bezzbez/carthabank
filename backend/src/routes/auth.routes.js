/**
 * Auth Routes
 * ===========
 * POST /api/auth/register   ← rate limited (mutation)
 * POST /api/auth/login      ← rate limited (mutation)
 * POST /api/auth/refresh    ← NOT rate limited (called silently by frontend)
 * GET  /api/auth/me         ← NOT rate limited (called on every page load)
 *
 * ⚠️  FIX: Previously authLimiter was applied in app.js to ALL /api/auth/*
 * routes including /me and /refresh. Every page load burned the 10-req limit,
 * causing a 429 loop that triggered logout → re-login → 429 → infinite refresh.
 * Now the limiter is scoped only to register and login.
 */
 
const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, refreshToken, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
 
// Scoped auth limiter: only for login + register
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // Rate limit per IP
});
 
// Validation rules
const registerValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters'),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must include uppercase, lowercase, and a number'),
  body('phone').optional({ checkFalsy: true }).isLength({ min: 5 }).withMessage('Invalid phone number'),
];
 
const loginValidation = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
 
// ⚠️  authLimiter applied ONLY here — not on /me or /refresh
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
 
// These are called silently/frequently by the frontend — no strict rate limit
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
 
module.exports = router;
