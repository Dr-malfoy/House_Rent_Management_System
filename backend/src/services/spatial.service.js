const db = require('../config/db');
const { computeBoundingBox, formatDistance, haversineDistanceMeters } = require('../utils/distance');
const axios = require('axios');

/**
 * Spatial Nearby Search Service using MySQL SPATIAL INDEX + ST_Distance_Sphere
 */
async function searchNearby({
  lat,
  lng,
  radius = 1000,
  minRent,
  maxRent,
  bedrooms,
  bathrooms,
  propertyTypeId,
  division,
  district,
  area,
  limit = 50,
  offset = 0,
}) {
  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  const radiusMeters = parseInt(radius, 10);

  // Validate allowed radiuses (strictly 500, 1000, or 2000)
  if (![500, 1000, 2000].includes(radiusMeters)) {
    throw new Error('Search radius must be 500, 1000, or 2000 meters');
  }

  // 1. Compute bounding box polygon for MBR spatial index prefilter
  const bbox = computeBoundingBox(centerLat, centerLng, radiusMeters);

  // 2. Build parameterized query
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
      ST_Y(h.location) AS latitude,
      ROUND(ST_Distance_Sphere(h.location, POINT(?, ?))) AS distance_m
    FROM houses h
    LEFT JOIN property_types pt ON h.property_type_id = pt.id
    LEFT JOIN users u ON h.landlord_id = u.id
    WHERE h.status = 'approved'
      AND MBRContains(ST_GeomFromText(?), h.location)
      AND ST_Distance_Sphere(h.location, POINT(?, ?)) <= ?
  `;

  const params = [
    centerLng,
    centerLat,
    bbox.wktPolygon,
    centerLng,
    centerLat,
    radiusMeters,
  ];

  if (minRent !== undefined && minRent !== null && minRent !== '') {
    sql += ' AND h.rent_amount >= ?';
    params.push(parseFloat(minRent));
  }

  if (maxRent !== undefined && maxRent !== null && maxRent !== '') {
    sql += ' AND h.rent_amount <= ?';
    params.push(parseFloat(maxRent));
  }

  if (bedrooms !== undefined && bedrooms !== null && bedrooms !== '') {
    sql += ' AND h.bedrooms >= ?';
    params.push(parseInt(bedrooms, 10));
  }

  if (bathrooms !== undefined && bathrooms !== null && bathrooms !== '') {
    sql += ' AND h.bathrooms >= ?';
    params.push(parseInt(bathrooms, 10));
  }

  if (propertyTypeId) {
    sql += ' AND h.property_type_id = ?';
    params.push(parseInt(propertyTypeId, 10));
  }

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

  sql += ' ORDER BY distance_m ASC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const [rows] = await db.query(sql, params);

  // Format response rows with human readable distance
  const results = rows.map((row) => ({
    ...row,
    rent_amount: parseFloat(row.rent_amount),
    security_deposit: parseFloat(row.security_deposit),
    distance_text: formatDistance(row.distance_m),
    coordinates: {
      lat: row.latitude,
      lng: row.longitude,
    },
  }));

  return {
    center: { lat: centerLat, lng: centerLng },
    radius_meters: radiusMeters,
    total_found: results.length,
    houses: results,
  };
}

/**
 * Fetch route directions between two points using OSRM open routing service
 * Falls back to direct geodesic path if network unavailable.
 */
async function getDirections(startLat, startLng, endLat, endLng) {
  const directDistance = haversineDistanceMeters(startLat, startLng, endLat, endLng);

  try {
    // OSRM public routing API format: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await axios.get(osrmUrl, { timeout: 6000 });

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        success: true,
        source: 'OSRM',
        distance_meters: Math.round(route.distance),
        duration_seconds: Math.round(route.duration),
        duration_text: `${Math.round(route.duration / 60)} mins`,
        distance_text: formatDistance(route.distance),
        coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), // Leaflet expects [lat, lng]
        steps: (route.legs[0]?.steps || []).map((step) => ({
          instruction: step.maneuver?.type || 'Drive',
          name: step.name || 'Unnamed road',
          distance_meters: Math.round(step.distance),
        })),
      };
    }
  } catch (error) {
    console.warn('[Routing] OSRM route fetch failed, using direct line fallback:', error.message);
  }

  // Fallback: direct line with waypoints
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  return {
    success: true,
    source: 'geodesic_fallback',
    distance_meters: directDistance,
    duration_seconds: Math.round((directDistance / 1000 / 25) * 3600), // ~25 km/h avg city speed
    duration_text: `${Math.max(5, Math.round((directDistance / 1000 / 25) * 60))} mins`,
    distance_text: formatDistance(directDistance),
    coordinates: [
      [startLat, startLng],
      [midLat, midLng],
      [endLat, endLng],
    ],
    steps: [
      { instruction: 'Start from origin', name: 'Start location', distance_meters: 0 },
      { instruction: 'Proceed towards destination', name: 'Main Road', distance_meters: Math.round(directDistance / 2) },
      { instruction: 'Arrive at house', name: 'Destination', distance_meters: directDistance },
    ],
  };
}

module.exports = {
  searchNearby,
  getDirections,
};
