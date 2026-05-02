/**
 * JWT Authentication Middleware
 * ==============================
 * Protects routes by verifying Bearer tokens.
 * Also provides role-based access control (RBAC).
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Verifies JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (checks if still active/exists)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({ error: 'Token invalid. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    logger.error('Auth middleware error:', error);
    next(error);
  }
};

/**
 * Role-based access control middleware factory.
 * Usage: authorize('admin') or authorize('admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
