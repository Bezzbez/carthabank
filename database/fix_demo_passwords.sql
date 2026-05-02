-- ============================================================
-- Fix Demo Account Passwords
-- Run this against your ebanking_db to update the existing
-- demo accounts with the correct bcrypt password hashes.
-- ============================================================

USE ebanking_db;

-- Fix John Doe password → Client@1234
UPDATE users
SET password = '$2a$12$ygDNengBMiCsGXXtzwcBWOxISvufJFKwPGAUXVG8NiExaY7EAA8Qm'
WHERE email = 'john.doe@example.com';

-- Fix Super Admin password → Admin@1234
UPDATE users
SET password = '$2a$12$dp.n.QYKEEsp5oe3T8jeSeYgY68UxxFwmQqHectRDf3mSlPQIppjC'
WHERE email = 'admin@ebank.com';

-- Verify updates
SELECT email, LEFT(password, 20) AS hash_preview, role FROM users WHERE email IN ('john.doe@example.com', 'admin@ebank.com');
