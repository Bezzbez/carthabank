/**
 * Transaction Routes
 * ==================
 * POST /api/transactions/otp/request
 * POST /api/transactions/transfer
 * POST /api/transactions/bill-payment
 * GET  /api/transactions
 */

const router = require('express').Router();
const { body } = require('express-validator');
const {
  requestTransferOTP,
  deposit,
  transfer,
  payBill,
  getTransactionHistory,
} = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/otp/request', requestTransferOTP);

router.post('/deposit', [
  body('accountId').isUUID().withMessage('Invalid account'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().isLength({ max: 255 }),
], deposit);

router.post('/transfer', [
  body('fromAccountId').isUUID().withMessage('Invalid source account'),
  body('toAccountNumber').notEmpty().withMessage('Destination account number is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('otpCode').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('description').optional().isLength({ max: 255 }),
], transfer);

router.post('/bill-payment', [
  body('fromAccountId').isUUID(),
  body('billerName').notEmpty().withMessage('Biller name is required'),
  body('billerReference').notEmpty().withMessage('Biller reference is required'),
  body('amount').isFloat({ min: 0.01 }),
  body('otpCode').isLength({ min: 6, max: 6 }),
], payBill);

router.get('/', getTransactionHistory);

module.exports = router;
