const db = require('../config/db');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

async function createInquiry(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const { message } = req.body;

    if (!message || !message.trim()) {
      return badRequest(res, 'Inquiry message cannot be empty');
    }

    const [houseRows] = await db.query('SELECT landlord_id, title FROM houses WHERE id = ?', [houseId]);
    if (houseRows.length === 0) return notFound(res, 'House not found');

    const [result] = await db.query(
      'INSERT INTO inquiries (house_id, user_id, message, status) VALUES (?, ?, ?, "new")',
      [houseId, req.user.id, message.trim()]
    );

    // Notify landlord
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'inquiry_new', 'New Inquiry Received', ?, '/host')`,
      [houseRows[0].landlord_id, `${req.user.full_name} asked a question about "${houseRows[0].title}".`]
    );

    return created(res, 'Inquiry sent successfully', { inquiry_id: result.insertId });
  } catch (error) {
    next(error);
  }
}

async function getInquiries(req, res, next) {
  try {
    // If user is house_holder or admin, show inquiries on their properties; otherwise show inquiries they sent
    const [sent] = await db.query(
      `SELECT i.*, h.title AS house_title, h.cover_image, u.full_name AS landlord_name
       FROM inquiries i
       JOIN houses h ON i.house_id = h.id
       JOIN users u ON h.landlord_id = u.id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    const [received] = await db.query(
      `SELECT i.*, h.title AS house_title, h.cover_image, u.full_name AS sender_name, u.email AS sender_email, u.phone AS sender_phone
       FROM inquiries i
       JOIN houses h ON i.house_id = h.id
       JOIN users u ON i.user_id = u.id
       WHERE h.landlord_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    return success(res, 'Inquiries fetched', { sent, received });
  } catch (error) {
    next(error);
  }
}

async function updateInquiryStatus(req, res, next) {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const { status } = req.body; // 'read', 'replied', 'closed'

    const [rows] = await db.query(
      'SELECT i.*, h.landlord_id FROM inquiries i JOIN houses h ON i.house_id = h.id WHERE i.id = ?',
      [inquiryId]
    );

    if (rows.length === 0) return notFound(res, 'Inquiry not found');
    if (req.user.role !== 'admin' && rows[0].landlord_id !== req.user.id) {
      return forbidden(res, 'Unauthorized');
    }

    await db.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, inquiryId]);
    return success(res, `Inquiry status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
};
