const axios = require('axios');
const db = require('../config/db');
const config = require('../config/env');

let lastRequestTime = 0;

/**
 * Throttle helper to respect OpenStreetMap 1 request/second policy
 */
async function enforceRateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    const waitMs = 1100 - elapsed;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastRequestTime = Date.now();
}

/**
 * Geocode text query using Nominatim with DB caching
 */
async function geocode(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Query string is required for geocoding');
  }

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Check cache first
  const [cached] = await db.query(
    'SELECT latitude, longitude, display_name FROM geocode_cache WHERE query_text = ? LIMIT 1',
    [normalizedQuery]
  );

  if (cached.length > 0) {
    return {
      lat: parseFloat(cached[0].latitude),
      lng: parseFloat(cached[0].longitude),
      displayName: cached[0].display_name,
      cached: true,
    };
  }

  // 2. Enforce 1 req/sec throttle
  await enforceRateLimit();

  // 3. Call Nominatim API
  try {
    const response = await axios.get(`${config.nominatim.baseUrl}/search`, {
      params: {
        q: `${query}, Bangladesh`,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': config.nominatim.userAgent,
      },
      timeout: 8000,
    });

    if (!response.data || response.data.length === 0) {
      // Fallback query without country append if nothing found
      const fallbackRes = await axios.get(`${config.nominatim.baseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': config.nominatim.userAgent,
        },
        timeout: 8000,
      });

      if (!fallbackRes.data || fallbackRes.data.length === 0) {
        throw new Error(`Location not found for: "${query}"`);
      }

      response.data = fallbackRes.data;
    }

    const first = response.data[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    const displayName = first.display_name;

    // 4. Save to cache
    await db.query(
      `INSERT INTO geocode_cache (query_text, latitude, longitude, display_name)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude), display_name = VALUES(display_name)`,
      [normalizedQuery, lat, lng, displayName]
    );

    return {
      lat,
      lng,
      displayName,
      cached: false,
    };
  } catch (error) {
    console.error('[Nominatim] Geocoding request failed:', error.message);
    throw new Error(`Geocoding service unavailable or location not found: ${error.message}`);
  }
}

/**
 * Reverse geocode latitude and longitude to human address
 */
async function reverseGeocode(lat, lng) {
  await enforceRateLimit();

  try {
    const response = await axios.get(`${config.nominatim.baseUrl}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json',
      },
      headers: {
        'User-Agent': config.nominatim.userAgent,
      },
      timeout: 8000,
    });

    if (response.data && response.data.display_name) {
      return {
        displayName: response.data.display_name,
        address: response.data.address || {},
      };
    }
    return { displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
  } catch (error) {
    console.error('[Nominatim] Reverse geocoding failed:', error.message);
    return { displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
  }
}

module.exports = {
  geocode,
  reverseGeocode,
};
