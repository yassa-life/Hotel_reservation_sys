-- ============================================================
-- Migration: Multi-image support for Rooms
-- Run this ONCE against hotel_db
-- ============================================================

USE hotel_db;

-- Step 1: Remove the single image_url column added previously
--         (safe to skip if you haven't run add_room_image.sql yet)
ALTER TABLE Rooms
    DROP COLUMN IF EXISTS image_url;

-- Step 2: Create the Room_Images table
--   - sort_order lets admin set which image appears first (primary)
--   - is_primary flag marks the thumbnail shown in listings
CREATE TABLE IF NOT EXISTS Room_Images (
    image_id    INT AUTO_INCREMENT PRIMARY KEY,
    room_id     INT          NOT NULL,
    image_url   VARCHAR(500) NOT NULL,
    is_primary  TINYINT(1)   NOT NULL DEFAULT 0,
    sort_order  INT          NOT NULL DEFAULT 0,
    uploaded_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);
