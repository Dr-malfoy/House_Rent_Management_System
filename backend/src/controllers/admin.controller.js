const db = require('../config/db');
const { success, badRequest, notFound } = require('../utils/response');

// GET /admin/stats - System statistics
async function getStats(req, res, next) {
  try {
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) AS total_regular_users,
        SUM(CASE WHEN role = 'house_holder' THEN 1 ELSE 0 END) AS total_house_holders,
        SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) AS banned_users,
        SUM(CASE WHEN nid_status = 'pending' THEN 1 ELSE 0 END) AS pending_nids,
        SUM(CASE WHEN nid_status = 'verified' THEN 1 ELSE 0 END) AS verified_nids
      FROM users
    `);

    const [houseStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_houses,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_houses,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_houses,
        SUM(CASE WHEN status = 'deal_completed' THEN 1 ELSE 0 END) AS deal_completed_houses,
        SUM(CASE WHEN is_featured = TRUE THEN 1 ELSE 0 END) AS featured_houses
      FROM houses
    `);

    const [bookingStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
        SUM(CASE WHEN status = 'deal_completed' THEN 1 ELSE 0 END) AS completed_deals
      FROM bookings
    `);

    const [feedbackStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_feedback,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_feedback,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_feedback
      FROM feedback
    `);

    return success(res, 'Admin stats fetched', {
      users: userStats[0],
      houses: houseStats[0],
      bookings: bookingStats[0],
      feedback: feedbackStats[0],
    });
  } catch (error) {
    next(error);
  }
}

// GET /admin/users - Users list with filters
async function getUsersList(req, res, next) {
  try {
    const { search, role, status, nid_status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sql = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.nid_status, u.status, u.ban_reason, u.created_at,
             (SELECT COUNT(*) FROM houses WHERE landlord_id = u.id) AS houses_posted_count,
             (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) AS bookings_count
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    if (status && status !== 'all') {
      sql += ' AND u.status = ?';
      params.push(status);
    }

    if (nid_status && nid_status !== 'all') {
      sql += ' AND u.nid_status = ?';
      params.push(nid_status);
    }

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);

    return success(res, 'Users fetched', rows);
  } catch (error) {
    next(error);
  }
}

