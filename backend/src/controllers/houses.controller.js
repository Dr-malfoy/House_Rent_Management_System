const db = require('../config/db');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

// GET /houses - Public catalog with filters and pagination
async function getAllHouses(req, res, next) {
  try {
    const {
      division,
      district,
      area,
      min_rent,
      max_rent,
      bedrooms,
      bathrooms,
      property_type_id,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sql = `
      SELECT 
        h.id,
        h.landlord_id,
        h.property_type_id,
        h.title,
        h.description,
        h.address_text,
        h.division,
        h.district,
        h.area_name,
        h.city,
        h.rent_amount,
        h.security_deposit,
        h.bedrooms,
        h.bathrooms,
        h.size_sqft,
        h.floor,
        h.cover_image,
        h.is_featured,
        h.status,
        h.created_at,
        pt.name AS property_type_name,
        u.full_name AS landlord_name,
        u.phone AS landlord_phone,
        ST_X(h.location) AS longitude,
        ST_Y(h.location) AS latitude
      FROM houses h
      LEFT JOIN property_types pt ON h.property_type_id = pt.id
      LEFT JOIN users u ON h.landlord_id = u.id
      WHERE h.status = 'approved'
    `;

    const params = [];

    if (division) {
      sql += ' AND h.division = ?';
      params.push(division);
    }
    if (district) {
      sql += ' AND h.district = ?';
      params.push(district);
    }
    if (area) {
      sql += ' AND h.area_name LIKE ?';
      params.push(`%${area}%`);
    }
    if (min_rent !== undefined && min_rent !== '') {
      sql += ' AND h.rent_amount >= ?';
      params.push(parseFloat(min_rent));
    }
    if (max_rent !== undefined && max_rent !== '') {
      sql += ' AND h.rent_amount <= ?';
      params.push(parseFloat(max_rent));
    }
    if (bedrooms) {
      sql += ' AND h.bedrooms >= ?';
      params.push(parseInt(bedrooms, 10));
    }
    if (bathrooms) {
      sql += ' AND h.bathrooms >= ?';
      params.push(parseInt(bathrooms, 10));
    }
    if (property_type_id) {
      sql += ' AND h.property_type_id = ?';
      params.push(parseInt(property_type_id, 10));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY h.rent_amount ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY h.rent_amount DESC';
        break;
      case 'size_desc':
        sql += ' ORDER BY h.size_sqft DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY h.created_at DESC';
        break;
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) AS total FROM houses h WHERE h.status = 'approved'`;
    const countParams = [];
    if (division) { countSql += ' AND h.division = ?'; countParams.push(division); }
    if (district) { countSql += ' AND h.district = ?'; countParams.push(district); }
    if (area) { countSql += ' AND h.area_name LIKE ?'; countParams.push(`%${area}%`); }
    if (min_rent !== undefined && min_rent !== '') { countSql += ' AND h.rent_amount >= ?'; countParams.push(parseFloat(min_rent)); }
    if (max_rent !== undefined && max_rent !== '') { countSql += ' AND h.rent_amount <= ?'; countParams.push(parseFloat(max_rent)); }
    if (bedrooms) { countSql += ' AND h.bedrooms >= ?'; countParams.push(parseInt(bedrooms, 10)); }
    if (bathrooms) { countSql += ' AND h.bathrooms >= ?'; countParams.push(parseInt(bathrooms, 10)); }
    if (property_type_id) { countSql += ' AND h.property_type_id = ?'; countParams.push(parseInt(property_type_id, 10)); }

    const [countRows] = await db.query(countSql, countParams);
    const total = countRows[0].total;

    const houses = rows.map((r) => ({
      ...r,
      rent_amount: parseFloat(r.rent_amount),
      security_deposit: parseFloat(r.security_deposit),
      coordinates: { lat: r.latitude, lng: r.longitude },
    }));

    return success(res, 'Houses fetched successfully', {
      houses,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total_pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /houses/featured - Featured houses for Home hero slider
async function getFeaturedHouses(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT 
        h.id, h.title, h.description, h.address_text, h.area_name, h.city,
        h.rent_amount, h.bedrooms, h.bathrooms, h.size_sqft, h.cover_image,
        pt.name AS property_type_name,
        ST_X(h.location) AS longitude,
        ST_Y(h.location) AS latitude
       FROM houses h
       LEFT JOIN property_types pt ON h.property_type_id = pt.id
       WHERE h.status = 'approved' AND h.is_featured = TRUE
       ORDER BY h.updated_at DESC
       LIMIT 8`
    );

    const houses = rows.map((r) => ({
      ...r,
      rent_amount: parseFloat(r.rent_amount),
      coordinates: { lat: r.latitude, lng: r.longitude },
    }));

    return success(res, 'Featured houses fetched', houses);
  } catch (error) {
    next(error);
  }
}

