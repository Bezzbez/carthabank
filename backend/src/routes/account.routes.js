/**
 * Account Routes
 * ==============
 * GET  /api/accounts          - List user's accounts
 * GET  /api/accounts/:id      - Get account details
 * POST /api/accounts          - Open a new account
 */

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { Account, Transaction } = require('../models');
const { createError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

router.use(authenticate);

// GET /api/accounts — list all user accounts
router.get('/', async (req, res, next) => {
  try {
    const accounts = await Account.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'ASC']],
    });
    res.json({ accounts });
  } catch (error) {
    next(error);
  }
});

// GET /api/accounts/:id — account detail with recent transactions
router.get('/:id', async (req, res, next) => {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!account) throw createError(404, 'Account not found.');

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{ fromAccountId: account.id }, { toAccountId: account.id }],
      },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({ account, transactions });
  } catch (error) {
    next(error);
  }
});

// POST /api/accounts — open a new account
router.post('/', [
  body('type').isIn(['checking', 'savings', 'credit']).withMessage('Invalid account type'),
  body('currency').optional().isLength({ min: 3, max: 3 }),
], async (req, res, next) => {
  try {
    const { type, currency = 'USD' } = req.body;
    const account = await Account.create({ userId: req.user.id, type, currency });
    res.status(201).json({ message: 'Account opened successfully.', account });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
