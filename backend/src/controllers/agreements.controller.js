const db = require('../config/db');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

// POST /agreements - Create rental agreement
async function createAgreement(req, res, next) {
  try {
    const { house_id, tenant_id, start_date, end_date, monthly_rent, deposit_amount } = req.body;

    const [houseRows] = await db.query('SELECT landlord_id, title FROM houses WHERE id = ?', [house_id]);
    if (houseRows.length === 0) return notFound(res, 'House not found');

    if (req.user.role !== 'admin' && houseRows[0].landlord_id !== req.user.id) {
      return forbidden(res, 'You can only create agreements for your own properties');
    }

    const [result] = await db.query(
      `INSERT INTO rental_agreements (house_id, tenant_id, landlord_id, start_date, end_date, monthly_rent, deposit_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [house_id, tenant_id, req.user.id, start_date, end_date || null, monthly_rent, deposit_amount || 0]
    );

    // Update house to deal_completed / rented
    await db.query("UPDATE houses SET status = 'deal_completed' WHERE id = ?", [house_id]);

    // Notify tenant
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'agreement_created', 'Rental Agreement Active', ?, '/dashboard')`,
      [tenant_id, `Rental agreement for "${houseRows[0].title}" has been created.`]
    );

    return created(res, 'Rental agreement created', { agreement_id: result.insertId });
  } catch (error) {
    next(error);
  }
}

// GET /agreements - Role-filtered agreements
async function getAgreements(req, res, next) {
  try {
    let sql = `
      SELECT ra.*, h.title AS house_title, h.address_text, h.cover_image,
             t.full_name AS tenant_name, t.email AS tenant_email, t.phone AS tenant_phone,
             l.full_name AS landlord_name, l.phone AS landlord_phone
      FROM rental_agreements ra
      JOIN houses h ON ra.house_id = h.id
      JOIN users t ON ra.tenant_id = t.id
      JOIN users l ON ra.landlord_id = l.id
    `;
    const params = [];

    if (req.user.role === 'admin') {
      // All
    } else if (req.user.role === 'house_holder') {
      sql += ' WHERE ra.landlord_id = ? OR ra.tenant_id = ?';
      params.push(req.user.id, req.user.id);
    } else {
      sql += ' WHERE ra.tenant_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY ra.created_at DESC';
    const [rows] = await db.query(sql, params);

    return success(res, 'Agreements fetched', rows);
  } catch (error) {
    next(error);
  }
}

// PATCH /agreements/:id/end
async function endAgreement(req, res, next) {
  try {
    const agreementId = parseInt(req.params.id, 10);
    const [rows] = await db.query('SELECT * FROM rental_agreements WHERE id = ?', [agreementId]);
    if (rows.length === 0) return notFound(res, 'Agreement not found');

    if (req.user.role !== 'admin' && rows[0].landlord_id !== req.user.id) {
      return forbidden(res, 'Only the landlord or admin can end this agreement');
    }

    await db.query("UPDATE rental_agreements SET status = 'ended' WHERE id = ?", [agreementId]);
    return success(res, 'Agreement marked as ended');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAgreement,
  getAgreements,
  endAgreement,
};
