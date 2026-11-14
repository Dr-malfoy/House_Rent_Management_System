const { forbidden } = require('../utils/response');

/**
 * Role-Based Access Control (RBAC) middleware
 * Supports: 'user', 'house_holder', 'admin'
 * Note: Admin has universal access.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentication required');
    }

    // Admins always have access to all routes
    if (req.user.role === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return forbidden(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized for this resource`
      );
    }

    next();
  };
}

/**
 * NID Verification check middleware
 * Users and house holders must be NID verified to post houses or make bookings.
 */
function requireNidVerified(req, res, next) {
  if (!req.user) {
    return forbidden(res, 'Authentication required');
  }

  // Admin bypasses NID check
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.nid_status !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'National ID (NID) verification is required before you can perform this action.',
      requires_nid: true,
      current_nid_status: req.user.nid_status,
      data: null,
      errors: ['NID not verified'],
    });
  }

  next();
}

module.exports = {
  authorize,
  requireNidVerified,
};
