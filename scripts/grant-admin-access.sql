-- Script to grant admin access to specific users
-- Run this in your Supabase SQL editor or via psql

-- Grant admin access to specified users if they exist
UPDATE users 
SET role = 'ADMIN', updated_at = NOW()
WHERE email IN ('hi@skillvee.com', 'greyesma@gmail.com');

-- Verify the update was successful
SELECT id, email, role, updated_at 
FROM users 
WHERE email IN ('hi@skillvee.com', 'greyesma@gmail.com');

-- Note: If these users don't exist yet, they will be created automatically 
-- when they first sign in via Clerk. The user creation happens in the 
-- Clerk webhook handler at src/app/api/webhooks/clerk/route.ts
-- You can manually set their role to ADMIN after they're created.