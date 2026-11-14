const db = require('../config/db');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

// POST /billing - Landlord generates monthly entry
async function createBillingEntry(req, res, next) {
  try {
    const { agreement_id, billing_month, rent_amount, utility_amount = 0, other_charges = 0, due_date, note } = req.body;

    const [agrRows] = await db.query(
      `SELECT ra.*, h.title AS house_title FROM rental_agreements ra 
       JOIN houses h ON ra.house_id = h.id 
       WHERE ra.id = ?`,
      [agreement_id]
    );

    if (agrRows.length === 0) return notFound(res, 'Rental agreement not found');
    const agr = agrRows[0];

    if (req.user.role !== 'admin' && agr.landlord_id !== req.user.id) {
      return forbidden(res, 'Only the property owner can generate billing');
    }

    const rent = parseFloat(rent_amount || agr.monthly_rent);
    const utility = parseFloat(utility_amount) || 0;
    const other = parseFloat(other_charges) || 0;
    const total = rent + utility + other;

    const [result] = await db.query(
      `INSERT INTO billing_ledger (
        agreement_id, billing_month, rent_amount, utility_amount, other_charges,
        total_amount, due_date, payment_status, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'unpaid', ?)`,
      [agreement_id, billing_month, rent, utility, other, total, due_date, note || null]
    );

    // Notify tenant
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'bill_generated', 'New Monthly Rent Bill Generated', ?, '/dashboard')`,
      [agr.tenant_id, `Bill of ৳${total} for month ${billing_month} has been recorded for "${agr.house_title}".`]
    );

    return created(res, 'Monthly bill generated successfully', { billing_id: result.insertId });
  } catch (error) {
    next(error);
  }
}

// GET /billing - Role filtered list
async function getBillingList(req, res, next) {
  try {
    let sql = `
      SELECT bl.*,
             ra.house_id, ra.tenant_id, ra.landlord_id,
             h.title AS house_title, h.address_text,
             t.full_name AS tenant_name, t.phone AS tenant_phone,
             l.full_name AS landlord_name, l.phone AS landlord_phone
      FROM billing_ledger bl
      JOIN rental_agreements ra ON bl.agreement_id = ra.id
      JOIN houses h ON ra.house_id = h.id
      JOIN users t ON ra.tenant_id = t.id
      JOIN users l ON ra.landlord_id = l.id
    `;
    const params = [];

    if (req.user.role === 'admin') {
      // Admin sees all
    } else if (req.user.role === 'house_holder') {
      sql += ' WHERE ra.landlord_id = ? OR ra.tenant_id = ?';
      params.push(req.user.id, req.user.id);
    } else {
      sql += ' WHERE ra.tenant_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY bl.billing_month DESC, bl.created_at DESC';
    const [rows] = await db.query(sql, params);

    return success(res, 'Billing ledger entries fetched', rows);
  } catch (error) {
    next(error);
  }
}

// PATCH /billing/:id/pay - Landlord manually records offline payment
async function recordPayment(req, res, next) {
  try {
    const billingId = parseInt(req.params.id, 10);
    const { paid_amount, payment_method = 'cash', paid_on = new Date(), note } = req.body;

    const [rows] = await db.query(
      `SELECT bl.*, ra.landlord_id, ra.tenant_id, h.title AS house_title
       FROM billing_ledger bl
       JOIN rental_agreements ra ON bl.agreement_id = ra.id
       JOIN houses h ON ra.house_id = h.id
       WHERE bl.id = ? LIMIT 1`,
      [billingId]
    );

    if (rows.length === 0) return notFound(res, 'Billing record not found');
    const bill = rows[0];

    if (req.user.role !== 'admin' && bill.landlord_id !== req.user.id) {
      return forbidden(res, 'Only the landlord or admin can record payment entries');
    }

    const amount = parseFloat(paid_amount) || parseFloat(bill.total_amount);
    const status = amount >= parseFloat(bill.total_amount) ? 'paid' : 'partial';

    await db.query(
      `UPDATE billing_ledger
       SET payment_status = ?, paid_amount = ?, paid_on = ?, payment_method = ?, note = COALESCE(?, note)
       WHERE id = ?`,
      [status, amount, paid_on, payment_method, note || null, billingId]
    );

    // Notify tenant of manual payment receipt
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'payment_recorded', 'Payment Recorded Manually', ?, '/dashboard')`,
      [bill.tenant_id, `Landlord recorded payment of ৳${amount} for "${bill.house_title}". Status: ${status.toUpperCase()}.`]
    );

    return success(res, `Payment of ৳${amount} recorded successfully. Status: ${status}`);
  } catch (error) {
    next(error);
  }
}

// GET /billing/summary
async function getBillingSummary(req, res, next) {
  try {
    const userId = req.user.id;
    let sql = `
      SELECT 
        COUNT(*) AS total_bills,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_bills,
        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_bills,
        SUM(total_amount) AS total_billed_amount,
        SUM(paid_amount) AS total_collected_amount
      FROM billing_ledger bl
      JOIN rental_agreements ra ON bl.agreement_id = ra.id
    `;
    const params = [];

    if (req.user.role === 'admin') {
      // all
    } else if (req.user.role === 'house_holder') {
      sql += ' WHERE ra.landlord_id = ?';
      params.push(userId);
    } else {
      sql += ' WHERE ra.tenant_id = ?';
      params.push(userId);
    }

    const [rows] = await db.query(sql, params);
    return success(res, 'Billing summary fetched', rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBillingEntry,
  getBillingList,
  recordPayment,
  getBillingSummary,
};
