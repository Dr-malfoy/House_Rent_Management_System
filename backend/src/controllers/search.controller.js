const spatialService = require('../services/spatial.service');
const nominatimService = require('../services/nominatim.service');
const { success, badRequest } = require('../utils/response');

async function nearbySearch(req, res, next) {
  try {
    let { lat, lng, q, radius = 1000, min_rent, max_rent, bedrooms, bathrooms, type, division, district, area } = req.query;

    const parsedRadius = parseInt(radius, 10);
    if (![500, 1000, 2000].includes(parsedRadius)) {
      return badRequest(res, 'Search radius must be 500 or 1000 meters (or 2000 meters max).');
    }

    // If query string q provided but no lat/lng, geocode center
    if ((lat === undefined || lng === undefined || lat === '' || lng === '') && q) {
      const geo = await nominatimService.geocode(q);
      lat = geo.lat;
      lng = geo.lng;
    }

    if (lat === undefined || lng === undefined || lat === '' || lng === '') {
      // Default to central Dhaka if neither coordinates nor query was passed
      lat = 23.8103;
      lng = 90.4125;
    }

    const searchResult = await spatialService.searchNearby({
      lat,
      lng,
      radius: parsedRadius,
      minRent: min_rent,
      maxRent: max_rent,
      bedrooms,
      bathrooms,
      propertyTypeId: type,
      division,
      district,
      area,
    });

    return success(res, `Found ${searchResult.total_found} houses within ${parsedRadius}m`, searchResult);
  } catch (error) {
    next(error);
  }
}

async function getDirections(req, res, next) {
  try {
    const { from_lat, from_lng, to_lat, to_lng } = req.query;

    if (!from_lat || !from_lng || !to_lat || !to_lng) {
      return badRequest(res, 'from_lat, from_lng, to_lat, and to_lng query parameters are required.');
    }

    const route = await spatialService.getDirections(
      parseFloat(from_lat),
      parseFloat(from_lng),
      parseFloat(to_lat),
      parseFloat(to_lng)
    );

    return success(res, 'Directions calculated successfully', route);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  nearbySearch,
  getDirections,
};
