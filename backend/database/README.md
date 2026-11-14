# Database Layer — Smart House Rent Management System

This directory contains the database schema, spatial indexing logic, seed data, migration runner, and performance benchmarking scripts for the Smart House Rent system.

---

## 1. Quick Setup

From the `backend/` directory:

```bash
# Setup database and tables
npm run db:setup

# Populate sample data (Users, NID, Houses, Amenities, Bookings, Agreements)
npm run db:seed

# Or run both together:
npm run db:init
```

### Manual Run (MySQL / MariaDB CLI)
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

## 2. Coordinate System & Axis Order (SRID 4326)

> **CRITICAL**: In MySQL / MariaDB GIS:
> - `POINT(X, Y)`
> - **X = Longitude** (-180 to +180, e.g. Dhaka is ~`90.4125`)
> - **Y = Latitude** (-90 to +90, e.g. Dhaka is ~`23.8103`)
> - In `ST_Distance_Sphere(pt1, pt2)` the coordinates must be valid `(longitude, latitude)`. Passing latitude as X where latitude > 90 causes an `Out of range error`.
> - Always query coordinates as:
>   - `ST_X(location) AS longitude`
>   - `ST_Y(location) AS latitude`

---

## 3. Spatial Queries & Indexing

The `houses` table includes:
```sql
location POINT NOT NULL /*!80003 SRID 4326 */,
SPATIAL INDEX idx_houses_location (location)
```

### Sub-second Radius Query Strategy:
1. **Bounding-Box Prefilter (MBRContains)**:
   Computes a bounding polygon envelope around the target center point for 500m or 1000m. The MySQL optimizer uses the `idx_houses_location` R-tree spatial index to instantly prune 99%+ of points.
2. **Precise Spherical Distance Filter (`ST_Distance_Sphere`)**:
   Calculates the geodesic distance on the earth sphere in meters and filters exact matches `<= radius`.
3. **Ordering**:
   `ORDER BY distance_m ASC` displays nearest properties first.

See `spatial_queries.sql` for full syntax and EXPLAIN plans.

---

## 4. Entity-Relationship (ER) Overview

```
                      +------------------+
                      |      users       |
                      +------------------+
                        |  |       |   |
         +--------------+  |       |   +--------------+
         |                 |       |                  |
+-----------------+ +---------------+ +-------------+ +--------------------+
|  user_profiles  | |nid_verificats| |  feedback   | |   notifications    |
+-----------------+ +---------------+ +-------------+ +--------------------+
                           |                 |
                           |                 |
                           v                 v
                 +-------------------+ +---------------+
                 |      houses       | |   favorites   |
                 +-------------------+ +---------------+
                   |       |      |
        +----------+       |      +-----------+
        |                  |                  |
+---------------+ +-----------------+ +----------------+
| house_images  | | house_amenities | |    bookings    |
+---------------+ +-----------------+ +----------------+
                           |                  |
                           v                  v
                   +---------------+ +--------------------+
                   |   amenities   | | rental_agreements  |
                   +---------------+ +--------------------+
                                              |
                                              v
                                     +--------------------+
                                     |   billing_ledger   |
                                     +--------------------+
```

---

## 5. Performance Benchmark Script

Run the automated benchmark with 10,000 listings:
```bash
npm run db:bench
```
This tests radius queries against 10,000+ spatial points and prints the millisecond execution time (consistently < 50ms with R-tree spatial indexing).
