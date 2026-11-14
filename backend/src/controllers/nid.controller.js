const db = require('../config/db');
const { success, badRequest, notFound, created } = require('../utils/response');

// POST /nid - User submits NID
async function submitNid(req, res, next) {
  try {
    const { full_name, nid_number, date_of_birth, address, father_mother_name } = req.body;

    if (!full_name || !nid_number || !date_of_birth || !address) {
      return badRequest(res, 'Please provide all required fields: full name, NID number, date of birth, and address.');
    }

    // Check uploaded files
    const frontImage = req.files?.front_image ? `/uploads/nid/${req.files.front_image[0].filename}` : req.body.front_image_url;
    const backImage = req.files?.back_image ? `/uploads/nid/${req.files.back_image[0].filename}` : req.body.back_image_url;
    const selfie = req.files?.selfie ? `/uploads/nid/${req.files.selfie[0].filename}` : req.body.selfie_url || null;

    if (!frontImage || !backImage) {
      return badRequest(res, 'Front and back photos of your National ID (NID) are required.');
    }

    // Insert or update NID verification record
    await db.query(
      `INSERT INTO nid_verifications 
       (user_id, full_name, nid_number, date_of_birth, address, father_mother_name, front_image_path, back_image_path, selfie_path, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         nid_number = VALUES(nid_number),
         date_of_birth = VALUES(date_of_birth),
         address = VALUES(address),
         father_mother_name = VALUES(father_mother_name),
         front_image_path = VALUES(front_image_path),
         back_image_path = VALUES(back_image_path),
         selfie_path = VALUES(selfie_path),
         status = 'pending',
         rejection_reason = NULL,
         submitted_at = NOW()`,
      [req.user.id, full_name, nid_number, date_of_birth, address, father_mother_name || null, frontImage, backImage, selfie]
    );

    // Update user's nid_status to pending
    await db.query("UPDATE users SET nid_status = 'pending' WHERE id = ?", [req.user.id]);

    // Also update user profile with nid number
    await db.query(
      `INSERT INTO user_profiles (user_id, nid_number, address_text)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nid_number = VALUES(nid_number), address_text = VALUES(address_text)`,
      [req.user.id, nid_number, address]
    );

    // Notify user
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'nid_submitted', 'NID Verification Submitted', 'Your NID documents have been submitted and are under review by our administration.', '/dashboard')`,
      [req.user.id]
    );

    return created(res, 'NID verification submitted successfully. Status is now pending admin review.', {
      nid_status: 'pending',
    });
  } catch (error) {
    next(error);
  }
}

// GET /nid/me - Get current user's NID status and data
async function getMyNid(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT n.id, n.full_name, n.nid_number, n.date_of_birth, n.address, n.father_mother_name,
              n.front_image_path, n.back_image_path, n.selfie_path, n.status, n.rejection_reason,
              n.submitted_at, n.reviewed_at, u.nid_status
       FROM users u
       LEFT JOIN nid_verifications n ON u.id = n.user_id
       WHERE u.id = ? LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return notFound(res, 'User record not found');
    }

    const data = rows[0];

    // If verified, also provide masked representation for client-side UI
    if (data.nid_number) {
      const len = data.nid_number.length;
      data.masked_nid_number = len > 8
        ? `${data.nid_number.slice(0, 4)}********${data.nid_number.slice(-4)}`
        : '********';
    }

    return success(res, 'NID verification details fetched', data);
  } catch (error) {
    next(error);
  }
}

// GET /admin/nid - Admin view all submitted NIDs
async function adminGetNidList(req, res, next) {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sql = `
      SELECT n.id, n.user_id, n.full_name, n.nid_number, n.date_of_birth, n.address,
             n.front_image_path, n.back_image_path, n.selfie_path, n.status, n.rejection_reason,
             n.submitted_at, n.reviewed_at,
             u.email, u.phone, u.role,
             reviewer.full_name AS reviewer_name
      FROM nid_verifications n
      JOIN users u ON n.user_id = u.id
      LEFT JOIN users reviewer ON n.reviewed_by = reviewer.id
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' WHERE n.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY n.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM nid_verifications ${status && status !== 'all' ? 'WHERE status = ?' : ''}`,
      status && status !== 'all' ? [status] : []
    );

    return success(res, 'NID applications fetched', {
      submissions: rows,
      total: countRows[0].total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    next(error);
  }
}

// GET /admin/nid/:id - Admin view single NID details
async function adminGetNidById(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT n.*, u.email, u.phone, u.role, u.status AS user_status,
              reviewer.full_name AS reviewer_name
       FROM nid_verifications n
       JOIN users u ON n.user_id = u.id
       LEFT JOIN users reviewer ON n.reviewed_by = reviewer.id
       WHERE n.id = ? LIMIT 1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return notFound(res, 'NID verification request not found');
    }

    return success(res, 'NID application details fetched', rows[0]);
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/nid/:id/review - Admin confirm or reject
async function adminReviewNid(req, res, next) {
  try {
    const { action, reason } = req.body; // action: 'confirm' or 'reject'

    if (!['confirm', 'reject'].includes(action)) {
      return badRequest(res, "Action must be either 'confirm' or 'reject'");
    }

    if (action === 'reject' && !reason) {
      return badRequest(res, 'A rejection reason is required when rejecting NID verification');
    }

    const [rows] = await db.query('SELECT user_id, full_name FROM nid_verifications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return notFound(res, 'NID verification request not found');
    }

    const nidRecord = rows[0];
    const newStatus = action === 'confirm' ? 'verified' : 'rejected';

    // Update nid_verifications
    await db.query(
      `UPDATE nid_verifications 
       SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [newStatus, action === 'reject' ? reason : null, req.user.id, req.params.id]
    );

    // Update users.nid_status
    await db.query('UPDATE users SET nid_status = ? WHERE id = ?', [newStatus, nidRecord.user_id]);

    // Send notification to user
    const notifTitle = action === 'confirm' ? 'NID Verification Approved!' : 'NID Verification Rejected';
    const notifBody = action === 'confirm'
      ? 'Congratulations! Your National ID has been verified. You can now post houses and make bookings on Smart House Rent.'
      : `Your NID submission was rejected. Reason: ${reason}. Please update and resubmit.`;
    const notifLink = action === 'confirm' ? '/dashboard' : '/nid';

    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, ?, ?, ?, ?)`,
      [nidRecord.user_id, action === 'confirm' ? 'nid_approved' : 'nid_rejected', notifTitle, notifBody, notifLink]
    );

    return success(res, `NID verification successfully ${action === 'confirm' ? 'verified' : 'rejected'}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitNid,
  getMyNid,
  adminGetNidList,
  adminGetNidById,
  adminReviewNid,
};
