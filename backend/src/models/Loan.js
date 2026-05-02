/**
 * Loan Model
 * ==========
 * Represents a loan request made by a client.
 * Reviewed by a gestionnaire (approve/reject).
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Loan = sequelize.define('Loan', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 100 },
  },
  termMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 3, max: 360 },
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5.50,
  },
  monthlyPayment: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  purpose: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'repaying', 'completed'),
    defaultValue: 'pending',
  },
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
  // Account to disburse to
  accountId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'accounts', key: 'id' },
  },
}, {
  tableName: 'loans',
  hooks: {
    beforeValidate: async (loan) => {
      // Auto-generate reference
      if (!loan.reference) {
        let isUnique = false;
        while (!isUnique) {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const random = Math.random().toString(36).substring(2, 10).toUpperCase();
          const reference = `LOAN-${date}-${random}`;
          const existing = await sequelize.models.Loan.findOne({ where: { reference } });
          if (!existing) {
            loan.reference = reference;
            isUnique = true;
          }
        }
      }
      // Calculate monthly payment (standard amortization formula)
      if (loan.amount && loan.termMonths && loan.interestRate) {
        const principal = parseFloat(loan.amount);
        const monthlyRate = parseFloat(loan.interestRate) / 100 / 12;
        const n = parseInt(loan.termMonths);
        if (monthlyRate > 0) {
          loan.monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
            (Math.pow(1 + monthlyRate, n) - 1);
          loan.monthlyPayment = parseFloat(loan.monthlyPayment.toFixed(2));
        } else {
          loan.monthlyPayment = parseFloat((principal / n).toFixed(2));
        }
      }
    },
  },
});

module.exports = Loan;
