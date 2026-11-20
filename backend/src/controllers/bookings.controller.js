const db = require('../config/db');
const spatialService = require('../services/spatial.service');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

// POST /bookings - Create booking (requires verified NID)
async function createBooking(req, res, next) {
  try {
    const { house_id, members = 1, move_in_date, message, share_location = true, booker_lat, booker_lng } = req.body;

    if (!house_id || !move_in_date) {
      return badRequest(res, 'House ID and Move-in Date are required.');
    }

    // Check house status and ownership
    const [houseRows] = await db.query(
      'SELECT id, landlord_id, title, status FROM houses WHERE id = ?',
      [house_id]
    );

    if (houseRows.length === 0) {
      return notFound(res, 'House not found');
    }

    const house = houseRows[0];

    // Check if user is trying to book their own house
    if (house.landlord_id === req.user.id) {
      return badRequest(res, 'You cannot book your own property.');
    }

    // Check if house is already booked or deal completed
    if (['deal_completed', 'rented'].includes(house.status)) {
      return badRequest(res, 'This property has already been rented / deal completed.');
    }

    // Check if user already booked this house
    const [existing] = await db.query(
      'SELECT id, status FROM bookings WHERE house_id = ? AND user_id = ?',
      [house_id, req.user.id]
    );

    if (existing.length > 0) {
      return badRequest(res, `You already submitted a booking for this house (Status: ${existing[0].status}).`);
    }

    // Server-side check of booker's verified NID data
    const [nidRows] = await db.query(
      "SELECT full_name, nid_number, date_of_birth, address FROM nid_verifications WHERE user_id = ? AND status = 'verified'",
      [req.user.id]
    );

    if (nidRows.length === 0 && req.user.role !== 'admin') {
      return forbidden(res, 'Your NID is not yet verified. Please wait for admin approval before booking.');
    }

    let lat = null;
    let lng = null;
    let locationPoint = null;

    if (share_location && booker_lat && booker_lng) {
      lat = parseFloat(booker_lat);
      lng = parseFloat(booker_lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        locationPoint = `POINT(${lng} ${lat})`;
      }
    }

    const [result] = await db.query(
      `INSERT INTO bookings (
        house_id, user_id, members, move_in_date, message,
        share_location, booker_lat, booker_lng, booker_location, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ${locationPoint ? 'ST_GeomFromText(?)' : 'NULL'}, 'pending'
      )`,
      locationPoint
        ? [house_id, req.user.id, members, move_in_date, message || null, share_location, lat, lng, locationPoint]
        : [house_id, req.user.id, members, move_in_date, message || null, share_location, lat, lng]
    );

    const bookingId = result.insertId;

    // Notify the house holder
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'booking_new', 'New Booking Received!', ?, '/host')`,
      [
        house.landlord_id,
        `${req.user.full_name} submitted a booking request for "${house.title}".`,
      ]
    );

    // Notify the booker
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'booking_submitted', 'Booking Submitted', ?, '/dashboard')`,
      [
        req.user.id,
        `Your booking request for "${house.title}" has been sent to the house holder.`,
      ]
    );

    return created(res, 'Booking request submitted successfully!', {
      booking_id: bookingId,
      status: 'pending',
    });
  } catch (error) {
    next(error);
  }
}

// GET /me/bookings - Booker view own bookings
async function getMyBookings(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT 
        b.id, b.house_id, b.members, b.move_in_date, b.message, b.status, b.created_at,
        h.title AS house_title, h.address_text, h.area_name, h.city, h.rent_amount,
        h.bedrooms, h.bathrooms, h.cover_image, h.status AS house_status,
        u.full_name AS landlord_name, u.phone AS landlord_phone, u.email AS landlord_email
       FROM bookings b
       JOIN houses h ON b.house_id = h.id
       JOIN users u ON h.landlord_id = u.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    const bookings = rows.map((r) => ({
      ...r,
      rent_amount: parseFloat(r.rent_amount),
    }));

    return success(res, 'Your bookings fetched', bookings);
  } catch (error) {
    next(error);
  }
}

