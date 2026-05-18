-- ============================================================
-- Hotel Room Reservation System - Database Schema + Seed Data
-- MySQL / MariaDB
-- Run this script ONCE before starting the backend
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hotel_db;

-- ============================================================
-- Module 1: Room Management
-- ============================================================
CREATE TABLE IF NOT EXISTS Rooms (
    room_id         INT AUTO_INCREMENT PRIMARY KEY,
    room_number     VARCHAR(10)    NOT NULL UNIQUE,
    type            ENUM('Single', 'Double', 'Suite', 'Deluxe') NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    status          ENUM('Available', 'Booked', 'Maintenance') NOT NULL DEFAULT 'Available',
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Module 2: Customer Management
-- ============================================================
CREATE TABLE IF NOT EXISTS Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Module 3: Reservation System
-- ============================================================
CREATE TABLE IF NOT EXISTS Reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id    INT          NOT NULL,
    room_id        INT          NOT NULL,
    check_in_date  DATE         NOT NULL,
    check_out_date DATE         NOT NULL,
    status         ENUM('Confirmed', 'Pending', 'Cancelled', 'CheckedOut') NOT NULL DEFAULT 'Pending',
    total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id)     REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- ============================================================
-- Module 4: module4_payment.Payment Handling
-- ============================================================
CREATE TABLE IF NOT EXISTS Payments (
    payment_id     INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT          NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Card', 'Online') NOT NULL DEFAULT 'Cash',
    status         ENUM('Paid', 'Pending', 'Refunded') NOT NULL DEFAULT 'Pending',
    payment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(reservation_id) ON DELETE CASCADE
);

