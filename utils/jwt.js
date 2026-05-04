const jwt = require('jsonwebtoken');

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment');
  }
  return jwt.sign({ userId: String(userId) }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment');
  }
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
