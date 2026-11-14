/**
 * Spatial Performance Benchmark Generator
 * Inserts 10,000+ realistic listings distributed across Dhaka Metropolitan Area
 * and benchmarks the MBRContains + ST_Distance_Sphere proximity query.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_house_rent',
};

// Dhaka bounding box approximately:
// Lat: 23.68 to 23.90 (North-South)
// Lng: 90.33 to 90.46 (East-West)
const AREAS = [
  { name: 'Uttara', lat: 23.872, lng: 90.398 },
  { name: 'Mirpur', lat: 23.805, lng: 90.365 },
  { name: 'Dhanmondi', lat: 23.746, lng: 90.374 },
  { name: 'Gulshan', lat: 23.792, lng: 90.416 },
  { name: 'Banani', lat: 23.793, lng: 90.404 },
  { name: 'Bashundhara', lat: 23.816, lng: 90.431 },
  { name: 'Mohakhali', lat: 23.778, lng: 90.398 },
  { name: 'Badda', lat: 23.782, lng: 90.426 },
  { name: 'Mohammadpur', lat: 23.759, lng: 90.362 },
];

async function generateBenchmarkData(totalCount = 10000) {
  console.log(`[Benchmark] Connecting to database...`);
  const conn = await mysql.createConnection(config);

  console.log(`[Benchmark] Generating ${totalCount} sample listings...`);
  const batchSize = 1000;
  let inserted = 0;

  const startTime = Date.now();

  for (let i = 0; i < totalCount; i += batchSize) {
    const values = [];
    const count = Math.min(batchSize, totalCount - i);

    for (let j = 0; j < count; j++) {
      const idx = i + j + 1;
      const area = AREAS[idx % AREAS.length];
      
      // Jitter coordinates within ~1.5 km of area center
      const latJitter = (Math.random() - 0.5) * 0.025;
      const lngJitter = (Math.random() - 0.5) * 0.025;
      const lat = parseFloat((area.lat + latJitter).toFixed(6));
      const lng = parseFloat((area.lng + lngJitter).toFixed(6));

      const beds = (idx % 4) + 1;
      const baths = Math.max(1, beds - 1);
      const rent = 10000 + (idx % 60) * 1000;
      const deposit = rent * 2;
      const size = 500 + beds * 350;

      values.push(`(
        2,
        1,
        'Benchmark Listing #${idx} in ${area.name}',
        'High performance test property generated for spatial indexing benchmark.',
        'Road ${(idx % 30) + 1}, Block ${(idx % 8) + 1}, ${area.name}, Dhaka',
        'Dhaka',
        'Dhaka',
        '${area.name}',
        'Dhaka',
        ST_GeomFromText('POINT(${lng} ${lat})', 4326),
        ${rent},
        ${deposit},
        ${beds},
        ${baths},
        ${size},
        '${(idx % 10) + 1}th',
        'Standard residential rules.',
        'approved'
      )`);
    }

    const sql = `INSERT INTO houses (
      landlord_id, property_type_id, title, description, address_text,
      division, district, area_name, city, location,
      rent_amount, security_deposit, bedrooms, bathrooms, size_sqft,
      floor, rules, status
    ) VALUES ${values.join(',')};`;

    await conn.query(sql);
    inserted += count;
    process.stdout.write(`\r[Benchmark] Inserted ${inserted} / ${totalCount} records...`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n[Benchmark] Successfully inserted ${inserted} listings in ${durationSec}s!`);

  // Run Benchmark Queries
  console.log('\n--- EXECUTING PERFORMANCE BENCHMARK ---');

  const testCenter = { lat: 23.875, lng: 90.398 }; // Uttara center
  for (const radius of [500, 1000]) {
    const dLat = radius / 111320;
    const dLng = radius / (111320 * Math.cos(testCenter.lat * (Math.PI / 180)));
    const minLat = testCenter.lat - dLat;
    const maxLat = testCenter.lat + dLat;
    const minLng = testCenter.lng - dLng;
    const maxLng = testCenter.lng + dLng;

    const bboxWkt = `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;

    const querySql = `
      SELECT 
        h.id, h.title, h.rent_amount, h.area_name,
        ROUND(ST_Distance_Sphere(h.location, POINT(?, ?))) AS distance_m
      FROM houses h
      WHERE h.status = 'approved'
        AND MBRContains(ST_GeomFromText(?, 4326), h.location)
        AND ST_Distance_Sphere(h.location, POINT(?, ?)) <= ?
      ORDER BY distance_m ASC
    `;

    // Explain query
    const [explainRows] = await conn.query(`EXPLAIN ${querySql}`, [
      testCenter.lng, testCenter.lat,
      bboxWkt,
      testCenter.lng, testCenter.lat,
      radius
    ]);

    const qStart = process.hrtime();
    const [rows] = await conn.query(querySql, [
      testCenter.lng, testCenter.lat,
      bboxWkt,
      testCenter.lng, testCenter.lat,
      radius
    ]);
    const qDiff = process.hrtime(qStart);
    const ms = (qDiff[0] * 1000 + qDiff[1] / 1e6).toFixed(2);

    console.log(`\nRadius ${radius}m Search Results:`);
    console.log(`  - Found: ${rows.length} listings`);
    console.log(`  - Query Execution Time: ${ms} ms (Target: < 1000 ms)`);
    console.log(`  - Index Used: ${explainRows[0].key || 'table scan / spatial'}`);
    console.log(`  - Nearest Distance: ${rows[0] ? rows[0].distance_m + 'm' : 'N/A'}`);
    console.log(`  - Furthest Distance: ${rows[rows.length - 1] ? rows[rows.length - 1].distance_m + 'm' : 'N/A'}`);
  }

  await conn.end();
}

if (require.main === module) {
  const count = parseInt(process.argv[2], 10) || 10000;
  generateBenchmarkData(count).catch(err => {
    console.error('Benchmark error:', err);
    process.exit(1);
  });
}

module.exports = { generateBenchmarkData };
