const db = require('../config/db');
const { success, created } = require('../utils/response');

async function getFavorites(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT 
        f.id AS favorite_id, f.created_at AS favorited_at,
        h.id, h.title, h.address_text, h.area_name, h.city, h.rent_amount,
        h.bedrooms, h.bathrooms, h.size_sqft, h.cover_image, h.status,
        ST_X(h.location) AS longitude,
        ST_Y(h.location) AS latitude
       FROM favorites f
       JOIN houses h ON f.house_id = h.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const houses = rows.map((r) => ({
      ...r,
      rent_amount: parseFloat(r.rent_amount),
      coordinates: { lat: r.latitude, lng: r.longitude },
    }));

    return success(res, 'Favorites fetched', houses);
  } catch (error) {
    next(error);
  }
}

async function addFavorite(req, res, next) {
  try {
    const houseId = parseInt(req.params.houseId, 10);
    await db.query(
      'INSERT IGNORE INTO favorites (user_id, house_id) VALUES (?, ?)',
      [req.user.id, houseId]
    );
    return created(res, 'Added to favorites');
  } catch (error) {
    next(error);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const houseId = parseInt(req.params.houseId, 10);
    await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND house_id = ?',
      [req.user.id, houseId]
    );
    return success(res, 'Removed from favorites');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
