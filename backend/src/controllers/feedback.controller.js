const db = require('../config/db');
const { success, created, badRequest, notFound } = require('../utils/response');

// POST /feedback - User submits feedback/complaint
async function submitFeedback(req, res, next) {
  try {
    const { category = 'Feedback', house_id, subject, message } = req.body;

    if (!subject || !message) {
      return badRequest(res, 'Subject and message are required.');
    }

    const [result] = await db.query(
      `INSERT INTO feedback (user_id, category, house_id, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [req.user.id, category, house_id || null, subject.trim(), message.trim()]
    );

    return created(res, 'Feedback submitted successfully. Our team will review and reply shortly.', {
      feedback_id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
}

// GET /admin/feedback - Admin list all feedback
async function getAdminFeedback(req, res, next) {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sql = `
      SELECT f.*,
             u.full_name AS sender_name, u.email AS sender_email, u.phone AS sender_phone,
             h.title AS house_title,
             admin.full_name AS responder_name
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN houses h ON f.house_id = h.id
      LEFT JOIN users admin ON f.responded_by = admin.id
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' WHERE f.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM feedback ${status && status !== 'all' ? 'WHERE status = ?' : ''}`,
      status && status !== 'all' ? [status] : []
    );

    return success(res, 'Feedback list fetched', {
      feedback: rows,
      total: countRows[0].total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    next(error);
  }
}

// POST /admin/feedback/:id/respond - Admin replies to feedback
async function respondToFeedback(req, res, next) {
  try {
    const feedbackId = parseInt(req.params.id, 10);
    const { response, status = 'resolved' } = req.body;

    if (!response || !response.trim()) {
      return badRequest(res, 'Response message is required');
    }

    const [rows] = await db.query('SELECT * FROM feedback WHERE id = ?', [feedbackId]);
    if (rows.length === 0) return notFound(res, 'Feedback not found');
    const item = rows[0];

    // Update feedback
    await db.query(
      `UPDATE feedback 
       SET admin_response = ?, status = ?, responded_by = ?, responded_at = NOW()
       WHERE id = ?`,
      [response.trim(), status, req.user.id, feedbackId]
    );

    // Create notification for the user who submitted the feedback
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'feedback_response', 'Admin Responded to Your Feedback', ?, '/contact')`,
      [item.user_id, `Re: "${item.subject}" - Admin replied: "${response.trim()}"`]
    );

    return success(res, 'Response sent to user successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitFeedback,
  getAdminFeedback,
  respondToFeedback,
};
