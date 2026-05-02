/**
 * User Routes
 * ===========
 * GET  /api/users/profile
 * PUT  /api/users/profile
 * PUT  /api/users/password
 * GET  /api/users/dashboard
 */

const router = require('express').Router();
const { body } = require('express-validator');
const { getProfile, updateProfile, changePassword, getDashboard } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);

router.put('/profile', [
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone(),
], updateProfile);

router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must be 8+ chars with uppercase, lowercase, and number'),
], changePassword);

module.exports = router;
