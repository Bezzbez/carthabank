/**
 * Environment Validation
 * ======================
 * Validates required environment variables on startup.
 * Prevents silent failures due to missing config.
 */

const logger = require('../utils/logger');

/**
 * List of required environment variables
 */
const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_VARS = {
  'JWT_EXPIRES_IN': '1h',
  'JWT_REFRESH_EXPIRES_IN': '7d',
  'OTP_EXPIRY_SECONDS': '60',
  'RATE_LIMIT_WINDOW_MS': '900000',
  'RATE_LIMIT_MAX': '100',
  'LOG_LEVEL': 'info',
  'DB_PASSWORD': '',  // XAMPP default has no password
};

/**
 * Validates environment configuration
 * @throws {Error} If required variables are missing
 */
const validateEnvironment = () => {
  const missing = [];

  // Check required variables
  REQUIRED_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missing.forEach(v => logger.error(`  - ${v}`));
    throw new Error(`Environment validation failed. Missing: ${missing.join(', ')}`);
  }

  // Check for dummy secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_in_production') {
      throw new Error('CRITICAL: JWT_SECRET must be changed in production!');
    }
  }

  // Log optional variables with defaults
  Object.entries(OPTIONAL_VARS).forEach(([varName, defaultValue]) => {
    if (!process.env[varName]) {
      logger.warn(`⚠️  ${varName} not set, using default: ${defaultValue}`);
      process.env[varName] = defaultValue;
    }
  });

  logger.info('✅ Environment validation passed');
};

module.exports = { validateEnvironment };
