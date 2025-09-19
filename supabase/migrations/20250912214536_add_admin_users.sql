-- Grant admin access to specified users
-- These users will be automatically created via Clerk webhook when they first sign in
UPDATE users 
SET role = 'ADMIN', updated_at = NOW()
WHERE email IN ('hi@skillvee.com', 'greyesma@gmail.com');

-- Insert admin users if they don't exist (for manual testing)
-- This is safe because of the ON CONFLICT clause
INSERT INTO users (id, clerk_id, email, role, created_at, updated_at)
VALUES 
  ('admin-placeholder-1', 'placeholder-clerk-id-1', 'hi@skillvee.com', 'ADMIN', NOW(), NOW()),
  ('admin-placeholder-2', 'placeholder-clerk-id-2', 'greyesma@gmail.com', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  role = 'ADMIN',
  updated_at = NOW();