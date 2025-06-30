-- Migration 003.5: Add missing columns to users table
-- This migration adds the missing columns that are expected by the user repository code

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Add is_online column to users table
ALTER TABLE users ADD COLUMN is_online INTEGER DEFAULT 0;

-- Update existing users to have a default password_hash (you should change these in production)
UPDATE users SET password_hash = 'default_hashed_password' WHERE password_hash IS NULL;
