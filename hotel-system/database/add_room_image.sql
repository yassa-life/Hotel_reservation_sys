-- ============================================================
-- Migration: Add image_url to Rooms table
-- Run this ONCE against your existing hotel_db database
-- ============================================================

USE hotel_db;

ALTER TABLE Rooms
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER description;

-- Optional: seed a default image per room type (leave NULL if you prefer blank)
-- UPDATE Rooms SET image_url = NULL WHERE image_url IS NULL;