// GET /houses/ids - Static generator ID list
async function getHouseIds(req, res, next) {
  try {
    const [rows] = await db.query("SELECT id FROM houses WHERE status = 'approved' ORDER BY id ASC");
    return success(res, 'House IDs fetched', rows.map((r) => String(r.id)));
  } catch (error) {
    next(error);
  }
}

// GET /houses/:id - Single house details
async function getHouseById(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    if (isNaN(houseId)) {
      return badRequest(res, 'Invalid house ID');
    }

    const [rows] = await db.query(
      `SELECT 
        h.id, h.landlord_id, h.property_type_id, h.title, h.description,
        h.address_text, h.division, h.district, h.area_name, h.city,
        h.rent_amount, h.security_deposit, h.bedrooms, h.bathrooms,
        h.size_sqft, h.floor, h.rules, h.availability_date, h.cover_image,
        h.is_featured, h.status, h.created_at, h.updated_at,
        pt.name AS property_type_name,
        u.full_name AS landlord_name,
        u.phone AS landlord_phone,
        u.email AS landlord_email,
        u.nid_status AS landlord_nid_status,
        up.profile_photo_url AS landlord_photo,
        ST_X(h.location) AS longitude,
        ST_Y(h.location) AS latitude
       FROM houses h
       LEFT JOIN property_types pt ON h.property_type_id = pt.id
       LEFT JOIN users u ON h.landlord_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE h.id = ? LIMIT 1`,
      [houseId]
    );

    if (rows.length === 0) {
      return notFound(res, 'House not found');
    }

    const house = rows[0];

    // Fetch images gallery
    const [images] = await db.query(
      'SELECT id, image_url, is_cover, sort_order FROM house_images WHERE house_id = ? ORDER BY is_cover DESC, sort_order ASC, id ASC',
      [houseId]
    );

    // Fetch amenities
    const [amenities] = await db.query(
      `SELECT a.id, a.name 
       FROM house_amenities ha 
       JOIN amenities a ON ha.amenity_id = a.id 
       WHERE ha.house_id = ? ORDER BY a.name ASC`,
      [houseId]
    );

    // Check if favorited by logged-in user
    let isFavorited = false;
    let userHasBooked = false;
    if (req.user) {
      const [favs] = await db.query(
        'SELECT id FROM favorites WHERE user_id = ? AND house_id = ? LIMIT 1',
        [req.user.id, houseId]
      );
      isFavorited = favs.length > 0;

      const [bookings] = await db.query(
        'SELECT id, status FROM bookings WHERE user_id = ? AND house_id = ? LIMIT 1',
        [req.user.id, houseId]
      );
      userHasBooked = bookings.length > 0;
    }

    const result = {
      ...house,
      rent_amount: parseFloat(house.rent_amount),
      security_deposit: parseFloat(house.security_deposit),
      coordinates: { lat: house.latitude, lng: house.longitude },
      images: images.length > 0 ? images : [{ id: 0, image_url: house.cover_image, is_cover: true }],
      amenities,
      is_favorited: isFavorited,
      user_has_booked: userHasBooked,
      is_owner: req.user ? req.user.id === house.landlord_id : false,
    };

    return success(res, 'House details fetched', result);
  } catch (error) {
    next(error);
  }
}

