const nominatimService = require('../services/nominatim.service');
const { unprocessable } = require('../utils/response');

async function geocodeMiddleware(req, res, next) {
  try {
    const lat = req.body.lat || req.query.lat;
    const lng = req.body.lng || req.query.lng;
    const address = req.body.address_text || req.body.address || req.query.q || req.query.address;

    // If coordinates already provided, parse and attach
    if (lat !== undefined && lng !== undefined && lat !== '' && lng !== '') {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return unprocessable(res, 'Coordinates must be valid numbers');
      }

      req.geo = {
        lat: parsedLat,
        lng: parsedLng,
        displayName: address || `${parsedLat}, ${parsedLng}`,
      };
      return next();
    }

    // If address text is provided, geocode it
    if (address && typeof address === 'string' && address.trim()) {
      try {
        const geoResult = await nominatimService.geocode(address.trim());
        req.geo = geoResult;
        return next();
      } catch (err) {
        return unprocessable(
          res,
          `Could not geocode address: "${address}". Please select location on the map or refine your query.`,
          [err.message]
        );
      }
    }

    // Neither coordinates nor address was provided
    req.geo = null;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = geocodeMiddleware;