// GET /houses/:id/bookings - House holder view bookers for their house
async function getHouseBookers(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const [houseRows] = await db.query('SELECT landlord_id, title FROM houses WHERE id = ?', [houseId]);
    if (houseRows.length === 0) return notFound(res, 'House not found');

    if (req.user.role !== 'admin' && houseRows[0].landlord_id !== req.user.id) {
      return forbidden(res, 'You can only view bookings for your own properties');
    }

    const [rows] = await db.query(
      `SELECT 
        b.id, b.house_id, b.user_id, b.members, b.move_in_date, b.message,
        b.share_location, b.booker_lat, b.booker_lng, b.status, b.created_at,
        u.full_name AS booker_name, u.email AS booker_email, u.phone AS booker_phone,
        u.nid_status AS booker_nid_status,
        up.profile_photo_url AS booker_photo, up.occupation AS booker_occupation,
        nv.address AS verified_address, nv.date_of_birth
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN nid_verifications nv ON u.id = nv.user_id AND nv.status = 'verified'
       WHERE b.house_id = ?
       ORDER BY b.created_at DESC`,
      [houseId]
    );

    return success(res, 'House bookers fetched', rows);
  } catch (error) {
    next(error);
  }
}

// GET /bookings/:id/route - Route directions from booker to house
async function getBookingRoute(req, res, next) {
  try {
    const bookingId = parseInt(req.params.id, 10);

    const [rows] = await db.query(
      `SELECT 
        b.id, b.share_location, b.booker_lat, b.booker_lng,
        u.full_name AS booker_name,
        h.id AS house_id, h.title AS house_title, h.address_text, h.landlord_id,
        ST_X(h.location) AS house_lng,
        ST_Y(h.location) AS house_lat
       FROM bookings b
       JOIN houses h ON b.house_id = h.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ? LIMIT 1`,
      [bookingId]
    );

    if (rows.length === 0) {
      return notFound(res, 'Booking record not found');
    }

    const record = rows[0];

    // Only house landlord or admin can access directions
    if (req.user.role !== 'admin' && record.landlord_id !== req.user.id) {
      return forbidden(res, 'Only the house holder can view booker navigation directions.');
    }

    if (!record.share_location || !record.booker_lat || !record.booker_lng) {
      return badRequest(res, 'The booker did not share their live location coordinates.');
    }

    const startLat = parseFloat(record.booker_lat);
    const startLng = parseFloat(record.booker_lng);
    const endLat = parseFloat(record.house_lat);
    const endLng = parseFloat(record.house_lng);

    const routeData = await spatialService.getDirections(startLat, startLng, endLat, endLng);

    return success(res, 'Route calculated successfully', {
      booker: {
        name: record.booker_name,
        coordinates: [startLat, startLng],
      },
      house: {
        id: record.house_id,
        title: record.house_title,
        address: record.address_text,
        coordinates: [endLat, endLng],
      },
      route: routeData,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /bookings/:id/status - Update booking status
async function updateBookingStatus(req, res, next) {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { status } = req.body; // 'confirmed', 'cancelled', 'deal_completed'

    if (!['pending', 'confirmed', 'cancelled', 'deal_completed'].includes(status)) {
      return badRequest(res, 'Invalid booking status');
    }

    const [rows] = await db.query(
      `SELECT b.id, b.user_id, b.house_id, h.landlord_id, h.title AS house_title
       FROM bookings b
       JOIN houses h ON b.house_id = h.id
       WHERE b.id = ? LIMIT 1`,
      [bookingId]
    );

    if (rows.length === 0) {
      return notFound(res, 'Booking not found');
    }

    const booking = rows[0];

    // Only landlord or admin can confirm/complete
    if (req.user.role !== 'admin' && booking.landlord_id !== req.user.id && booking.user_id !== req.user.id) {
      return forbidden(res, 'Unauthorized to modify this booking');
    }

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);

    // If deal completed, also mark the house deal_completed
    if (status === 'deal_completed') {
      await db.query("UPDATE houses SET status = 'deal_completed' WHERE id = ?", [booking.house_id]);
    }

    // Send notification to the booker
    let notifTitle = `Booking ${status.toUpperCase()}`;
    let notifBody = `Your booking for "${booking.house_title}" has been updated to "${status}".`;
    if (status === 'confirmed') {
      notifTitle = 'Booking Confirmed! 🎉';
      notifBody = `The house holder has confirmed your booking for "${booking.house_title}". Please coordinate move-in details.`;
    }

    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, ?, ?, ?, '/dashboard')`,
      [booking.user_id, `booking_${status}`, notifTitle, notifBody]
    );

    return success(res, `Booking status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getHouseBookers,
  getBookingRoute,
  updateBookingStatus,
};