-- ============================================================
-- Module 5: Staff / Admin
-- ============================================================
CREATE TABLE IF NOT EXISTS Staff (
    staff_id   INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(150)  NOT NULL UNIQUE,
    password   VARCHAR(255)  NOT NULL,
    role       ENUM('Admin', 'Receptionist', 'Manager') NOT NULL DEFAULT 'Receptionist',
    phone      VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Module 6: Reviews & Reports
-- ============================================================
CREATE TABLE IF NOT EXISTS Reviews (
    review_id      INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT     NOT NULL,
    customer_id    INT     NOT NULL,
    rating         TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    review_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id)    REFERENCES Customers(customer_id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Staff (password stored as plain text for demo; use hashing in production)
INSERT IGNORE INTO Staff (name, email, password, role, phone) VALUES
('Admin User',      'admin@hotel.com',      'admin123',   'Admin',        '0771234567'),
('John Manager',    'manager@hotel.com',    'manager123', 'Manager',      '0779876543'),
('Sara Reception',  'reception@hotel.com',  'recep123',   'Receptionist', '0775551234'),
('Tom Desk',        'tom@hotel.com',        'tom123',     'Receptionist', '0773339988'),
('Nisha Admin',     'nisha@hotel.com',      'nisha123',   'Admin',        '0771122334');

-- Rooms
INSERT IGNORE INTO Rooms (room_number, type, price_per_night, status, description) VALUES
('101', 'Single',  4500.00, 'Available',   'Cozy single room with lush garden view, perfect for solo travelers.'),
('102', 'Single',  4500.00, 'Available',   'Single room with mountain view, ideal for nature lovers.'),
('103', 'Single',  4800.00, 'Booked',      'Single superior room with private balcony.'),
('201', 'Double',  8500.00, 'Available',   'Spacious double room with king-size bed and city skyline view.'),
('202', 'Double',  8500.00, 'Booked',      'Double room with balcony and evening sunset view.'),
('203', 'Double',  9000.00, 'Available',   'Superior double with ocean glimpse and soaking tub.'),
('204', 'Double',  9000.00, 'Maintenance', 'Double garden suite — currently undergoing refurbishment.'),
('301', 'Suite',  18000.00, 'Available',   'Luxury suite with separate living area and private jacuzzi.'),
('302', 'Deluxe', 12000.00, 'Available',   'Deluxe sea-view room with premium furnishings.'),
('303', 'Suite',  22000.00, 'Booked',      'Signature suite with butler service and private plunge pool.'),
('401', 'Suite',  20000.00, 'Available',   'Presidential suite on the top floor with 360° panoramic views.'),
('402', 'Deluxe', 14000.00, 'Available',   'Deluxe harbour view room with pillow-top king bed.');

-- Customers (password stored as plain text for demo)
INSERT IGNORE INTO Customers (name, email, password, phone, address) VALUES
('Kamal Perera',    'kamal@email.com',   'kamal123',  '0761234567', 'Colombo 3, Sri Lanka'),
('Nimal Silva',     'nimal@email.com',   'nimal123',  '0769876543', 'Kandy, Sri Lanka'),
('Sarah Mitchell',  'sarah@email.com',   'sarah123',  '0771112233', 'New York, USA'),
('James Thornton',  'james@email.com',   'james123',  '0772223344', 'London, UK'),
('Priya Sharma',    'priya@email.com',   'priya123',  '0773334455', 'Mumbai, India'),
('Robert Chen',     'robert@email.com',  'robert123', '0774445566', 'Singapore'),
('Elena Vasquez',   'elena@email.com',   'elena123',  '0775556677', 'Madrid, Spain'),
('Michael Torres',  'michael@email.com', 'michael123','0776667788', 'Miami, USA'),
('Amara Peris',     'amara@email.com',   'amara123',  '0777778899', 'Galle, Sri Lanka'),
('Lucas Martini',   'lucas@email.com',   'lucas123',  '0778889900', 'Milan, Italy');

-- Reservations
INSERT IGNORE INTO Reservations (customer_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES
(3,  1, '2024-05-10', '2024-05-14', 'Confirmed',  18000.00),
(4,  2, '2024-05-08', '2024-05-11', 'CheckedOut', 25500.00),
(5,  5, '2024-05-20', '2024-05-25', 'Pending',    45000.00),
(6,  4, '2024-04-15', '2024-04-18', 'CheckedOut', 25500.00),
(7,  8, '2024-06-01', '2024-06-04', 'Confirmed',  54000.00),
(8,  6, '2024-04-10', '2024-04-12', 'Cancelled',   9600.00),
(1,  3, '2024-06-15', '2024-06-18', 'Confirmed',  14400.00),
(2,  7, '2024-07-01', '2024-07-05', 'Pending',    72000.00),
(9,  9, '2024-07-10', '2024-07-13', 'Confirmed',  36000.00),
(10, 1, '2024-07-20', '2024-07-22', 'Pending',     9000.00),
(3,  2, '2024-08-05', '2024-08-08', 'Confirmed',  25500.00),
(4, 10, '2024-08-15', '2024-08-19', 'Confirmed',  48000.00);

-- Payments
INSERT IGNORE INTO Payments (reservation_id, amount, payment_method, status) VALUES
(1,  18000.00, 'Card',   'Paid'),
(2,  25500.00, 'Online', 'Paid'),
(3,  45000.00, 'Card',   'Pending'),
(4,  25500.00, 'Cash',   'Paid'),
(5,  54000.00, 'Card',   'Paid'),
(6,   9600.00, 'Online', 'Refunded'),
(7,  14400.00, 'Card',   'Paid'),
(8,  72000.00, 'Online', 'Pending'),
(9,  36000.00, 'Card',   'Paid'),
(10,  9000.00, 'Cash',   'Pending'),
(11, 25500.00, 'Card',   'Paid'),
(12, 48000.00, 'Online', 'Paid');

-- Reviews
INSERT IGNORE INTO Reviews (reservation_id, customer_id, rating, comment) VALUES
(1, 3, 5, 'Absolutely stunning experience! The ocean view suite was breathtaking and the staff made our anniversary unforgettable.'),
(2, 4, 5, 'Business trip made comfortable. Fast WiFi, excellent breakfast, and the city view was a great way to end long work days.'),
(4, 6, 4, 'Very comfortable stay. The room was spacious and clean. Would have been 5 stars but the AC was a little noisy.'),
(5, 7, 5, 'VIP treatment from start to finish. Champagne on arrival, fresh flowers every day — pure luxury. Will be back!'),
(7, 1, 4, 'Great value for money. The suite was elegant and the jacuzzi was perfect after a long day of sightseeing.'),
(9, 9, 5, 'Magical stay. The harbour views are spectacular at sunrise. Staff are incredibly warm and attentive. Highly recommend!'),
(11,3, 5, 'Second stay at this property and it keeps getting better. Loyal customer for life!');