// GET /admin/users/:id - User detailed view with NID & history
async function getUserDetails(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);

    const [userRows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.nid_status, u.status, u.ban_reason, u.created_at,
              up.address_text, up.nid_number, up.profile_photo_url, up.bio, up.occupation
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (userRows.length === 0) return notFound(res, 'User not found');

    // NID application
    const [nidRows] = await db.query('SELECT * FROM nid_verifications WHERE user_id = ? LIMIT 1', [userId]);

    // User's posted houses
    const [houses] = await db.query(
      'SELECT id, title, area_name, rent_amount, status, is_featured, created_at FROM houses WHERE landlord_id = ?',
      [userId]
    );

    // User's bookings
    const [bookings] = await db.query(
      `SELECT b.id, b.status, b.move_in_date, b.created_at, h.title AS house_title
       FROM bookings b JOIN houses h ON b.house_id = h.id
       WHERE b.user_id = ?`,
      [userId]
    );

    return success(res, 'User details fetched', {
      user: userRows[0],
      nid: nidRows[0] || null,
      houses,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/users/:id/ban
async function banUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { reason = 'Violation of platform terms and safety policies.' } = req.body;

    if (userId === req.user.id) {
      return badRequest(res, 'You cannot ban your own administrator account');
    }

    await db.query("UPDATE users SET status = 'banned', ban_reason = ? WHERE id = ?", [reason, userId]);

    return success(res, 'User has been banned successfully');
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/users/:id/unban
async function unbanUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    await db.query("UPDATE users SET status = 'active', ban_reason = NULL WHERE id = ?", [userId]);
    return success(res, 'User has been unbanned successfully');
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/users/:id/role
async function changeUserRole(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['user', 'house_holder', 'admin'].includes(role)) {
      return badRequest(res, 'Invalid role');
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    return success(res, `User role changed to ${role}`);
  } catch (error) {
    next(error);
  }
}

// GET /admin/houses - All houses for admin table
async function getAdminHouses(req, res, next) {
  try {
    const { status, is_featured, search, page = 1, limit = 25 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sql = `
      SELECT h.id, h.title, h.address_text, h.area_name, h.division, h.district,
             h.rent_amount, h.bedrooms, h.bathrooms, h.size_sqft, h.cover_image,
             h.status, h.is_featured, h.created_at,
             u.full_name AS landlord_name, u.email AS landlord_email, u.phone AS landlord_phone,
             (SELECT COUNT(*) FROM bookings b WHERE b.house_id = h.id) AS bookings_count,
             ST_X(h.location) AS longitude,
             ST_Y(h.location) AS latitude
      FROM houses h
      JOIN users u ON h.landlord_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND h.status = ?';
      params.push(status);
    }

    if (is_featured !== undefined && is_featured !== '') {
      sql += ' AND h.is_featured = ?';
      params.push(is_featured === 'true' || is_featured === '1' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (h.title LIKE ? OR h.address_text LIKE ? OR h.area_name LIKE ? OR u.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY h.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);

    const houses = rows.map((r) => ({
      ...r,
      rent_amount: parseFloat(r.rent_amount),
      coordinates: { lat: r.latitude, lng: r.longitude },
    }));

    return success(res, 'Admin houses list fetched', houses);
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/houses/:id/review - Approve or reject house
async function reviewHouse(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const { action, reason } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return badRequest(res, "Action must be 'approve' or 'reject'");
    }

    const [rows] = await db.query('SELECT landlord_id, title FROM houses WHERE id = ?', [houseId]);
    if (rows.length === 0) return notFound(res, 'House not found');
    const house = rows[0];

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await db.query('UPDATE houses SET status = ? WHERE id = ?', [newStatus, houseId]);

    // Send notification to landlord
    const notifTitle = action === 'approve' ? 'House Post Approved! 🎉' : 'House Post Rejected';
    const notifBody = action === 'approve'
      ? `Your house listing "${house.title}" has been approved and is now live on Smart House Rent.`
      : `Your listing "${house.title}" was rejected by admin. ${reason ? 'Reason: ' + reason : ''}`;

    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, ?, ?, ?, '/host')`,
      [house.landlord_id, `house_${newStatus}`, notifTitle, notifBody]
    );

    return success(res, `House listing successfully ${newStatus}`);
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/houses/:id/featured - Toggle featured flag
async function toggleFeatured(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const [rows] = await db.query('SELECT is_featured, title FROM houses WHERE id = ?', [houseId]);
    if (rows.length === 0) return notFound(res, 'House not found');

    const newFeatured = !rows[0].is_featured;
    await db.query('UPDATE houses SET is_featured = ? WHERE id = ?', [newFeatured, houseId]);

    return success(res, `House "${rows[0].title}" ${newFeatured ? 'marked as featured (shown in Hero slider)' : 'unmarked from featured'}`);
  } catch (error) {
    next(error);
  }
}

// Amenity & Property Type Lookups CRUD
async function getLookups(req, res, next) {
  try {
    const [amenities] = await db.query('SELECT * FROM amenities ORDER BY name ASC');
    const [propertyTypes] = await db.query('SELECT * FROM property_types ORDER BY name ASC');
    return success(res, 'Lookups fetched', { amenities, property_types: propertyTypes });
  } catch (error) {
    next(error);
  }
}

async function createAmenity(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return badRequest(res, 'Name is required');
    const [result] = await db.query('INSERT INTO amenities (name) VALUES (?)', [name.trim()]);
    return success(res, 'Amenity added', { id: result.insertId, name: name.trim() });
  } catch (error) {
    next(error);
  }
}

async function deleteAmenity(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await db.query('DELETE FROM amenities WHERE id = ?', [id]);
    return success(res, 'Amenity deleted');
  } catch (error) {
    next(error);
  }
}

async function createPropertyType(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return badRequest(res, 'Name is required');
    const [result] = await db.query('INSERT INTO property_types (name) VALUES (?)', [name.trim()]);
    return success(res, 'Property type added', { id: result.insertId, name: name.trim() });
  } catch (error) {
    next(error);
  }
}

async function deletePropertyType(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await db.query('DELETE FROM property_types WHERE id = ?', [id]);
    return success(res, 'Property type deleted');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getUsersList,
  getUserDetails,
  banUser,
  unbanUser,
  changeUserRole,
  getAdminHouses,
  reviewHouse,
  toggleFeatured,
  getLookups,
  createAmenity,
  deleteAmenity,
  createPropertyType,
  deletePropertyType,
};
