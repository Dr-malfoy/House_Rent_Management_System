const db = require('../config/db');
const { success } = require('../utils/response');

async function getMyNotifications(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT id, type, title, body, link, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const [unreadRows] = await db.query(
      'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    return success(res, 'Notifications fetched', {
      notifications: rows,
      unread_count: unreadRows[0].unread_count,
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notifId = parseInt(req.params.id, 10);
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notifId, req.user.id]
    );
    return success(res, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    return success(res, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
