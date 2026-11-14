/**
 * Spatial Nearby Search Unit & Integration Test
 * Verifies 500m vs 1000m radius logic, distance sorting, and budget filtering.
 */

const assert = require('assert');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const spatialService = require('../src/services/spatial.service');

async function runSpatialTests() {
  console.log('--- STARTING SPATIAL SEARCH AUTOMATED TESTS ---');

  // Center point: Uttara Sector 10 (Lat: 23.8759, Lng: 90.3980)
  const center = { lat: 23.8759, lng: 90.3980 };

  console.log(`\nTest Case 1: Search Radius 500 meters at (${center.lat}, ${center.lng})`);
  const res500 = await spatialService.searchNearby({
    lat: center.lat,
    lng: center.lng,
    radius: 500,
  });

  console.log(`  -> Found ${res500.total_found} houses within 500m.`);
  assert(Array.isArray(res500.houses), 'Result houses should be an array');
  
  // Verify all distances are <= 500m
  for (const h of res500.houses) {
    assert(
      h.distance_m <= 500,
      `House #${h.id} distance (${h.distance_m}m) exceeds 500m limit!`
    );
  }

  // Verify sorting: nearest first
  for (let i = 1; i < res500.houses.length; i++) {
    assert(
      res500.houses[i].distance_m >= res500.houses[i - 1].distance_m,
      'Houses must be ordered by distance ascending'
    );
  }
  console.log('  [PASS] All houses <= 500m and ordered nearest first.');

  console.log(`\nTest Case 2: Search Radius 1000 meters at (${center.lat}, ${center.lng})`);
  const res1000 = await spatialService.searchNearby({
    lat: center.lat,
    lng: center.lng,
    radius: 1000,
  });

  console.log(`  -> Found ${res1000.total_found} houses within 1000m.`);
  assert(
    res1000.total_found >= res500.total_found,
    `1000m radius (${res1000.total_found}) must find at least as many houses as 500m (${res500.total_found})`
  );

  for (const h of res1000.houses) {
    assert(
      h.distance_m <= 1000,
      `House #${h.id} distance (${h.distance_m}m) exceeds 1000m limit!`
    );
  }
  console.log('  [PASS] 1000m search correctly expands result set and stays within 1000m.');

  console.log('\nTest Case 3: Combined Radius (1000m) + Budget Filter (Min: 20000, Max: 35000)');
  const resBudget = await spatialService.searchNearby({
    lat: center.lat,
    lng: center.lng,
    radius: 1000,
    minRent: 20000,
    maxRent: 35000,
  });

  console.log(`  -> Found ${resBudget.total_found} houses within budget and 1000m radius.`);
  for (const h of resBudget.houses) {
    assert(
      h.rent_amount >= 20000 && h.rent_amount <= 35000,
      `House #${h.id} rent (৳${h.rent_amount}) is outside budget filter [20000, 35000]!`
    );
  }
  console.log('  [PASS] Combined radius and budget filter accurately applied.');

  console.log('\nTest Case 4: Invalid Radius Rejection');
  let rejected = false;
  try {
    await spatialService.searchNearby({
      lat: center.lat,
      lng: center.lng,
      radius: 750, // Not allowed
    });
  } catch (err) {
    rejected = true;
    console.log(`  -> Correctly rejected radius 750m with error: "${err.message}"`);
  }
  assert(rejected, 'Invalid radius (750m) must be rejected');
  console.log('  [PASS] Invalid radius rejected.');

  console.log('\n--- ALL SPATIAL TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runSpatialTests().catch((err) => {
  console.error('[FAIL] Spatial test error:', err);
  process.exit(1);
});
