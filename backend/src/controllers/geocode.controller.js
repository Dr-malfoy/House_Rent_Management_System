const nominatimService = require('../services/nominatim.service');
const { success, badRequest } = require('../utils/response');

async function geocodeAddress(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return badRequest(res, 'Query parameter "q" is required');
    }

    const result = await nominatimService.geocode(q.trim());
    return success(res, 'Geocode suggestion fetched', result);
  } catch (error) {
    next(error);
  }
}

async function reverseGeocodeCoords(req, res, next) {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return badRequest(res, 'Latitude and Longitude parameters are required');
    }

    const result = await nominatimService.reverseGeocode(parseFloat(lat), parseFloat(lng));
    return success(res, 'Reverse geocode fetched', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  geocodeAddress,
  reverseGeocodeCoords,
};
