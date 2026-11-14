const db = require('../config/db');
const { success } = require('../utils/response');

async function getDivisions(req, res, next) {
  try {
    const [rows] = await db.query('SELECT DISTINCT division FROM bd_locations ORDER BY division ASC');
    return success(res, 'Divisions fetched', rows.map((r) => r.division));
  } catch (error) {
    next(error);
  }
}

async function getDistricts(req, res, next) {
  try {
    const { division } = req.query;
    let sql = 'SELECT DISTINCT district FROM bd_locations';
    const params = [];
    if (division) {
      sql += ' WHERE division = ?';
      params.push(division);
    }
    sql += ' ORDER BY district ASC';
    const [rows] = await db.query(sql, params);
    return success(res, 'Districts fetched', rows.map((r) => r.district));
  } catch (error) {
    next(error);
  }
}

async function getAreas(req, res, next) {
  try {
    const { division, district } = req.query;
    let sql = 'SELECT DISTINCT area FROM bd_locations WHERE 1=1';
    const params = [];
    if (division) {
      sql += ' AND division = ?';
      params.push(division);
    }
    if (district) {
      sql += ' AND district = ?';
      params.push(district);
    }
    sql += ' ORDER BY area ASC';
    const [rows] = await db.query(sql, params);
    return success(res, 'Areas fetched', rows.map((r) => r.area));
  } catch (error) {
    next(error);
  }
}

async function getAllLocationsTree(req, res, next) {
  try {
    const [rows] = await db.query('SELECT division, district, area FROM bd_locations ORDER BY division, district, area');
    
    // Group into hierarchical tree
    const tree = {};
    for (const r of rows) {
      if (!tree[r.division]) tree[r.division] = {};
      if (!tree[r.division][r.district]) tree[r.division][r.district] = [];
      tree[r.division][r.district].push(r.area);
    }

    return success(res, 'Location hierarchy tree fetched', tree);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDivisions,
  getDistricts,
  getAreas,
  getAllLocationsTree,
};
