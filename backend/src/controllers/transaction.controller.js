/**
 * Transaction Controller
 * ======================
 * Handles money transfers, bill payments, and transaction history.
 * All transfers require OTP verification (2FA).
 */

const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const { Account, Transaction, User } = require('../models');
const { generateOTP, verifyOTP } = require('../services/otp.service');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * POST /api/transactions/otp/request
 * Request an OTP for a transfer (Step 1 of 2FA transfer flow)
 */
const requestTransferOTP = async (req, res, next) => {
  try {
    await generateOTP(req.user.id, 'transfer');
    res.json({ message: 'OTP sent to your registered email/phone. Valid for 60 seconds.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/transactions/deposit
 * Simulate adding money to an account (no OTP required for demo purposes)
 * Body: { accountId, amount, description }
 */
const deposit = async (req, res, next) => {
  // ── Production Safety Check ──────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Direct deposits are disabled in production for security. Real payment gateway required.' 
    });
  }

  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await t.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountId, amount, description } = req.body;
    const depositAmount = parseFloat(amount);

    const account = await Account.findOne({
      where: { id: accountId, userId: req.user.id, isActive: true },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!account) throw createError(404, 'Account not found or inactive.');

    await account.increment('balance', { by: depositAmount, transaction: t });
    await account.reload({ transaction: t });

    const txn = await Transaction.create({
      type: 'deposit',
      amount: depositAmount,
      currency: account.currency,
      status: 'completed',
      description: description || 'External Deposit',
      toAccountId: account.id,
      balanceAfter: account.balance,
      ipAddress: req.ip,
      reference: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    }, { transaction: t });

    await t.commit();

    logger.info(`💵 Deposit: ${depositAmount} into ${account.accountNumber} [${txn.reference}]`);

    res.status(201).json({
      message: 'Deposit successful.',
      transaction: txn,
      newBalance: account.balance,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * POST /api/transactions/transfer
 * Execute a money transfer with OTP verification (Step 2)
 *
 * Body: { fromAccountId, toAccountNumber, amount, description, otpCode }
 */
const transfer = async (req, res, next) => {
  const t = await sequelize.transaction();  // DB transaction for atomicity
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await t.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromAccountId, toAccountNumber, amount, description, otpCode } = req.body;

    // ── Step 1: Verify OTP ─────────────────────────────────────────────────
    const otpResult = await verifyOTP(req.user.id, 'transfer', otpCode);
    if (!otpResult.valid) {
      await t.rollback();
      throw createError(400, otpResult.message);
    }

    // ── Step 2: Validate source account belongs to user ───────────────────
    const fromAccount = await Account.findOne({
      where: { id: fromAccountId, userId: req.user.id, isActive: true },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!fromAccount) throw createError(404, 'Source account not found or inactive.');

    // ── Step 3: Validate destination account ──────────────────────────────
    const toAccount = await Account.findOne({
      where: { accountNumber: toAccountNumber, isActive: true },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!toAccount) throw createError(404, 'Destination account not found.');
    if (fromAccount.id === toAccount.id) throw createError(400, 'Cannot transfer to the same account.');

    // ── Step 4: Check sufficient balance ──────────────────────────────────
    const transferAmount = parseFloat(amount);
    if (parseFloat(fromAccount.balance) < transferAmount) {
      throw createError(400, `Insufficient balance. Available: ${fromAccount.currency} ${fromAccount.balance}`);
    }

    // ── Step 5: Execute transfer (atomic) ─────────────────────────────────
    await fromAccount.decrement('balance', { by: transferAmount, transaction: t });
    await toAccount.increment('balance', { by: transferAmount, transaction: t });

    await fromAccount.reload({ transaction: t });

    // ── Step 6: Record the transaction ────────────────────────────────────
    const txn = await Transaction.create({
      type: 'transfer',
      amount: transferAmount,
      currency: fromAccount.currency,
      status: 'completed',
      description: description || `Transfer to ${toAccountNumber}`,
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      balanceAfter: fromAccount.balance,
      ipAddress: req.ip,
      reference: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    }, { transaction: t });

    await t.commit();

    logger.info(`💸 Transfer: ${transferAmount} from ${fromAccount.accountNumber} → ${toAccountNumber} [${txn.reference}]`);

    res.status(201).json({
      message: 'Transfer completed successfully.',
      transaction: txn,
      newBalance: fromAccount.balance,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * POST /api/transactions/bill-payment
 * Pay a bill from a user's account
 *
 * Body: { fromAccountId, billerName, billerReference, amount, otpCode }
 */
const payBill = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await t.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromAccountId, billerName, billerReference, amount, otpCode } = req.body;

    // Verify OTP
    const otpResult = await verifyOTP(req.user.id, 'transfer', otpCode);
    if (!otpResult.valid) {
      await t.rollback();
      throw createError(400, otpResult.message);
    }

    const account = await Account.findOne({
      where: { id: fromAccountId, userId: req.user.id, isActive: true },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!account) throw createError(404, 'Account not found.');

    const payAmount = parseFloat(amount);
    if (parseFloat(account.balance) < payAmount) {
      throw createError(400, 'Insufficient balance.');
    }

    await account.decrement('balance', { by: payAmount, transaction: t });
    await account.reload({ transaction: t });

    const txn = await Transaction.create({
      type: 'bill_payment',
      amount: payAmount,
      currency: account.currency,
      status: 'completed',
      description: `Bill payment: ${billerName}`,
      fromAccountId: account.id,
      balanceAfter: account.balance,
      billerName,
      billerReference,
      ipAddress: req.ip,
      reference: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    }, { transaction: t });

    await t.commit();

    logger.info(`🧾 Bill payment: ${payAmount} to ${billerName} [${txn.reference}]`);

    res.status(201).json({
      message: 'Bill payment successful.',
      transaction: txn,
      newBalance: account.balance,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * GET /api/transactions
 * Get paginated transaction history for current user
 *
 * Query: ?page=1&limit=10&type=transfer&startDate=2024-01-01&endDate=2024-12-31
 */
const getTransactionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate, accountId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get user's account IDs
    const userAccounts = await Account.findAll({
      where: { userId: req.user.id },
      attributes: ['id'],
    });
    const accountIds = userAccounts.map((a) => a.id);

    // Build filter
    const where = {
      [Op.or]: [
        { fromAccountId: { [Op.in]: accountIds } },
        { toAccountId: { [Op.in]: accountIds } },
      ],
    };

    if (type) where.type = type;
    if (accountId) {
      where[Op.or] = [{ fromAccountId: accountId }, { toAccountId: accountId }];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Account, as: 'fromAccount', attributes: ['accountNumber', 'type'] },
        { model: Account, as: 'toAccount', attributes: ['accountNumber', 'type'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { requestTransferOTP, deposit, transfer, payBill, getTransactionHistory };
