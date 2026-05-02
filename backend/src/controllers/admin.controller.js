/**
 * Admin Controller
 * ================
 * Admin-only operations: manage users, monitor transactions.
 * All routes are protected by authenticate + authorize('admin').
 */

const { User, Account, Transaction } = require('../models');
const { createError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * GET /api/admin/users
 * List all users with pagination
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Account, as: 'accounts', attributes: ['id', 'type', 'balance', 'isActive'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      users,
      pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate a user account
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw createError(404, 'User not found.');
    if (user.id === req.user.id) throw createError(400, 'Cannot deactivate your own account.');

    await user.update({ isActive: !user.isActive });

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/transactions
 * Monitor all transactions with filters
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Account, as: 'fromAccount', attributes: ['accountNumber'], include: [{ model: User, as: 'owner', attributes: ['firstName', 'lastName', 'email'] }] },
        { model: Account, as: 'toAccount', attributes: ['accountNumber'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      transactions,
      pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Dashboard statistics: total users, transactions volume, etc.
 */
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAccounts, txnStats] = await Promise.all([
      User.count({ where: { role: 'client' } }),
      Account.count({ where: { isActive: true } }),
      Transaction.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        ],
        where: { status: 'completed' },
        group: ['type'],
        raw: true,
      }),
    ]);

    res.json({ totalUsers, totalAccounts, transactionStats: txnStats });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['client', 'gestionnaire', 'admin'].includes(role)) {
      throw createError(400, 'Invalid role specified.');
    }

    const user = await User.findByPk(req.params.id);
    if (!user) throw createError(404, 'User not found.');
    if (user.id === req.user.id) throw createError(400, 'Cannot change your own role.');

    await user.update({ role });

    res.json({
      message: `User role updated to ${role} successfully.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Hard delete a user and all associated data
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw createError(404, 'User not found.');
    if (user.id === req.user.id) throw createError(400, 'Cannot delete your own account.');

    // Sequelize handles cascading deletes if configured, but to be safe:
    await user.destroy();

    res.json({ message: 'User permanently deleted from the system.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, toggleUserStatus, getAllTransactions, getStats, changeUserRole, deleteUser };
