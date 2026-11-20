-- Smart House Rent Management System - Seed Data
-- Realistic Dhaka Sample Data

USE smart_house_rent;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE feedback;
TRUNCATE TABLE billing_ledger;
TRUNCATE TABLE rental_agreements;
TRUNCATE TABLE inquiries;
TRUNCATE TABLE favorites;
TRUNCATE TABLE bookings;
TRUNCATE TABLE house_amenities;
TRUNCATE TABLE house_images;
TRUNCATE TABLE houses;
TRUNCATE TABLE amenities;
TRUNCATE TABLE property_types;
TRUNCATE TABLE nid_verifications;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE geocode_cache;
TRUNCATE TABLE bd_locations;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. PROPERTY TYPES
INSERT INTO property_types (id, name) VALUES
(1, 'Apartment'),
(2, 'Family Flat'),
(3, 'Bachelor Flat'),
(4, 'Studio Apartment'),
(5, 'Sublet / Single Room'),
(6, 'Duplex House');

-- 2. AMENITIES
INSERT INTO amenities (id, name) VALUES
(1, 'Lift / Elevator'),
(2, 'Generator Backup'),
(3, 'Titas Gas / Cylinder Gas'),
(4, 'High-Speed Wi-Fi'),
(5, '24/7 Security Guard'),
(6, 'Car Parking'),
(7, 'Balcony / Veranda'),
(8, 'CCTV Surveillance'),
(9, 'Water Filter / Deep Tubewell'),
(10, 'Fire Safety & Extinguisher');

-- 3. BANGLADESH LOCATIONS (Divisions, Districts, Areas)
INSERT INTO bd_locations (division, district, area) VALUES
-- Dhaka Division -> Dhaka District
('Dhaka', 'Dhaka', 'Uttara Sector 1'),
('Dhaka', 'Dhaka', 'Uttara Sector 3'),
('Dhaka', 'Dhaka', 'Uttara Sector 7'),
('Dhaka', 'Dhaka', 'Uttara Sector 10'),
('Dhaka', 'Dhaka', 'Uttara Sector 11'),
('Dhaka', 'Dhaka', 'Uttara Sector 14'),
('Dhaka', 'Dhaka', 'Mirpur 1'),
('Dhaka', 'Dhaka', 'Mirpur 2'),
('Dhaka', 'Dhaka', 'Mirpur 10'),
('Dhaka', 'Dhaka', 'Mirpur 11'),
('Dhaka', 'Dhaka', 'Mirpur DOHS'),
('Dhaka', 'Dhaka', 'Dhanmondi 4/A'),
('Dhaka', 'Dhaka', 'Dhanmondi 9/A'),
('Dhaka', 'Dhaka', 'Dhanmondi 27'),
('Dhaka', 'Dhaka', 'Gulshan 1'),
('Dhaka', 'Dhaka', 'Gulshan 2'),
('Dhaka', 'Dhaka', 'Banani Road 11'),
('Dhaka', 'Dhaka', 'Banani Block D'),
('Dhaka', 'Dhaka', 'Bashundhara R/A Block C'),
('Dhaka', 'Dhaka', 'Bashundhara R/A Block D'),
('Dhaka', 'Dhaka', 'Bashundhara R/A Block I'),
('Dhaka', 'Dhaka', 'Mohakhali DOHS'),
('Dhaka', 'Dhaka', 'Badda'),
('Dhaka', 'Dhaka', 'Lalmatia'),
('Dhaka', 'Dhaka', 'Mohammadpur'),
-- Chittagong Division
('Chittagong', 'Chittagong', 'Agrabad'),
('Chittagong', 'Chittagong', 'Nasirabad'),
('Chittagong', 'Chittagong', 'GEC Circle'),
('Chittagong', 'Chittagong', 'Khulshi'),
-- Sylhet Division
('Sylhet', 'Sylhet', 'Zindabazar'),
('Sylhet', 'Sylhet', 'Uposhohor'),
('Sylhet', 'Sylhet', 'Amberkhana'),
-- Rajshahi Division
('Rajshahi', 'Rajshahi', 'Kazihata'),
('Rajshahi', 'Rajshahi', 'Shaheb Bazar');

