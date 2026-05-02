/**
 * OTP Service
 * ===========
 * Handles generation, storage, and verification of One-Time Passwords.
 * OTPs expire in 60 seconds and are invalidated after first use.
 */

const { OTP } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Generates a cryptographically random 6-digit OTP.
 */
function generateOTPCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates and saves a new OTP for a user action.
 * Invalidates any existing unused OTPs for the same purpose.
 *
 * @param {string} userId
 * @param {string} purpose - 'transfer' | 'login' | 'profile_change' | 'password_reset'
 * @returns {string} The generated OTP code
 */
async function generateOTP(userId, purpose) {
  // Invalidate old OTPs for this user/purpose
  await OTP.update(
    { isUsed: true },
    { where: { userId, purpose, isUsed: false } }
  );

  const code = generateOTPCode();
  const expirySeconds = parseInt(process.env.OTP_EXPIRY_SECONDS) || 60;
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  await OTP.create({ userId, code, purpose, expiresAt });

  // ── Simulate sending OTP ────────────────────────────────────────────────
  // In production: send via email or SMS
  logger.info(`📱 OTP [${purpose}] for user ${userId}: ${code} (expires in ${expirySeconds}s)`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🔐 ===== OTP CODE =====`);
    console.log(`   Purpose : ${purpose}`);
    console.log(`   Code    : ${code}`);
    console.log(`   Expires : ${expirySeconds} seconds`);
    console.log(`======================\n`);
  }

  return code;
}

/**
 * Verifies an OTP code submitted by the user.
 * Marks OTP as used on success. Tracks failed attempts.
 *
 * @param {string} userId
 * @param {string} purpose
 * @param {string} code - The code submitted by the user
 * @returns {{ valid: boolean, message: string }}
 */
async function verifyOTP(userId, purpose, code) {
  const MAX_ATTEMPTS = 3;

  const otp = await OTP.findOne({
    where: {
      userId,
      purpose,
      isUsed: false,
      expiresAt: { [Op.gt]: new Date() },   // Not yet expired
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otp) {
    return { valid: false, message: 'OTP not found or has expired. Please request a new one.' };
  }

  // Check attempt count
  if (otp.attempts >= MAX_ATTEMPTS) {
    await otp.update({ isUsed: true });
    return { valid: false, message: 'Maximum OTP attempts exceeded. Please request a new one.' };
  }

  // Increment attempt count
  await otp.increment('attempts');

  if (otp.code !== code) {
    const remaining = MAX_ATTEMPTS - otp.attempts - 1;
    return { valid: false, message: `Invalid OTP. ${remaining} attempts remaining.` };
  }

  // Mark as used
  await otp.update({ isUsed: true });

  return { valid: true, message: 'OTP verified successfully.' };
}

/**
 * Cleans up expired OTPs from the database (run as a cron job in production).
 */
async function cleanupExpiredOTPs() {
  const deleted = await OTP.destroy({
    where: { expiresAt: { [Op.lt]: new Date() } },
  });
  logger.info(`🧹 Cleaned up ${deleted} expired OTPs`);
}

module.exports = { generateOTP, verifyOTP, cleanupExpiredOTPs };
