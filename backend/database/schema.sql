-- Smart House Rent Management System
-- Database Schema for MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS smart_house_rent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_house_rent;

-- Disable foreign key checks for clean teardown if needed
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS billing_ledger;
DROP TABLE IF EXISTS rental_agreements;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS house_amenities;
DROP TABLE IF EXISTS listing_amenities;
DROP TABLE IF EXISTS house_images;
DROP TABLE IF EXISTS listing_images;
DROP TABLE IF EXISTS houses;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS nid_verifications;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS geocode_cache;
DROP TABLE IF EXISTS bd_locations;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'house_holder', 'admin') NOT NULL DEFAULT 'user',
    nid_status ENUM('not_submitted', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'not_submitted',
    status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
    ban_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USER PROFILES
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    address_text VARCHAR(255) NULL,
    nid_number VARCHAR(50) NULL,
    profile_photo_url VARCHAR(255) NULL,
    bio TEXT NULL,
    occupation VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. NID VERIFICATIONS
CREATE TABLE nid_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    nid_number VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT NOT NULL,
    father_mother_name VARCHAR(150) NULL,
    front_image_path VARCHAR(255) NOT NULL,
    back_image_path VARCHAR(255) NOT NULL,
    selfie_path VARCHAR(255) NULL,
    status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    rejection_reason TEXT NULL,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nid_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_nid_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_nid_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PROPERTY TYPES
CREATE TABLE property_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AMENITIES
CREATE TABLE amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. HOUSES (AND LISTINGS)
-- location stores POINT(longitude, latitude).
-- Spatial index uses location with SRID 4326.
CREATE TABLE houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT NOT NULL,
    property_type_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    address_text VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    district VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    area_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    location POINT NOT NULL /*!80003 SRID 4326 */,
    rent_amount DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) DEFAULT 0.00,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    size_sqft INT NOT NULL DEFAULT 500,
    floor VARCHAR(20) DEFAULT '2nd',
    rules TEXT NULL,
    availability_date DATE NULL,
    cover_image VARCHAR(255) NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected', 'booked', 'deal_completed', 'unpublished') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    SPATIAL INDEX idx_houses_location (location),
    INDEX idx_houses_status_rent (status, rent_amount),
    INDEX idx_houses_landlord (landlord_id),
    INDEX idx_houses_featured (is_featured),
    INDEX idx_houses_division_district_area (division, district, area_name),
    CONSTRAINT fk_houses_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_houses_type FOREIGN KEY (property_type_id) REFERENCES property_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alias view for legacy listings compatibility
CREATE OR REPLACE VIEW listings AS SELECT * FROM houses;

-- 7. HOUSE IMAGES
CREATE TABLE house_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    CONSTRAINT fk_house_images_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alias view for listings images compatibility
CREATE OR REPLACE VIEW listing_images AS SELECT id, house_id AS listing_id, image_url, is_cover, sort_order FROM house_images;

-- 8. HOUSE AMENITIES
CREATE TABLE house_amenities (
    house_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY(house_id, amenity_id),
    CONSTRAINT fk_house_amenities_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_house_amenities_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alias view for listing_amenities compatibility
CREATE OR REPLACE VIEW listing_amenities AS SELECT house_id AS listing_id, amenity_id FROM house_amenities;

-- 9. BOOKINGS
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_id INT NOT NULL,
    user_id INT NOT NULL,
    members INT NOT NULL DEFAULT 1,
    move_in_date DATE NOT NULL,
    message TEXT NULL,
    share_location BOOLEAN DEFAULT TRUE,
    booker_lat DECIMAL(10,7) NULL,
    booker_lng DECIMAL(10,7) NULL,
    booker_location POINT NULL /*!80003 SRID 4326 */,
    status ENUM('pending', 'confirmed', 'deal_completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_house_user_booking (house_id, user_id),
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_house (house_id),
    CONSTRAINT fk_bookings_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. FAVORITES
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    house_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_favorite (user_id, house_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. INQUIRIES
CREATE TABLE inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inquiries_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_inquiries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. RENTAL AGREEMENTS
CREATE TABLE rental_agreements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_id INT NOT NULL,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'ended', 'terminated') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agreements_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_agreements_tenant FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_agreements_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BILLING LEDGER (MANUAL RECORDING ONLY - NO ONLINE PAYMENT)
CREATE TABLE billing_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agreement_id INT NOT NULL,
    billing_month DATE NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    utility_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    other_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'partial', 'overdue') NOT NULL DEFAULT 'unpaid',
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_on DATE NULL,
    payment_method ENUM('cash', 'bank_transfer', 'mobile_banking', 'other') NULL,
    note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_agreement_month (agreement_id, billing_month),
    CONSTRAINT fk_billing_agreement FOREIGN KEY (agreement_id) REFERENCES rental_agreements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. FEEDBACK & COMPLAINTS
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category ENUM('Feedback', 'Complaint', 'Suggestion', 'Other') NOT NULL DEFAULT 'Feedback',
    house_id INT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
    admin_response TEXT NULL,
    responded_by INT NULL,
    responded_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_responder FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. NOTIFICATIONS
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    link VARCHAR(255) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user_read (user_id, is_read),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. GEOCODE CACHE
CREATE TABLE geocode_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_text VARCHAR(255) NOT NULL UNIQUE,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_geocode_query (query_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. BANGLADESH LOCATIONS
CREATE TABLE bd_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    division VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    area VARCHAR(100) NOT NULL,
    UNIQUE KEY uq_division_district_area (division, district, area),
    INDEX idx_div_dist (division, district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
