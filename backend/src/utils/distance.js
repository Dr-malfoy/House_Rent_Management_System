/**
 * Geospatial and Distance Helpers
 */

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

/**
 * Compute Haversine distance between two coordinates in meters
 */
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Format meters into human friendly text ("350 m away", "1.2 km away")
 */
function formatDistance(meters) {
  if (meters === null || meters === undefined) return '';
  if (meters < 1000) {
    return `${Math.round(meters)} m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
}

/**
 * Compute bounding box envelope (minLat, maxLat, minLng, maxLng, and WKT Polygon)
 * for a center (lat, lng) and radius in meters.
 */
function computeBoundingBox(lat, lng, radiusMeters) {
  const dLat = radiusMeters / 111320;
  const dLng = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));

  const minLat = lat - dLat;
  const maxLat = lat + dLat;
  const minLng = lng - dLng;
  const maxLng = lng + dLng;

  // WKT Polygon format: POLYGON((minLng minLat, maxLng minLat, maxLng maxLat, minLng maxLat, minLng minLat))
  const wktPolygon = `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    wktPolygon,
  };
}

module.exports = {
  EARTH_RADIUS_METERS,
  haversineDistanceMeters,
  formatDistance,
  computeBoundingBox,
};
