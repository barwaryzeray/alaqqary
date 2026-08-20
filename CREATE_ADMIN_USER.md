# How to Create Your Admin User

The admin user needs to be created manually in the Supabase dashboard since it doesn't have an email/password in the database.

## Option 1: Create Admin via Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project → **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Fill in:
   - **Email**: `admin@duhok-realestate.com` (or your own email)
   - **Password**: Create a strong password (save it!)
   - ✅ **Auto Confirm User**: Check this box
5. Click **Create user**

6. Now update the user's role to admin:
   - Go to **Table Editor**
   - Select `profiles` table
   - Find your admin user's row (by email)
   - Edit the row and set `role = 'admin'`
   - Also set `username = 'admin'` for easy login

7. Now login with:
   - **Email**: The email you created (e.g., `admin@duhok-realestate.com`)
   - **Password**: The password you set

## Option 2: Create Admin via SQL Query

1. Go to **SQL Editor** in Supabase dashboard
2. Run this query:

```sql
-- First, create a user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'admin@duhok-realestate.com',
  crypt('admin123', gen_salt('bf')),  -- bcrypt hash of 'admin123'
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"admin","full_name":"Administrator","phone":"+964 750 000 0000","role":"admin"}',
  false
);

-- Now create the profile
INSERT INTO public.profiles (
  id,
  username,
  email,
  full_name,
  phone,
  role
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@duhok-realestate.com'),
  'admin',
  'admin@duhok-realestate.com',
  'Administrator',
  '+964 750 000 0000',
  'admin'
);
```

3. This creates an admin user with:
   - Email: `admin@duhok-realestate.com`
   - Password: `admin123`
   - Role: `admin`

## Option 3: Make Existing User Admin

If you already created a user and want to make them admin:

1. Go to **Table Editor** → `profiles` table
2. Find your user
3. Edit the row:
   - Set `role = 'admin'`
   - Set `username = 'admin'` (optional)

4. Or use SQL:
```sql
UPDATE public.profiles
SET role = 'admin', username = 'admin'
WHERE email = 'your-email@example.com';
```

## Login After Creating Admin

Once you've created/updated the admin user:

1. Open your app: http://localhost:3001
2. Click **Login** in the navigation
3. Enter:
   - **Email**: `admin@duhok-realestate.com` (or your email)
   - **Password**: `admin123` (or your password)
4. Click **Sign In**

You should now see:
- The user icon in navigation shows "Administrator" or your name
- Click the user icon → **Dashboard** shows the Admin Dashboard
- Admin Dashboard has tabs: Pending, All Properties, Users, Notifications

## Troubleshooting

### "Invalid email or password" error
- Make sure you're using **email**, not username, for login
- Double-check the password you set
- Make sure the profile exists in the `profiles` table

### "Profile not found" error
- The profile wasn't created when you registered
- Create the profile manually in the `profiles` table with your user's ID

### Can't login as admin
- Verify the `role` column in `profiles` table is `'admin'`
- Make sure `username` is set (can be anything)
