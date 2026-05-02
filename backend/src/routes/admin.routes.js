/**
 * Admin Routes — all protected by admin role
 * GET  /api/admin/stats
 * GET  /api/admin/users
 * PUT  /api/admin/users/:id/status
 * GET  /api/admin/transactions
 */

const router = require('express').Router();
const { getAllUsers, toggleUserStatus, getAllTransactions, getStats, changeUserRole, deleteUser } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);
router.get('/transactions', getAllTransactions);

module.exports = router;
