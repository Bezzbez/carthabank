/**
 * Gestionnaire Controller
 * =======================
 * Manager-only operations: review/approve transfers, manage loan requests,
 * view customer accounts, dashboard stats.
 * All routes protected by authenticate + authorize('gestionnaire', 'admin').
 */

const { User, Account, Transaction, Loan } = require('../models');
const { createError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/gestionnaire/dashboard
 * Stats: pending operations, approved today, rejected today
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      pendingTransfers,
      pendingLoans,
      approvedTransactions,
      approvedLoans,
      rejectedTransactions,
      rejectedLoans,
      totalClients,
      totalAccounts,
    ] = await Promise.all([
      Transaction.count({ where: { status: 'pending' } }),
      Loan.count({ where: { status: 'pending' } }),
      Transaction.count({
        where: {
          status: { [Op.in]: ['approved', 'completed'] },
          reviewedAt: { [Op.gte]: todayStart },
        },
      }),
      Loan.count({
        where: {
          status: 'approved',
          reviewedAt: { [Op.gte]: todayStart },
        },
      }),
      Transaction.count({
        where: {
          status: 'rejected',
          reviewedAt: { [Op.gte]: todayStart },
        },
      }),
      Loan.count({
        where: {
          status: 'rejected',
          reviewedAt: { [Op.gte]: todayStart },
        },
      }),
      User.count({ where: { role: 'client' } }),
      Account.count({ where: { isActive: true } }),
    ]);

    res.json({
      pendingTransfers,
      pendingLoans,
      pendingTotal: pendingTransfers + pendingLoans,
      approvedToday: approvedTransactions + approvedLoans,
      rejectedToday: rejectedTransactions + rejectedLoans,
      totalClients,
      totalAccounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/gestionnaire/pending-transfers
 * List all pending transfers awaiting review
 */
const getPendingTransfers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: transfers } = await Transaction.findAndCountAll({
      where: { status: 'pending' },
      include: [
        {
          model: Account, as: 'fromAccount',
          attributes: ['accountNumber', 'type', 'balance'],
          include: [{ model: User, as: 'owner', attributes: ['firstName', 'lastName', 'email'] }],
        },
        {
          model: Account, as: 'toAccount',
          attributes: ['accountNumber', 'type'],
          include: [{ model: User, as: 'owner', attributes: ['firstName', 'lastName', 'email'] }],
        },
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      transfers,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/gestionnaire/transfers/:id/review
 * Approve or reject a pending transfer
 * Body: { action: 'approve' | 'reject', note: 'optional comment' }
 */
const reviewTransfer = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { action, note } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      throw createError(400, 'Action must be "approve" or "reject".');
    }

    const transfer = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Account, as: 'fromAccount', attributes: ['id', 'accountNumber', 'balance'] },
        { model: Account, as: 'toAccount', attributes: ['id', 'accountNumber', 'balance'] },
      ],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!transfer) throw createError(404, 'Transfer not found.');
    if (transfer.status !== 'pending') throw createError(400, `Transfer already ${transfer.status}.`);

    if (action === 'approve') {
      // Re-validate balance for transfers
      if (transfer.type === 'transfer' && transfer.fromAccount) {
        const fromAccount = await Account.findByPk(transfer.fromAccountId, {
          lock: t.LOCK.UPDATE,
          transaction: t,
        });
        const amount = parseFloat(transfer.amount);
        if (parseFloat(fromAccount.balance) < amount) {
          throw createError(400, 'Insufficient balance in source account.');
        }
        // Execute the actual transfer
        await fromAccount.decrement('balance', { by: amount, transaction: t });
        if (transfer.toAccountId) {
          const toAccount = await Account.findByPk(transfer.toAccountId, { transaction: t });
          await toAccount.increment('balance', { by: amount, transaction: t });
        }
        await fromAccount.reload({ transaction: t });
        transfer.balanceAfter = fromAccount.balance;
      }

      await transfer.update({
        status: 'completed',
        reviewedBy: req.user.id,
        reviewNote: note || null,
        reviewedAt: new Date(),
      }, { transaction: t });
    } else {
      await transfer.update({
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewNote: note || null,
        reviewedAt: new Date(),
      }, { transaction: t });
    }

    await t.commit();

    logger.info(`📋 Transfer ${transfer.reference} ${action}ed by ${req.user.email}`);

    res.json({
      message: `Transfer ${action}ed successfully.`,
      transfer,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * GET /api/gestionnaire/loans
 * List all loan requests with optional status filter
 */
const getLoanRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const { count, rows: loans } = await Loan.findAndCountAll({
      where,
      include: [
        { model: User, as: 'borrower', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'reviewer', attributes: ['firstName', 'lastName'] },
        { model: Account, as: 'disbursementAccount', attributes: ['accountNumber', 'type'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      loans,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/gestionnaire/loans/:id/review
 * Approve or reject a loan request
 * Body: { action: 'approve' | 'reject', note: 'reason' }
 */
const reviewLoan = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { action, note } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      throw createError(400, 'Action must be "approve" or "reject".');
    }

    const loan = await Loan.findByPk(req.params.id, {
      include: [{ model: User, as: 'borrower' }],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!loan) throw createError(404, 'Loan request not found.');
    if (loan.status !== 'pending') throw createError(400, `Loan already ${loan.status}.`);

    if (action === 'approve') {
      await loan.update({
        status: 'approved',
        reviewedBy: req.user.id,
        reviewNote: note || null,
        reviewedAt: new Date(),
      }, { transaction: t });

      // Disburse funds to the client's account if accountId is set
      if (loan.accountId) {
        const account = await Account.findByPk(loan.accountId, {
          lock: t.LOCK.UPDATE,
          transaction: t,
        });
        if (account) {
          await account.increment('balance', { by: parseFloat(loan.amount), transaction: t });

          // Create a deposit transaction for the disbursement
          await Transaction.create({
            type: 'deposit',
            amount: parseFloat(loan.amount),
            currency: account.currency,
            status: 'completed',
            description: `Loan disbursement: ${loan.reference}`,
            toAccountId: account.id,
            balanceAfter: parseFloat(account.balance) + parseFloat(loan.amount),
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
          }, { transaction: t });

          await loan.update({ status: 'disbursed' }, { transaction: t });
        }
      }
    } else {
      await loan.update({
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewNote: note || 'Loan request rejected.',
        reviewedAt: new Date(),
      }, { transaction: t });
    }

    await t.commit();

    logger.info(`🏦 Loan ${loan.reference} ${action}ed by ${req.user.email}`);

    res.json({
      message: `Loan ${action}ed successfully.`,
      loan,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * GET /api/gestionnaire/customers
 * List all client accounts with balance info
 */
const getCustomerAccounts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { role: 'client' };
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: customers } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{
        model: Account,
        as: 'accounts',
        attributes: ['id', 'accountNumber', 'type', 'balance', 'currency', 'isActive'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      customers,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/gestionnaire/accounts/:id/toggle-freeze
 * Freeze or unfreeze a customer account
 */
const toggleAccountFreeze = async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner', attributes: ['firstName', 'lastName', 'email'] }],
    });

    if (!account) throw createError(404, 'Account not found.');

    await account.update({ isActive: !account.isActive });

    logger.info(`🔒 Account ${account.accountNumber} ${account.isActive ? 'unfrozen' : 'frozen'} by ${req.user.email}`);

    res.json({
      message: `Account ${account.isActive ? 'unfrozen' : 'frozen'} successfully.`,
      account,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/gestionnaire/review-history
 * Get history of reviews done by this gestionnaire
 */
const getReviewHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, loans] = await Promise.all([
      Transaction.findAll({
        where: { reviewedBy: req.user.id },
        include: [
          { model: Account, as: 'fromAccount', attributes: ['accountNumber'] },
          { model: Account, as: 'toAccount', attributes: ['accountNumber'] },
        ],
        order: [['reviewedAt', 'DESC']],
        limit: parseInt(limit),
        offset,
      }),
      Loan.findAll({
        where: { reviewedBy: req.user.id },
        include: [
          { model: User, as: 'borrower', attributes: ['firstName', 'lastName', 'email'] },
        ],
        order: [['reviewedAt', 'DESC']],
        limit: parseInt(limit),
        offset,
      }),
    ]);

    res.json({ transactions, loans });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPendingTransfers,
  reviewTransfer,
  getLoanRequests,
  reviewLoan,
  getCustomerAccounts,
  toggleAccountFreeze,
  getReviewHistory,
};
