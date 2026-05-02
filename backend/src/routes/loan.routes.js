/**
 * Loan Routes — client-facing loan management
 * POST   /api/loans/request
 * GET    /api/loans
 * GET    /api/loans/:id
 */

const router = require('express').Router();
const { body } = require('express-validator');
const { requestLoan, getMyLoans, getLoanDetails } = require('../controllers/loan.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/request', [
  body('amount').isFloat({ min: 100 }).withMessage('Minimum loan amount is 100.'),
  body('termMonths').isInt({ min: 3, max: 360 }).withMessage('Term must be between 3 and 360 months.'),
  body('purpose').notEmpty().withMessage('Please specify a loan purpose.'),
], requestLoan);

router.get('/', getMyLoans);
router.get('/:id', getLoanDetails);

module.exports = router;
