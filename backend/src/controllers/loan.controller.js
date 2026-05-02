/**
 * Loan Controller (Client-facing)
 * ================================
 * Handles loan request creation and status checking for clients.
 */

const { validationResult } = require('express-validator');
const { Loan, Account, User } = require('../models');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * POST /api/loans/request
 * Submit a new loan request
 * Body: { amount, termMonths, purpose, accountId }
 */
const requestLoan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, termMonths, purpose, accountId, interestRate } = req.body;

    // Verify the account belongs to the user
    if (accountId) {
      const account = await Account.findOne({
        where: { id: accountId, userId: req.user.id, isActive: true },
      });
      if (!account) throw createError(404, 'Account not found or inactive.');
    }

    const loan = await Loan.create({
      userId: req.user.id,
      amount: parseFloat(amount),
      termMonths: parseInt(termMonths),
      interestRate: parseFloat(interestRate || 5.50),
      purpose,
      accountId: accountId || null,
    });

    logger.info(`📝 Loan request: ${loan.reference} by user ${req.user.id} for ${amount}`);

    res.status(201).json({
      message: 'Loan request submitted successfully. A manager will review it shortly.',
      loan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/loans
 * Get all loan requests for the current user
 */
const getMyLoans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: loans } = await Loan.findAndCountAll({
      where,
      include: [
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
 * GET /api/loans/:id
 * Get details of a specific loan
 */
const getLoanDetails = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: User, as: 'reviewer', attributes: ['firstName', 'lastName'] },
        { model: Account, as: 'disbursementAccount', attributes: ['accountNumber', 'type', 'balance'] },
      ],
    });

    if (!loan) throw createError(404, 'Loan not found.');

    res.json({ loan });
  } catch (error) {
    next(error);
  }
};

module.exports = { requestLoan, getMyLoans, getLoanDetails };
