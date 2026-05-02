/**
 * Account Model
 * =============
 * Represents a bank account owned by a user.
 * Types: checking, savings, credit
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  accountNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('checking', 'savings', 'credit'),
    allowNull: false,
    defaultValue: 'checking',
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: { min: 0 },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'accounts',
  hooks: {
    // Auto-generate account number before validation
    beforeValidate: (account) => {
      if (!account.accountNumber) {
        account.accountNumber = generateAccountNumber();
      }
    },
  },
});

/**
 * Generates a random 16-digit account number
 */
function generateAccountNumber() {
  const prefix = 'EB';
  const digits = Math.floor(Math.random() * 9000000000000000 + 1000000000000000).toString();
  return `${prefix}${digits}`;
}

module.exports = Account;
