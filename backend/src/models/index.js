/**
 * Models Index
 * ============
 * Defines all Sequelize model associations (relationships).
 */

const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');
const OTP = require('./OTP');
const Loan = require('./Loan');

// ─── Associations ────────────────────────────────────────────────────────────

// User has many Accounts (1..*)
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Account has many Transactions (1..*)
Account.hasMany(Transaction, { foreignKey: 'fromAccountId', as: 'sentTransactions' });
Account.hasMany(Transaction, { foreignKey: 'toAccountId', as: 'receivedTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'fromAccountId', as: 'fromAccount' });
Transaction.belongsTo(Account, { foreignKey: 'toAccountId', as: 'toAccount' });

// Transaction reviewed by User (gestionnaire)
Transaction.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// User has many OTPs
User.hasMany(OTP, { foreignKey: 'userId', as: 'otps', onDelete: 'CASCADE' });
OTP.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User has many Loans
User.hasMany(Loan, { foreignKey: 'userId', as: 'loans', onDelete: 'CASCADE' });
Loan.belongsTo(User, { foreignKey: 'userId', as: 'borrower' });

// Loan reviewed by User (gestionnaire)
Loan.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Loan disbursed to Account
Loan.belongsTo(Account, { foreignKey: 'accountId', as: 'disbursementAccount' });
Account.hasMany(Loan, { foreignKey: 'accountId', as: 'loans' });

module.exports = { User, Account, Transaction, OTP, Loan };
