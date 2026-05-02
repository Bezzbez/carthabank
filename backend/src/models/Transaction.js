/**
 * Transaction Model
 * =================
 * Records every financial operation (transfer, deposit, withdrawal, bill payment).
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reference: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('transfer', 'deposit', 'withdrawal', 'bill_payment', 'fee'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'completed', 'failed', 'reversed', 'rejected'),
    defaultValue: 'pending',
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // Gestionnaire review fields
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  reviewNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // For transfers: source account
  fromAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'accounts', key: 'id' },
  },
  // For transfers/deposits: destination account
  toAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'accounts', key: 'id' },
  },
  // Snapshot of balance after transaction
  balanceAfter: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  // Bill payment specific fields
  billerName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  billerReference: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  // IP address for fraud detection
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
}, {
  tableName: 'transactions',
  hooks: {
    beforeValidate: async (txn) => {
      if (!txn.reference) {
        let isUnique = false;
        while (!isUnique) {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const random = Math.random().toString(36).substring(2, 12).toUpperCase();
          const reference = `TXN-${date}-${random}`;
          const existing = await sequelize.models.Transaction.findOne({ where: { reference } });
          if (!existing) {
            txn.reference = reference;
            isUnique = true;
          }
        }
      }
    },
  },
});

/**
 * Generates a unique transaction reference
 * Format: TXN-YYYYMMDD-XXXXXXXXXX
 */
function generateReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 12).toUpperCase();
  return `TXN-${date}-${random}`;
}

module.exports = Transaction;
