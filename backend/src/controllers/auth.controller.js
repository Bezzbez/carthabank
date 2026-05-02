/**
 * Auth Controller
 * ===============
 * Handles user registration, login, token refresh, and logout.
 */
 
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Account } = require('../models');
const logger = require('../utils/logger');
const { createError } = require('../middleware/errorHandler');
 
/**
 * Generates a signed JWT access token
 */
function signAccessToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}
 
/**
 * Generates a refresh token (longer-lived)
 */
function signRefreshToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}
 
/**
 * POST /api/auth/register
 * Register a new client account + default checking account
 *
 * ⚠️  FIX: Removed manual accountNumber = 'ACC' + Date.now() from here.
 * The Account model's beforeCreate hook already generates a proper EB-prefixed
 * account number. Setting it manually here was overriding the hook inconsistently.
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 
    const { firstName, lastName, email, password, phone } = req.body;
 
    // Check for existing email
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw createError(409, 'An account with this email already exists.');
    }
 
    // Create user — password is hashed by the beforeCreate hook in User model
    const user = await User.create({ firstName, lastName, email, password, phone });
 
    // ⚠️  FIX: Do NOT manually set accountNumber here.
    // The Account beforeCreate hook in Account.js generates it automatically.
    const account = await Account.create({
      userId: user.id,
      type: 'checking',
      balance: 0.00,
      currency: 'USD',
    });
 
    logger.info(`✅ New user registered: ${email} (ID: ${user.id})`);
 
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
 
    res.status(201).json({
      message: 'Account created successfully.',
      user: user.toSafeObject(),
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
 
/**
 * POST /api/auth/login
 * Authenticate user and return JWT tokens
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 
    const { email, password } = req.body;
 
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw createError(401, 'Invalid email or password.');
    }
 
    if (!user.isActive) {
      throw createError(403, 'Your account has been deactivated. Contact support.');
    }
 
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError(401, 'Invalid email or password.');
    }
 
    // Update last login timestamp
    await user.update({ lastLoginAt: new Date() });
 
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
 
    logger.info(`🔐 User logged in: ${email}`);
 
    res.json({
      message: 'Login successful.',
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
 
/**
 * POST /api/auth/refresh
 * Exchange a refresh token for a new access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw createError(401, 'Refresh token required.');
 
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
 
    if (!user || !user.isActive) {
      throw createError(401, 'Invalid refresh token.');
    }
 
    const accessToken = signAccessToken(user.id, user.role);
    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createError(401, 'Invalid or expired refresh token.'));
    }
    next(error);
  }
};
 
/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile
 */
const getMe = async (req, res) => {
  res.json({ user: req.user });
};
 
module.exports = { register, login, refreshToken, getMe };