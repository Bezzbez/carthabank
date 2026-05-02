/**
 * User Model
 * ==========
 * Represents a bank client or administrator.
 * Passwords are hashed via bcrypt before storage.
 */

const { DataTypes, STRING } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 50] },
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 50] },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('client', 'gestionnaire', 'admin'),
    defaultValue: 'client',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'users',
  hooks: {
    // Hash password before creating or updating
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

/**
 * Instance method: Compare plain password with stored hash
 */
User.prototype.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

/**
 * Instance method: Return safe user object (no password)
 */
User.prototype.toSafeObject = function () {
  const { password, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;
