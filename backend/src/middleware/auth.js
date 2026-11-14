const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../config/db');
const { unauthorized, forbidden } = require('../utils/response');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr) {
      return unauthorized(res, 'Invalid or expired session token. Please log in again.');
    }

    // Query user state from DB
    const [rows] = await db.query(
      'SELECT id, full_name, email, phone, role, nid_status, status, ban_reason FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return unauthorized(res, 'User account no longer exists');
    }

    const user = rows[0];

    // Check account status
    if (user.status === 'banned') {
      return forbidden(
        res,
        `Your account has been banned: ${user.ban_reason || 'Violation of platform terms.'}`
      );
    }

    if (user.status === 'inactive') {
      return forbidden(res, 'Your account is deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// Optional auth for public routes where logged-in users get additional personalized info
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const [rows] = await db.query(
      'SELECT id, full_name, email, phone, role, nid_status, status FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );
    if (rows.length > 0 && rows[0].status === 'active') {
      req.user = rows[0];
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuth,
};
