-- Smart House Rent Management System
-- Spatial Queries Documentation & Examples
-- SRID 4326 (WGS 84) Coordinate Axis Order & Optimization Guide

-- ==============================================================================
-- 1. AXIS ORDER SPECIFICATION (CRITICAL)
-- ==============================================================================
-- In MySQL / MariaDB GIS and OpenGIS specifications:
--   POINT(X, Y)
--   X = Longitude  (East-West: -180.0 to +180.0, e.g. Dhaka is ~90.4125)
--   Y = Latitude   (North-South: -90.0 to +90.0,  e.g. Dhaka is ~23.8103)
--
-- Notice: ST_Distance_Sphere expects POINT(longitude, latitude).
-- Passing (latitude, longitude) where latitude > 90 will trigger:
-- "Out of range error: Latitude should be [-90,90] in function ST_Distance_Sphere."
--
-- Consistency Rule Across Entire App:
-- In backend SQL: ALWAYS write POINT(longitude, latitude) / POINT(:lng, :lat).
-- When reading from DB:
--   ST_X(location) AS longitude
--   ST_Y(location) AS latitude
-- ==============================================================================

USE smart_house_rent;

-- ==============================================================================
-- 2. INSERT A HOUSE WITH SPATIAL POINT
-- ==============================================================================
-- Insert listing in Uttara Sector 10 (Lat: 23.8759, Lng: 90.3980)
INSERT INTO houses (
    landlord_id,
    title,
    description,
    address_text,
    division,
    district,
    area_name,
    city,
    location,
    rent_amount,
    security_deposit,
    bedrooms,
    bathrooms,
    size_sqft,
    status
) VALUES (
    1,
    'Modern Apartment in Uttara Sector 10',
    'Spacious 3-bedroom apartment with 2 balconies, generator backup and lift.',
    'House 14, Road 5, Sector 10, Uttara, Dhaka',
    'Dhaka',
    'Dhaka',
    'Uttara',
    'Dhaka',
    ST_GeomFromText('POINT(90.3980 23.8759)', 4326),
    28000.00,
    56000.00,
    3,
    3,
    1450,
    'approved'
);

-- ==============================================================================
-- 3. RADIUS SEARCH (500 METERS & 1000 METERS)
-- ==============================================================================
-- Step A: Compute Bounding Box Envelope (MBR) for Index Prefilter
-- 1 deg latitude  ~ 111,320 meters -> 1 meter ~ 0.00000898 deg lat
-- 1 deg longitude ~ 111,320 * cos(lat) meters
-- For Dhaka (lat ~ 23.8 deg):
-- cos(23.8 deg) ~ 0.915 -> 1 deg lon ~ 101,850 meters -> 1 meter ~ 0.00000982 deg lon
--
-- For radius = 500m:
--   delta_lat = 500 / 111320   ~ 0.00449 deg
--   delta_lng = 500 / 101850   ~ 0.00491 deg
-- For radius = 1000m:
--   delta_lat = 1000 / 111320  ~ 0.00898 deg
--   delta_lng = 1000 / 101850  ~ 0.00982 deg
--
-- Query Example for Center (Lat: 23.8750, Lng: 90.3970) with Radius 1000m:
SET @center_lat = 23.8750000;
SET @center_lng = 90.3970000;
SET @radius_m   = 1000;

-- Calculate bounding box
SET @d_lat = @radius_m / 111320;
SET @d_lng = @radius_m / (111320 * COS(RADIANS(@center_lat)));
SET @min_lat = @center_lat - @d_lat;
SET @max_lat = @center_lat + @d_lat;
SET @min_lng = @center_lng - @d_lng;
SET @max_lng = @center_lng + @d_lng;

-- Bounding-Box Polygon (WKT closed polygon)
SET @bbox_wkt = CONCAT(
    'POLYGON((',
    @min_lng, ' ', @min_lat, ',',
    @max_lng, ' ', @min_lat, ',',
    @max_lng, ' ', @max_lat, ',',
    @min_lng, ' ', @max_lat, ',',
    @min_lng, ' ', @min_lat,
    '))'
);

-- Search Query: MBRContains uses idx_houses_location (SPATIAL INDEX)
-- ST_Distance_Sphere filters exact spherical distance and returns distance in meters
SELECT 
    h.id,
    h.title,
    h.rent_amount,
    h.bedrooms,
    h.bathrooms,
    h.size_sqft,
    h.address_text,
    h.area_name,
    h.city,
    h.cover_image,
    ST_X(h.location) AS longitude,
    ST_Y(h.location) AS latitude,
    ROUND(ST_Distance_Sphere(h.location, POINT(@center_lng, @center_lat))) AS distance_m
FROM houses h
WHERE h.status = 'approved'
  AND MBRContains(ST_GeomFromText(@bbox_wkt, 4326), h.location)
  AND ST_Distance_Sphere(h.location, POINT(@center_lng, @center_lat)) <= @radius_m
ORDER BY distance_m ASC;

-- ==============================================================================
-- 4. COMBINED RADIUS + BUDGET + BEDROOMS FILTER
-- ==============================================================================
SELECT 
    h.id,
    h.title,
    h.rent_amount,
    h.bedrooms,
    h.bathrooms,
    h.size_sqft,
    h.address_text,
    h.area_name,
    h.city,
    h.cover_image,
    pt.name AS property_type,
    ST_X(h.location) AS longitude,
    ST_Y(h.location) AS latitude,
    ROUND(ST_Distance_Sphere(h.location, POINT(@center_lng, @center_lat))) AS distance_m
FROM houses h
LEFT JOIN property_types pt ON h.property_type_id = pt.id
WHERE h.status = 'approved'
  AND h.rent_amount BETWEEN 15000 AND 35000
  AND h.bedrooms >= 2
  AND MBRContains(ST_GeomFromText(@bbox_wkt, 4326), h.location)
  AND ST_Distance_Sphere(h.location, POINT(@center_lng, @center_lat)) <= 1000
ORDER BY distance_m ASC;

-- ==============================================================================
-- 5. EXPLAIN QUERY PROVING SPATIAL INDEX USAGE
-- ==============================================================================
EXPLAIN SELECT 
    h.id,
    h.title,
    ROUND(ST_Distance_Sphere(h.location, POINT(@center_lng, @center_lat))) AS distance_m
FROM houses h
WHERE MBRContains(ST_GeomFromText(@bbox_wkt, 4326), h.location)
  AND ST_Distance_Sphere(h.location, POINT(@center_lng, @center_lat)) <= 1000;
