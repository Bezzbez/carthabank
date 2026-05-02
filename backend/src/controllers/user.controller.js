/**
 * User Controller
 * ===============
 * Profile management and account overview.
 */

const { validationResult } = require('express-validator');
const { User, Account, Transaction } = require('../models');
const { createError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * GET /api/users/profile
 * Get current user's profile with accounts summary
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Account,
        as: 'accounts',
        where: { isActive: true },
        required: false,
      }],
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 * Update current user's profile (name, phone)
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;

    await req.user.update({ firstName, lastName, phone });

    res.json({
      message: 'Profile updated successfully.',
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/password
 * Change user password (requires current password)
 */
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Re-fetch user with password for comparison
    const user = await User.findByPk(req.user.id);
    const isValid = await user.comparePassword(currentPassword);

    if (!isValid) throw createError(400, 'Current password is incorrect.');

    await user.update({ password: newPassword });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/dashboard
 * Aggregated dashboard data: accounts, recent transactions, stats
 */
const getDashboard = async (req, res, next) => {
  try {
    const accounts = await Account.findAll({
      where: { userId: req.user.id, isActive: true },
    });

    const accountIds = accounts.map((a) => a.id);
    const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

    // Recent 5 transactions
    const recentTransactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { fromAccountId: { [Op.in]: accountIds } },
          { toAccountId: { [Op.in]: accountIds } },
        ],
      },
      include: [
        { model: Account, as: 'fromAccount', attributes: ['accountNumber'] },
        { model: Account, as: 'toAccount', attributes: ['accountNumber'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({
      accounts,
      totalBalance: totalBalance.toFixed(2),
      currency: accounts[0]?.currency || 'USD',
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getDashboard };