// POST /houses - Create new house (Owner or Admin; requires verified NID)
async function createHouse(req, res, next) {
  try {
    const {
      title,
      description,
      address_text,
      division = 'Dhaka',
      district = 'Dhaka',
      area_name,
      city = 'Dhaka',
      rent_amount,
      security_deposit = 0,
      bedrooms = 1,
      bathrooms = 1,
      size_sqft = 500,
      floor = '2nd',
      rules,
      availability_date,
      property_type_id,
      amenities = [],
      cover_image,
      images = [],
    } = req.body;

    // Determine coordinates (from map pin or geocode middleware)
    let lat = req.body.lat !== undefined ? parseFloat(req.body.lat) : req.geo?.lat;
    let lng = req.body.lng !== undefined ? parseFloat(req.body.lng) : req.geo?.lng;

    if (isNaN(lat) || isNaN(lng)) {
      return badRequest(res, 'Exact map coordinates (latitude and longitude) are required. Please drop a pin on the map.');
    }

    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    // Insert house record with ST_GeomFromText POINT(longitude latitude)
    const [result] = await db.query(
      `INSERT INTO houses (
        landlord_id, property_type_id, title, description, address_text,
        division, district, area_name, city, location,
        rent_amount, security_deposit, bedrooms, bathrooms, size_sqft, floor,
        rules, availability_date, cover_image, is_featured, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ST_GeomFromText(?, 4326),
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, FALSE, ?
      )`,
      [
        req.user.id,
        property_type_id || null,
        title,
        description,
        address_text,
        division,
        district,
        area_name,
        city,
        `POINT(${lng} ${lat})`,
        parseFloat(rent_amount),
        parseFloat(security_deposit) || 0,
        parseInt(bedrooms, 10),
        parseInt(bathrooms, 10),
        parseInt(size_sqft, 10),
        floor,
        rules || null,
        availability_date || null,
        cover_image || (images[0] || null),
        initialStatus,
      ]
    );

    const houseId = result.insertId;

    // Insert amenities if provided
    if (Array.isArray(amenities) && amenities.length > 0) {
      const amenityValues = amenities.map((aid) => [houseId, parseInt(aid, 10)]);
      await db.query(
        'INSERT IGNORE INTO house_amenities (house_id, amenity_id) VALUES ?',
        [amenityValues]
      );
    }

    // Insert gallery images if provided
    if (Array.isArray(images) && images.length > 0) {
      const imageValues = images.map((imgUrl, idx) => [
        houseId,
        imgUrl,
        idx === 0,
        idx + 1,
      ]);
      await db.query(
        'INSERT INTO house_images (house_id, image_url, is_cover, sort_order) VALUES ?',
        [imageValues]
      );
    }

    // If user's role is 'user', upgrade them to 'house_holder' or notify
    if (req.user.role === 'user') {
      await db.query("UPDATE users SET role = 'house_holder' WHERE id = ?", [req.user.id]);
    }

    // Notify user
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'house_created', 'House Post Submitted!', 'Your house listing is under review and will appear publicly once approved by admin.', '/host')`,
      [req.user.id]
    );

    return created(res, 'House posted successfully! It will be reviewed by admin shortly.', {
      house_id: houseId,
      status: initialStatus,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /houses/:id - Update house
async function updateHouse(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const [existing] = await db.query('SELECT landlord_id FROM houses WHERE id = ?', [houseId]);
    if (existing.length === 0) return notFound(res, 'House not found');

    if (req.user.role !== 'admin' && existing[0].landlord_id !== req.user.id) {
      return forbidden(res, 'You can only edit your own listings');
    }

    const {
      title,
      description,
      address_text,
      division,
      district,
      area_name,
      city,
      rent_amount,
      security_deposit,
      bedrooms,
      bathrooms,
      size_sqft,
      floor,
      rules,
      availability_date,
      property_type_id,
      cover_image,
      lat,
      lng,
      amenities,
    } = req.body;

    let locationClause = '';
    const params = [
      title,
      description,
      address_text,
      division,
      district,
      area_name,
      city,
      rent_amount,
      security_deposit,
      bedrooms,
      bathrooms,
      size_sqft,
      floor,
      rules,
      availability_date,
      property_type_id,
      cover_image,
    ];

    if (lat !== undefined && lng !== undefined) {
      locationClause = ', location = ST_GeomFromText(?, 4326)';
      params.push(`POINT(${parseFloat(lng)} ${parseFloat(lat)})`);
    }

    params.push(houseId);

    await db.query(
      `UPDATE houses SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        address_text = COALESCE(?, address_text),
        division = COALESCE(?, division),
        district = COALESCE(?, district),
        area_name = COALESCE(?, area_name),
        city = COALESCE(?, city),
        rent_amount = COALESCE(?, rent_amount),
        security_deposit = COALESCE(?, security_deposit),
        bedrooms = COALESCE(?, bedrooms),
        bathrooms = COALESCE(?, bathrooms),
        size_sqft = COALESCE(?, size_sqft),
        floor = COALESCE(?, floor),
        rules = COALESCE(?, rules),
        availability_date = COALESCE(?, availability_date),
        property_type_id = COALESCE(?, property_type_id),
        cover_image = COALESCE(?, cover_image)
        ${locationClause}
      WHERE id = ?`,
      params
    );

    // Update amenities if provided
    if (Array.isArray(amenities)) {
      await db.query('DELETE FROM house_amenities WHERE house_id = ?', [houseId]);
      if (amenities.length > 0) {
        const amenityValues = amenities.map((aid) => [houseId, parseInt(aid, 10)]);
        await db.query('INSERT IGNORE INTO house_amenities (house_id, amenity_id) VALUES ?', [amenityValues]);
      }
    }

    return success(res, 'House listing updated successfully');
  } catch (error) {
    next(error);
  }
}

// DELETE /houses/:id - Delete house
async function deleteHouse(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const [existing] = await db.query('SELECT landlord_id FROM houses WHERE id = ?', [houseId]);
    if (existing.length === 0) return notFound(res, 'House not found');

    if (req.user.role !== 'admin' && existing[0].landlord_id !== req.user.id) {
      return forbidden(res, 'You can only delete your own listings');
    }

    await db.query('DELETE FROM houses WHERE id = ?', [houseId]);
    return success(res, 'House deleted successfully');
  } catch (error) {
    next(error);
  }
}

// PATCH /houses/:id/deal-complete - Mark deal completed & hide from public view
async function completeDeal(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const [existing] = await db.query('SELECT landlord_id, title FROM houses WHERE id = ?', [houseId]);
    if (existing.length === 0) return notFound(res, 'House not found');

    if (req.user.role !== 'admin' && existing[0].landlord_id !== req.user.id) {
      return forbidden(res, 'You can only mark deal complete for your own listings');
    }

    // Set status to deal_completed so it disappears from public catalog
    await db.query("UPDATE houses SET status = 'deal_completed' WHERE id = ?", [houseId]);

    // Also update associated bookings to deal_completed
    await db.query(
      "UPDATE bookings SET status = 'deal_completed' WHERE house_id = ? AND status = 'confirmed'",
      [houseId]
    );

    return success(res, 'Deal completed! Listing has been removed from public search and marked completed.');
  } catch (error) {
    next(error);
  }
}

// PATCH /houses/:id/status - Publish / Unpublish
async function updateHouseStatus(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const { status } = req.body; // 'unpublished' or 'approved'

    const [existing] = await db.query('SELECT landlord_id FROM houses WHERE id = ?', [houseId]);
    if (existing.length === 0) return notFound(res, 'House not found');

    if (req.user.role !== 'admin' && existing[0].landlord_id !== req.user.id) {
      return forbidden(res, 'You can only change status of your own listings');
    }

    await db.query('UPDATE houses SET status = ? WHERE id = ?', [status, houseId]);
    return success(res, `Listing status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

// POST /houses/:id/images - Upload photos
async function uploadImages(req, res, next) {
  try {
    const houseId = parseInt(req.params.id, 10);
    const [existing] = await db.query('SELECT landlord_id, cover_image FROM houses WHERE id = ?', [houseId]);
    if (existing.length === 0) return notFound(res, 'House not found');

    if (req.user.role !== 'admin' && existing[0].landlord_id !== req.user.id) {
      return forbidden(res, 'Unauthorized to add photos to this house');
    }

    if (!req.files || req.files.length === 0) {
      return badRequest(res, 'No image files provided');
    }

    const uploadedUrls = req.files.map((f) => `/uploads/houses/${f.filename}`);

    const imageValues = uploadedUrls.map((url, idx) => [
      houseId,
      url,
      !existing[0].cover_image && idx === 0,
      idx + 1,
    ]);

    await db.query(
      'INSERT INTO house_images (house_id, image_url, is_cover, sort_order) VALUES ?',
      [imageValues]
    );

    if (!existing[0].cover_image && uploadedUrls.length > 0) {
      await db.query('UPDATE houses SET cover_image = ? WHERE id = ?', [uploadedUrls[0], houseId]);
    }

    return success(res, 'Images uploaded successfully', { images: uploadedUrls });
  } catch (error) {
    next(error);
  }
}

// GET /me/houses - Landlord / User view own posted houses
async function getMyHouses(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT 
        h.id, h.title, h.address_text, h.area_name, h.rent_amount,
        h.bedrooms, h.bathrooms, h.size_sqft, h.cover_image, h.status, h.is_featured,
        h.created_at,
        ST_X(h.location) AS longitude,
        ST_Y(h.location) AS latitude,
        (SELECT COUNT(*) FROM bookings b WHERE b.house_id = h.id) AS total_bookings,
        (SELECT COUNT(*) FROM bookings b WHERE b.house_id = h.id AND b.status = 'pending') AS pending_bookings
       FROM houses h
       WHERE h.landlord_id = ?
       ORDER BY h.created_at DESC`,
      [req.user.id]
    );

    const houses = rows.map((r) => ({
      ...r,
      rent_amount: parseFloat(r.rent_amount),
      coordinates: { lat: r.latitude, lng: r.longitude },
    }));

    return success(res, 'Your posted houses fetched', houses);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllHouses,
  getFeaturedHouses,
  getHouseIds,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  completeDeal,
  updateHouseStatus,
  uploadImages,
  getMyHouses,
};
