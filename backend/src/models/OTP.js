/**
 * OTP Model
 * =========
 * Stores one-time passwords for sensitive operations (2FA on transfers).
 * Each OTP expires after 60 seconds and can only be used once.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM('transfer', 'login', 'profile_change', 'password_reset'),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'otps',
});

module.exports = OTP;
