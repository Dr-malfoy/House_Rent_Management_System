const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/env');
const { success, created, badRequest, unauthorized, forbidden } = require('../utils/response');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// POST /auth/register
async function register(req, res, next) {
  try {
    const { full_name, email, phone, password, role = 'user' } = req.body;

    // Check if email already registered
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return badRequest(res, 'Email is already registered. Please login or use another email.');
    }

    // Role validation: public register allows 'user' or 'house_holder' only
    const assignedRole = ['user', 'house_holder'].includes(role) ? role : 'user';

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, nid_status, status)
       VALUES (?, ?, ?, ?, ?, 'not_submitted', 'active')`,
      [full_name, email, phone, passwordHash, assignedRole]
    );

    const userId = result.insertId;

    // Initialize user profile
    await db.query('INSERT INTO user_profiles (user_id) VALUES (?)', [userId]);

    // Create welcome notification
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'welcome', 'Welcome to Smart House Rent!', 'Please submit your National ID (NID) for verification to start posting and booking houses.', '/nid')`,
      [userId]
    );

    const user = {
      id: userId,
      full_name,
      email,
      phone,
      role: assignedRole,
      nid_status: 'not_submitted',
      status: 'active',
    };

    const token = generateToken(user);

    return created(res, 'Registration successful', { user, token });
  } catch (error) {
    next(error);
  }
}

// POST /auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role, u.nid_status, u.status, u.ban_reason,
              up.profile_photo_url, up.address_text, up.occupation
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.email = ? OR u.phone = ?
       LIMIT 1`,
      [email, email]
    );

    if (rows.length === 0) {
      return unauthorized(res, 'Invalid email/phone or password');
    }

    const user = rows[0];

    if (user.status === 'banned') {
      return forbidden(
        res,
        `Your account has been banned. Reason: ${user.ban_reason || 'Violation of terms of service.'}`
      );
    }

    if (user.status === 'inactive') {
      return forbidden(res, 'Your account is currently inactive. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return unauthorized(res, 'Invalid email/phone or password');
    }

    delete user.password_hash;
    const token = generateToken(user);

    return success(res, 'Login successful', { user, token });
  } catch (error) {
    next(error);
  }
}

// GET /auth/me
async function getMe(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.nid_status, u.status, u.created_at,
              up.address_text, up.nid_number, up.profile_photo_url, up.bio, up.occupation,
              (SELECT COUNT(*) FROM houses WHERE landlord_id = u.id) AS total_posted_houses,
              (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) AS total_bookings,
              (SELECT COUNT(*) FROM notifications WHERE user_id = u.id AND is_read = FALSE) AS unread_notifications
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return unauthorized(res, 'User not found');
    }

    return success(res, 'User profile fetched', rows[0]);
  } catch (error) {
    next(error);
  }
}

// PUT /auth/profile
async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, address_text, bio, occupation, profile_photo_url } = req.body;

    if (full_name || phone) {
      await db.query(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [full_name, phone, req.user.id]
      );
    }

    await db.query(
      `INSERT INTO user_profiles (user_id, address_text, bio, occupation, profile_photo_url)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         address_text = COALESCE(VALUES(address_text), address_text),
         bio = COALESCE(VALUES(bio), bio),
         occupation = COALESCE(VALUES(occupation), occupation),
         profile_photo_url = COALESCE(VALUES(profile_photo_url), profile_photo_url)`,
      [req.user.id, address_text, bio, occupation, profile_photo_url]
    );

    return success(res, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

// PUT /auth/change-password
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return unauthorized(res, 'User not found');
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!isMatch) {
      return badRequest(res, 'Current password does not match');
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return success(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
