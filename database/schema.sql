-- ============================================================
-- E-Banking Database Schema
-- ============================================================
-- Database: ebanking_db
-- Engine:   MySQL 8.0+ (or PostgreSQL — minor adjustments needed)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ebanking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ebanking_db;

-- ─────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────
CREATE TABLE users (
  id                CHAR(36)        NOT NULL DEFAULT (UUID()),
  first_name        VARCHAR(50)     NOT NULL,
  last_name         VARCHAR(50)     NOT NULL,
  email             VARCHAR(100)    NOT NULL,
  password          VARCHAR(255)    NOT NULL,
  phone             VARCHAR(20)     NULL,
  role              ENUM('client','admin') NOT NULL DEFAULT 'client',
  is_active         TINYINT(1)      NOT NULL DEFAULT 1,
  is_email_verified TINYINT(1)      NOT NULL DEFAULT 0,
  profile_picture   VARCHAR(255)    NULL,
  last_login_at     DATETIME        NULL,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ─────────────────────────────────────────
-- TABLE: accounts
-- ─────────────────────────────────────────
CREATE TABLE accounts (
  id             CHAR(36)                        NOT NULL DEFAULT (UUID()),
  account_number VARCHAR(20)                     NOT NULL,
  type           ENUM('checking','savings','credit') NOT NULL DEFAULT 'checking',
  balance        DECIMAL(15,2)                   NOT NULL DEFAULT 0.00,
  currency       CHAR(3)                         NOT NULL DEFAULT 'USD',
  is_active      TINYINT(1)                      NOT NULL DEFAULT 1,
  user_id        CHAR(36)                        NOT NULL,
  created_at     DATETIME                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME                        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_accounts_number (account_number),
  INDEX idx_accounts_user_id (user_id),
  INDEX idx_accounts_is_active (is_active),

  CONSTRAINT fk_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ─────────────────────────────────────────
-- TABLE: transactions
-- ─────────────────────────────────────────
CREATE TABLE transactions (
  id               CHAR(36)    NOT NULL DEFAULT (UUID()),
  reference        VARCHAR(30) NOT NULL,
  type             ENUM('transfer','deposit','withdrawal','bill_payment','fee') NOT NULL,
  amount           DECIMAL(15,2) NOT NULL,
  currency         CHAR(3)     NOT NULL DEFAULT 'USD',
  status           ENUM('pending','completed','failed','reversed') NOT NULL DEFAULT 'pending',
  description      VARCHAR(255) NULL,
  from_account_id  CHAR(36)    NULL,
  to_account_id    CHAR(36)    NULL,
  balance_after    DECIMAL(15,2) NULL,
  biller_name      VARCHAR(100) NULL,
  biller_reference VARCHAR(50)  NULL,
  ip_address       VARCHAR(45)  NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_reference (reference),
  INDEX idx_txn_from_account (from_account_id),
  INDEX idx_txn_to_account (to_account_id),
  INDEX idx_txn_type (type),
  INDEX idx_txn_status (status),
  INDEX idx_txn_created_at (created_at),

  CONSTRAINT fk_txn_from_account
    FOREIGN KEY (from_account_id) REFERENCES accounts(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  CONSTRAINT fk_txn_to_account
    FOREIGN KEY (to_account_id) REFERENCES accounts(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ─────────────────────────────────────────
-- TABLE: otps
-- ─────────────────────────────────────────
CREATE TABLE otps (
  id         CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)    NOT NULL,
  code       CHAR(6)     NOT NULL,
  purpose    ENUM('transfer','login','profile_change','password_reset') NOT NULL,
  expires_at DATETIME    NOT NULL,
  is_used    TINYINT(1)  NOT NULL DEFAULT 0,
  attempts   INT         NOT NULL DEFAULT 0,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_otps_user_purpose (user_id, purpose, is_used),
  INDEX idx_otps_expires_at (expires_at),

  CONSTRAINT fk_otps_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ─────────────────────────────────────────
-- SEED DATA: Admin user + demo client
-- ─────────────────────────────────────────
-- Admin password: Admin@1234 (bcrypt hash)
INSERT INTO users (id, first_name, last_name, email, password, role, is_active, is_email_verified)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Super', 'Admin',
  'admin@ebank.com',
  '$2a$12$dp.n.QYKEEsp5oe3T8jeSeYgY68UxxFwmQqHectRDf3mSlPQIppjC',
  'admin', 1, 1
);

-- Client password: Client@1234 (bcrypt hash)
INSERT INTO users (id, first_name, last_name, email, password, role, is_active, is_email_verified)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'John', 'Doe',
  'john.doe@example.com',
  '$2a$12$ygDNengBMiCsGXXtzwcBWOxISvufJFKwPGAUXVG8NiExaY7EAA8Qm',
  'client', 1, 1
);

INSERT INTO accounts (id, account_number, type, balance, currency, user_id)
VALUES
  ('cccccccc-0000-0000-0000-000000000003', 'EB1234567890123456', 'checking', 5000.00, 'USD', 'bbbbbbbb-0000-0000-0000-000000000002'),
  ('dddddddd-0000-0000-0000-000000000004', 'EB9876543210987654', 'savings',  12000.00, 'USD', 'bbbbbbbb-0000-0000-0000-000000000002');

INSERT INTO transactions (reference, type, amount, status, description, from_account_id, to_account_id, balance_after)
VALUES
  ('TXN-20240101-SEED001', 'deposit',  5000.00,  'completed', 'Initial deposit',       NULL,                                   'cccccccc-0000-0000-0000-000000000003', 5000.00),
  ('TXN-20240101-SEED002', 'deposit',  12000.00, 'completed', 'Initial savings',       NULL,                                   'dddddddd-0000-0000-0000-000000000004', 12000.00),
  ('TXN-20240115-SEED003', 'transfer', 500.00,   'completed', 'Transfer to savings',   'cccccccc-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000004', 4500.00);
