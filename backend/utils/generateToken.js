const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @returns {string} JWT token
 */
const generateToken = (userId, userEmail) => {
  const payload = {
    user: {
      id: userId,
      email: userEmail
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate refresh token (for future implementation)
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    user: {
      id: userId
    },
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};
