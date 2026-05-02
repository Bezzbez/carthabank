/**
 * Gestionnaire Routes — protected by gestionnaire/admin role
 * GET    /api/gestionnaire/dashboard
 * GET    /api/gestionnaire/pending-transfers
 * PUT    /api/gestionnaire/transfers/:id/review
 * GET    /api/gestionnaire/loans
 * PUT    /api/gestionnaire/loans/:id/review
 * GET    /api/gestionnaire/customers
 * PATCH  /api/gestionnaire/accounts/:id/toggle-freeze
 * GET    /api/gestionnaire/review-history
 */

const router = require('express').Router();
const {
  getDashboardStats,
  getPendingTransfers,
  reviewTransfer,
  getLoanRequests,
  reviewLoan,
  getCustomerAccounts,
  toggleAccountFreeze,
  getReviewHistory,
} = require('../controllers/gestionnaire.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require gestionnaire or admin role
router.use(authenticate, authorize('gestionnaire', 'admin'));

router.get('/dashboard', getDashboardStats);
router.get('/pending-transfers', getPendingTransfers);
router.put('/transfers/:id/review', reviewTransfer);
router.get('/loans', getLoanRequests);
router.put('/loans/:id/review', reviewLoan);
router.get('/customers', getCustomerAccounts);
router.patch('/accounts/:id/toggle-freeze', toggleAccountFreeze);
router.get('/review-history', getReviewHistory);

module.exports = router;