-- 4. USERS (All accounts use password: password123)
-- Default Password for all seed users: Password123!
-- Hash: $2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2
INSERT INTO users (id, full_name, email, phone, password_hash, role, nid_status, status) VALUES
(1, 'System Administrator', 'admin@smarthouse.com', '+8801700000001', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'admin', 'verified', 'active'),
(2, 'Kabir Hossain', 'landlord1@smarthouse.com', '+8801711111111', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'house_holder', 'verified', 'active'),
(3, 'Farhana Rahman', 'landlord2@smarthouse.com', '+8801722222222', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'house_holder', 'verified', 'active'),
(4, 'Tanvir Ahmed', 'landlord3@smarthouse.com', '+8801733333333', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'house_holder', 'verified', 'active'),
(5, 'Sadek Ali', 'user1@smarthouse.com', '+8801744444444', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'user', 'verified', 'active'),
(6, 'Nusrat Jahan', 'user2@smarthouse.com', '+8801755555555', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'user', 'verified', 'active'),
(7, 'Rahim Chowdhury', 'user3@smarthouse.com', '+8801766666666', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'user', 'pending', 'active'),
(8, 'Mehedi Hasan', 'user4@smarthouse.com', '+8801777777777', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'user', 'not_submitted', 'active'),
(9, 'Banned User', 'banned@smarthouse.com', '+8801799999999', '$2a$10$IDZCrq8AfRRkSGfFKZiRYeAjKU.nt0I4gbOtjzaOS1DBcYdSOnSr2', 'user', 'not_submitted', 'banned');

UPDATE users SET ban_reason = 'Multiple fraudulent listing reports.' WHERE id = 9;

-- 5. USER PROFILES
INSERT INTO user_profiles (user_id, address_text, nid_number, profile_photo_url, bio, occupation) VALUES
(1, 'Uttara, Dhaka', '19902692010000001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'Smart House Rent Head Admin', 'Operations Director'),
(2, 'House 12, Road 4, Sector 7, Uttara, Dhaka', '19852692020000002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Property owner in Uttara and Mirpur', 'Business Executive'),
(3, 'House 34, Road 27, Dhanmondi, Dhaka', '19882692030000003', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', 'Experienced landlord managing family rental spaces', 'Architect'),
(4, 'House 77, Road 11, Banani, Dhaka', '19822692040000004', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'Residential apartment investor in Gulshan and Banani', 'Engineer'),
(5, 'House 5, Road 2, Mirpur 2, Dhaka', '19952692050000005', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200', 'Software engineer looking for comfortable and smart flats', 'Software Engineer'),
(6, 'Sector 11, Uttara, Dhaka', '19972692060000006', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 'University lecturer and researcher', 'University Lecturer');

-- 6. NID VERIFICATIONS
INSERT INTO nid_verifications (id, user_id, full_name, nid_number, date_of_birth, address, father_mother_name, front_image_path, back_image_path, status, reviewed_by, reviewed_at) VALUES
(1, 1, 'System Administrator', '19902692010000001', '1990-01-15', 'Uttara, Dhaka', 'Late M. Rahman', '/uploads/nid/nid_admin_front.jpg', '/uploads/nid/nid_admin_back.jpg', 'verified', 1, NOW()),
(2, 2, 'Kabir Hossain', '19852692020000002', '1985-06-20', 'House 12, Road 4, Sector 7, Uttara, Dhaka', 'Hossain Ali', '/uploads/nid/nid_kabir_front.jpg', '/uploads/nid/nid_kabir_back.jpg', 'verified', 1, NOW()),
(3, 3, 'Farhana Rahman', '19882692030000003', '1988-11-10', 'House 34, Road 27, Dhanmondi, Dhaka', 'Fazlur Rahman', '/uploads/nid/nid_farhana_front.jpg', '/uploads/nid/nid_farhana_back.jpg', 'verified', 1, NOW()),
(4, 4, 'Tanvir Ahmed', '19822692040000004', '1982-03-25', 'House 77, Road 11, Banani, Dhaka', 'Ahmed Sharif', '/uploads/nid/nid_tanvir_front.jpg', '/uploads/nid/nid_tanvir_back.jpg', 'verified', 1, NOW()),
(5, 5, 'Sadek Ali', '19952692050000005', '1995-09-12', 'House 5, Road 2, Mirpur 2, Dhaka', 'Ali Akbar', '/uploads/nid/nid_sadek_front.jpg', '/uploads/nid/nid_sadek_back.jpg', 'verified', 1, NOW()),
(6, 6, 'Nusrat Jahan', '19972692060000006', '1997-04-18', 'Sector 11, Uttara, Dhaka', 'Jahanara Begum', '/uploads/nid/nid_nusrat_front.jpg', '/uploads/nid/nid_nusrat_back.jpg', 'verified', 1, NOW()),
(7, 7, 'Rahim Chowdhury', '19942692070000007', '1994-08-05', 'Block C, Bashundhara R/A, Dhaka', 'Chowdhury Miah', '/uploads/nid/nid_rahim_front.jpg', '/uploads/nid/nid_rahim_back.jpg', 'pending', NULL, NULL);

-- 7. HOUSES (25+ REALISTIC DHAKA PROPERTIES WITH PRECISE POINT COORDINATES)
-- Longitude (X) ~ 90.35 to 90.44 | Latitude (Y) ~ 23.73 to 23.88
INSERT INTO houses (
    id, landlord_id, property_type_id, title, description, address_text,
    division, district, area_name, city, location,
    rent_amount, security_deposit, bedrooms, bathrooms, size_sqft, floor,
    rules, availability_date, cover_image, is_featured, status
) VALUES
-- UTTARA
(1, 2, 1, 'Lakeview Luxury 3BHK Flat in Uttara Sector 3',
 'Scenic lake-facing apartment with large open balcony, modular Italian kitchen, full backup generator, 2 lifts and tight CCTV security. Perfect for families.',
 'House 22, Road 7, Sector 3, Uttara, Dhaka',
 'Dhaka', 'Dhaka', 'Uttara Sector 3', 'Dhaka',
 ST_GeomFromText('POINT(90.3985 23.8682)'),
 36000.00, 72000.00, 3, 3, 1650, '5th',
 'Family preferred. No loud noise after 11 PM.', '2026-12-01',
 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', TRUE, 'approved'),

(2, 2, 2, 'Sunny 2BHK Family Flat in Uttara Sector 7',
 'Cozy 2-bedroom south-facing flat near Rabindra Sarani and Uttara Club. 2 balconies, natural sunlight all day, gas connection present.',
 'House 18, Road 2, Sector 7, Uttara, Dhaka',
 'Dhaka', 'Dhaka', 'Uttara Sector 7', 'Dhaka',
 ST_GeomFromText('POINT(90.4012 23.8715)'),
 24000.00, 48000.00, 2, 2, 1100, '3rd',
 'Family tenants only. Gas bill included.', '2026-11-20',
 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', TRUE, 'approved'),

(3, 2, 1, 'Modern 3BHK Residence in Uttara Sector 10',
 'Brand new apartment building with high-speed elevator, fire safety, underground parking and intercom. 5 mins walk to Uttara University campus.',
 'House 14, Road 5, Sector 10, Uttara, Dhaka',
 'Dhaka', 'Dhaka', 'Uttara Sector 10', 'Dhaka',
 ST_GeomFromText('POINT(90.3945 23.8790)'),
 28000.00, 56000.00, 3, 3, 1400, '4th',
 'Strictly for decent families or faculty members.', '2026-12-15',
 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', TRUE, 'approved'),

(4, 2, 4, 'Executive Studio Suite in Uttara Sector 11',
 'Fully furnished studio apartment ideal for single professionals or overseas visitors. Includes AC, smart TV, refrigerator, and high-speed Wi-Fi.',
 'House 9, Road 18, Sector 11, Uttara, Dhaka',
 'Dhaka', 'Dhaka', 'Uttara Sector 11', 'Dhaka',
 ST_GeomFromText('POINT(90.3920 23.8760)'),
 18000.00, 36000.00, 1, 1, 550, '2nd',
 'No pets. Non-smoking zone.', '2026-11-15',
 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', FALSE, 'approved'),

(5, 2, 5, 'Spacious Master Bed Sublet in Uttara Sector 14',
 'Attached bath and separate personal balcony in a quiet 4-bedroom flat. Attached kitchen access and rooftop garden privilege.',
 'House 45, Road 12, Sector 14, Uttara, Dhaka',
 'Dhaka', 'Dhaka', 'Uttara Sector 14', 'Dhaka',
 ST_GeomFromText('POINT(90.3870 23.8820)'),
 10500.00, 10500.00, 1, 1, 260, '4th',
 'Job holder or clean university student only.', '2026-12-01',
 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', FALSE, 'approved'),

-- MIRPUR
(6, 2, 2, 'Spacious 3BHK Family Flat in Mirpur DOHS',
 'Located in safe and gated Mirpur DOHS. Serene environment with parks, mosques, 24/7 military-grade security and wide roads.',
 'Road 7, Mirpur DOHS, Dhaka',
 'Dhaka', 'Dhaka', 'Mirpur DOHS', 'Dhaka',
 ST_GeomFromText('POINT(90.3680 23.8340)'),
 34000.00, 68000.00, 3, 3, 1700, '6th',
 'Standard DOHS association regulations apply.', '2026-12-01',
 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', TRUE, 'approved'),

(7, 2, 1, 'Near Metro Station 3BHK in Mirpur 10',
 '2 minutes walk from Mirpur 10 Metro Rail Station. 3 beds, 2 baths, gas cylinder, tile floors, excellent transportation link across the city.',
 'Block C, Road 3, Mirpur 10, Dhaka',
 'Dhaka', 'Dhaka', 'Mirpur 10', 'Dhaka',
 ST_GeomFromText('POINT(90.3695 23.8070)'),
 22000.00, 44000.00, 3, 2, 1250, '3rd',
 'Timely rent payment required.', '2026-11-25',
 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', FALSE, 'approved'),

(8, 2, 3, 'Convenient Bachelor Flat in Mirpur 2',
 'Well ventilated flat for job-holding bachelors. Close to universities and shopping malls. Titas gas and round-the-clock water supply.',
 'House 8, Road 4, Block D, Mirpur 2, Dhaka',
 'Dhaka', 'Dhaka', 'Mirpur 2', 'Dhaka',
 ST_GeomFromText('POINT(90.3620 23.8035)'),
 16000.00, 32000.00, 2, 2, 900, '2nd',
 'Bachelors welcome with corporate ID card.', '2026-11-18',
 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', FALSE, 'approved'),

(9, 2, 1, 'Budget Friendly 2BHK in Mirpur 1',
 'Bright 2-bedroom apartment with ceramic tiles, rooftop access, clean neighborhood, near Sony Cinema Hall / Square.',
 'Road 1, Block A, Mirpur 1, Dhaka',
 'Dhaka', 'Dhaka', 'Mirpur 1', 'Dhaka',
 ST_GeomFromText('POINT(90.3540 23.7960)'),
 15000.00, 30000.00, 2, 2, 850, '4th',
 'Family or small professional group.', '2026-12-01',
 'https://images.unsplash.com/photo-1502005229762-ee1b2b93e007?w=800', FALSE, 'approved'),

-- DHANMONDI
(10, 3, 1, 'Aristocratic 4BHK Apartment in Dhanmondi 27',
 'Prime Dhanmondi location near top schools and hospitals. 4 expansive bedrooms, servant quarter, 3 balconies, 2 parking spots, standby generator.',
 'House 42, Road 27, Dhanmondi, Dhaka',
 'Dhaka', 'Dhaka', 'Dhanmondi 27', 'Dhaka',
 ST_GeomFromText('POINT(90.3725 23.7530)'),
 65000.00, 130000.00, 4, 4, 2400, '7th',
 'Respectable family tenants only. 1 year agreement.', '2026-12-01',
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', TRUE, 'approved'),

(11, 3, 2, 'Green Living 3BHK beside Dhanmondi Lake 9/A',
 'Direct fresh air from Dhanmondi lake. Walking distance to lake walkway, restaurants and cafes. South-facing with premium fittings.',
 'House 19, Road 9/A, Dhanmondi, Dhaka',
 'Dhaka', 'Dhaka', 'Dhanmondi 9/A', 'Dhaka',
 ST_GeomFromText('POINT(90.3750 23.7475)'),
 45000.00, 90000.00, 3, 3, 1750, '4th',
 'Quiet residential family building.', '2026-12-10',
 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', FALSE, 'approved'),

(12, 3, 4, 'Chic Studio Apartment in Dhanmondi 4/A',
 'Modern compact open-plan studio flat with kitchenette, dining nook, polished wooden closet and modern bathroom.',
 'House 8, Road 4/A, Dhanmondi, Dhaka',
 'Dhaka', 'Dhaka', 'Dhanmondi 4/A', 'Dhaka',
 ST_GeomFromText('POINT(90.3795 23.7420)'),
 20000.00, 40000.00, 1, 1, 600, '3rd',
 'Single executive or couple.', '2026-11-22',
 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', FALSE, 'approved'),

-- GULSHAN & BANANI
(13, 4, 1, 'Diplomatic Zone Premium Flat in Gulshan 2',
 'Ultra-high-end residential apartment with concierge desk, private elevator code, central water heater, imported fittings and swimming pool on terrace.',
 'Road 54, Gulshan 2, Dhaka',
 'Dhaka', 'Dhaka', 'Gulshan 2', 'Dhaka',
 ST_GeomFromText('POINT(90.4180 23.7940)'),
 95000.00, 190000.00, 4, 4, 2800, '9th',
 'Diplomats, expats, or senior corporate executives.', '2026-12-01',
 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', TRUE, 'approved'),

(14, 4, 1, 'Stylish 3BHK Residence in Gulshan 1',
 'Heart of Gulshan 1 near Hatirjheel link road. 3 spacious bedrooms, soundproof UPVC windows, modern open kitchen and dedicated car parking.',
 'Road 132, Gulshan 1, Dhaka',
 'Dhaka', 'Dhaka', 'Gulshan 1', 'Dhaka',
 ST_GeomFromText('POINT(90.4160 23.7780)'),
 55000.00, 110000.00, 3, 3, 1900, '5th',
 'Small family or expat couple.', '2026-12-05',
 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', FALSE, 'approved'),

(15, 4, 1, 'Cosmopolitan 3BHK on Banani Road 11',
 'Prime commercial and dining hub nearby. Modern marble flooring, ambient cove lighting, imported bath fixtures, elevator and 24h guard.',
 'House 88, Road 11, Banani, Dhaka',
 'Dhaka', 'Dhaka', 'Banani Road 11', 'Dhaka',
 ST_GeomFromText('POINT(90.4045 23.7930)'),
 52000.00, 104000.00, 3, 3, 1850, '4th',
 'Family residence only. No commercial use.', '2026-11-30',
 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', FALSE, 'approved'),

(16, 4, 2, 'Cozy 2BHK in Banani Block D',
 'Quiet residential lane in Banani. Beautiful front balcony with tree canopy, modern kitchen cabinets, separate drawing and dining halls.',
 'House 31, Road 19/A, Block D, Banani, Dhaka',
 'Dhaka', 'Dhaka', 'Banani Block D', 'Dhaka',
 ST_GeomFromText('POINT(90.4010 23.7910)'),
 38000.00, 76000.00, 2, 2, 1300, '2nd',
 'Family tenants preferred.', '2026-12-01',
 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', FALSE, 'approved'),

-- BASHUNDHARA R/A
(17, 4, 1, 'Modern 3BHK Apartment in Bashundhara Block C',
 'Close to Apollo/Evercare Hospital and NSU/IUB campuses. Gated community with security checkposts, central park, wide tree-lined streets.',
 'Plot 120, Road 4, Block C, Bashundhara R/A, Dhaka',
 'Dhaka', 'Dhaka', 'Bashundhara R/A Block C', 'Dhaka',
 ST_GeomFromText('POINT(90.4310 23.8160)'),
 32000.00, 64000.00, 3, 3, 1550, '5th',
 'Faculty, doctor, or family.', '2026-12-01',
 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', FALSE, 'approved'),

(18, 4, 2, 'Spacious 3BHK in Bashundhara Block D',
 'Corner plot building with triple side open airflow. 3 large bedrooms, 3 bathrooms, maid toilet, 2 balconies and lift.',
 'Road 8, Block D, Bashundhara R/A, Dhaka',
 'Dhaka', 'Dhaka', 'Bashundhara R/A Block D', 'Dhaka',
 ST_GeomFromText('POINT(90.4360 23.8185)'),
 30000.00, 60000.00, 3, 3, 1500, '3rd',
 'Clean family tenants.', '2026-11-28',
 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', FALSE, 'approved'),

(19, 4, 3, 'Student / Bachelor Friendly Flat in Bashundhara Block I',
 'Walking distance to university gates. High speed Wi-Fi line, generator backup, filtered drinking water, 24/7 security guard.',
 'Block I, Road 2, Bashundhara R/A, Dhaka',
 'Dhaka', 'Dhaka', 'Bashundhara R/A Block I', 'Dhaka',
 ST_GeomFromText('POINT(90.4430 23.8240)'),
 21000.00, 42000.00, 3, 2, 1100, '1st',
 'Students with university ID or corporate bachelors.', '2026-12-01',
 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', FALSE, 'approved'),

-- MOHAKHALI DOHS & BADDA
(20, 3, 1, 'Tranquil 3BHK in Mohakhali DOHS',
 'Premium cantonment board governed enclave. Quiet roads, central mosque, clean lake and security guards at every gate.',
 'Road 14, Mohakhali DOHS, Dhaka',
 'Dhaka', 'Dhaka', 'Mohakhali DOHS', 'Dhaka',
 ST_GeomFromText('POINT(90.3950 23.7795)'),
 48000.00, 96000.00, 3, 3, 1800, '4th',
 'Family only. Strict DOHS residency criteria.', '2026-12-01',
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', FALSE, 'approved'),

(21, 3, 2, 'Affordable 2BHK Near Gulshan Link in Badda',
 '5 minutes hop across the lake to Gulshan 1. 2 bedrooms, 1 bath, kitchen, tiled floors, bright living space with low monthly maintenance.',
 'South Badda, Gulshan Link Road, Dhaka',
 'Dhaka', 'Dhaka', 'Badda', 'Dhaka',
 ST_GeomFromText('POINT(90.4260 23.7820)'),
 17500.00, 35000.00, 2, 1, 950, '3rd',
 'Affordable urban housing.', '2026-11-20',
 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800', FALSE, 'approved'),

-- LALMATIA & MOHAMMADPUR
(22, 3, 1, 'Elegant 3BHK in Lalmatia Block B',
 'Tree-shaded peaceful street near Dhanmondi 27. High ceiling, French windows, polished wooden doors, 2 lifts and standby generator.',
 'House 15, Block B, Lalmatia, Dhaka',
 'Dhaka', 'Dhaka', 'Lalmatia', 'Dhaka',
 ST_GeomFromText('POINT(90.3700 23.7570)'),
 40000.00, 80000.00, 3, 3, 1600, '4th',
 'Family tenants only.', '2026-12-01',
 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', FALSE, 'approved'),

(23, 3, 2, 'Cozy 2BHK in Mohammadpur Town Hall Area',
 'Near market and bus stand. Tile flooring, 24 hours water, prepaid electricity meter, balcony with morning sun.',
 'Noorjahan Road, Mohammadpur, Dhaka',
 'Dhaka', 'Dhaka', 'Mohammadpur', 'Dhaka',
 ST_GeomFromText('POINT(90.3620 23.7590)'),
 19000.00, 38000.00, 2, 2, 1050, '2nd',
 'Small family.', '2026-11-25',
 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', FALSE, 'approved'),

-- POSTED BY USER (Sadek Ali - id 5) to test dual-role capability!
(24, 5, 1, 'Sadek’s Modern 3BHK in Uttara Sector 11',
 'Recently renovated apartment with modern false ceiling lighting, master bath with tub, tiled kitchen with cabinet hood, and balcony.',
 'House 33, Road 14, Sector 11, Uttara, Dhaka',
 'Dhaka', 'Dhaka', 'Uttara Sector 11', 'Dhaka',
 ST_GeomFromText('POINT(90.3930 23.8745)'),
 27000.00, 54000.00, 3, 2, 1350, '3rd',
 'Good family tenants only.', '2026-12-01',
 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', FALSE, 'approved'),

-- PENDING APPROVAL HOUSE (for Admin review testing)
(25, 2, 6, 'Royal Duplex Villa in Uttara Sector 1',
 'Spacious luxury duplex with private garage, lawn, 5 bedrooms, internal staircase and rooftop gazebo.',
 'House 3, Road 1, Sector 1, Uttara, Dhaka',
 'Dhaka', 'Dhaka', 'Uttara Sector 1', 'Dhaka',
 ST_GeomFromText('POINT(90.4020 23.8620)'),
 85000.00, 170000.00, 5, 5, 3200, 'Duplex (1st & 2nd)',
 'Diplomatic / corporate VIP lease only.', '2027-01-01',
 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', FALSE, 'pending'),

-- DEAL COMPLETED HOUSE (for history & completed deals testing)
(26, 3, 1, 'Completed Deal: Dhanmondi Lake View Flat',
 'Previously rented 3BHK flat in Dhanmondi. Deal completed successfully.',
 'Road 8/A, Dhanmondi, Dhaka',
 'Dhaka', 'Dhaka', 'Dhanmondi 9/A', 'Dhaka',
 ST_GeomFromText('POINT(90.3740 23.7460)'),
 38000.00, 76000.00, 3, 3, 1500, '3rd',
 'Completed rental deal.', '2026-10-01',
 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800', FALSE, 'deal_completed');

-- 8. HOUSE IMAGES (Gallery pictures for houses)
INSERT INTO house_images (house_id, image_url, is_cover, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1502005229762-ee1b2b93e007?w=800', FALSE, 2),
(1, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', FALSE, 3),
(1, 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800', FALSE, 4),

(2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', FALSE, 2),
(2, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800', FALSE, 3),

(3, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', FALSE, 2),

(10, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', TRUE, 1),
(10, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', FALSE, 2),
(10, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', FALSE, 3),

(13, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', TRUE, 1),
(13, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', FALSE, 2),
(13, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', FALSE, 3);

-- 9. HOUSE AMENITIES
INSERT INTO house_amenities (house_id, amenity_id) VALUES
-- House 1
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- House 2
(2, 1), (2, 3), (2, 5), (2, 7), (2, 8),
-- House 3
(3, 1), (3, 2), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8),
-- House 6
(6, 1), (6, 2), (6, 4), (6, 5), (6, 6), (6, 7), (6, 8),
-- House 10
(10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8),
-- House 13
(13, 1), (13, 2), (13, 3), (13, 4), (13, 5), (13, 6), (13, 7), (13, 8);

-- 10. BOOKINGS (Including booker live location coordinates for Direction route!)
INSERT INTO bookings (
    id, house_id, user_id, members, move_in_date, message,
    share_location, booker_lat, booker_lng, booker_location, status
) VALUES
(1, 1, 6, 3, '2026-12-01',
 'Hi, I am Nusrat Jahan, lecturer at Uttara University. We are a family of 3 looking to move in from Dec 1. Would love to finalize the deal!',
 TRUE, 23.8740000, 90.3990000, ST_GeomFromText('POINT(90.3990 23.8740)'), 'confirmed'),

(2, 2, 5, 2, '2026-11-25',
 'Assalamu Alaikum. Sadek Ali here. My wife and I visited the area and loved your flat. Ready to pay deposit whenever convenient.',
 TRUE, 23.8050000, 90.3650000, ST_GeomFromText('POINT(90.3650 23.8050)'), 'pending'),

(3, 26, 6, 2, '2026-09-15',
 'Booking completed for Dhanmondi flat.',
 TRUE, 23.7500000, 90.3700000, ST_GeomFromText('POINT(90.3700 23.7500)'), 'deal_completed');

-- 11. FAVORITES (Saved houses for users)
INSERT INTO favorites (user_id, house_id) VALUES
(5, 1),
(5, 3),
(5, 10),
(6, 1),
(6, 2),
(6, 6);

-- 12. INQUIRIES
INSERT INTO inquiries (house_id, user_id, message, status) VALUES
(1, 5, 'Is car parking space included in the rent or charged separately?', 'replied'),
(3, 6, 'Are pets like cats allowed in the building?', 'read'),
(10, 5, 'Can we visit the property this Friday afternoon?', 'new');

-- 13. RENTAL AGREEMENTS
INSERT INTO rental_agreements (id, house_id, tenant_id, landlord_id, start_date, end_date, monthly_rent, deposit_amount, status) VALUES
(1, 1, 6, 2, '2026-12-01', '2027-11-30', 36000.00, 72000.00, 'active'),
(2, 26, 6, 3, '2026-01-01', '2026-10-31', 38000.00, 76000.00, 'ended');

-- 14. BILLING LEDGER (MANUAL RECORDING ONLY)
INSERT INTO billing_ledger (
    id, agreement_id, billing_month, rent_amount, utility_amount, other_charges,
    total_amount, due_date, payment_status, paid_amount, paid_on, payment_method, note
) VALUES
(1, 1, '2026-12-01', 36000.00, 2500.00, 500.00, 39000.00, '2026-12-07', 'paid', 39000.00, '2026-12-05', 'bank_transfer', 'December rent and utilities paid via City Bank transfer.'),
(2, 1, '2027-01-01', 36000.00, 2500.00, 0.00, 38500.00, '2027-01-07', 'unpaid', 0.00, NULL, NULL, 'January billing generated.');

-- 15. FEEDBACK & COMPLAINTS
INSERT INTO feedback (id, user_id, category, house_id, subject, message, status, admin_response, responded_by, responded_at) VALUES
(1, 5, 'Feedback', 1, 'Smooth map navigation experience', 'The radius search is amazing! Found lakeview houses in Uttara within 500 meters effortlessly.', 'resolved', 'Thank you Sadek! We are continuously optimizing the radius search algorithm.', 1, NOW()),
(2, 6, 'Suggestion', NULL, 'Add more filter options for gas connection', 'It would be great to filter by Titas pipeline gas vs LP cylinder gas specifically.', 'in_progress', 'Great suggestion Nusrat. Our engineering team has prioritized this feature for the next update.', 1, NOW()),
(3, 7, 'Complaint', NULL, 'NID verification delay', 'Submitted my NID 2 days ago, still showing pending. Please review soon.', 'new', NULL, NULL, NULL);

-- 16. NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, title, body, link, is_read) VALUES
(1, 6, 'booking_confirmed', 'Booking Confirmed!', 'Your booking for Lakeview Luxury 3BHK Flat has been approved by Kabir Hossain.', '/dashboard', FALSE),
(2, 5, 'feedback_response', 'Admin Responded to Your Feedback', 'Admin replied: "Thank you Sadek! We are continuously optimizing the radius search algorithm."', '/dashboard', FALSE),
(3, 2, 'booking_new', 'New Booking Received', 'Nusrat Jahan submitted a booking request for Lakeview Luxury 3BHK Flat.', '/host', TRUE),
(4, 5, 'nid_approved', 'NID Verification Approved', 'Congratulations! Your National ID has been verified. You can now post and book houses.', '/dashboard', TRUE);

-- 17. GEOCODE CACHE
INSERT INTO geocode_cache (query_text, latitude, longitude, display_name) VALUES
('uttara', 23.8759000, 90.3980000, 'Uttara, Sector 10, Dhaka, Bangladesh'),
('mirpur', 23.8070000, 90.3695000, 'Mirpur 10, Dhaka, Bangladesh'),
('dhanmondi', 23.7460000, 90.3740000, 'Dhanmondi, Dhaka, Bangladesh'),
('gulshan', 23.7940000, 90.4180000, 'Gulshan 2, Dhaka, Bangladesh'),
('banani', 23.7930000, 90.4045000, 'Banani Road 11, Dhaka, Bangladesh'),
('bashundhara', 23.8160000, 90.4310000, 'Bashundhara R/A Block C, Dhaka, Bangladesh');
