# Supabase Database Setup Guide

This guide will help you set up Supabase as the backend database for your Duhok Real Estate application.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free tier is perfect for starting)
3. Verify your email address

## Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Project Name**: `duhok-real-estate`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest to Iraq (e.g., `ap-south-1` Mumbai or `eu-central-1` Frankfurt)
4. Click "Create new project"
5. Wait 2-3 minutes for the project to initialize

## Step 3: Get Your API Keys

1. In your project dashboard, click the ⚙️ **Settings** icon (bottom left)
2. Click **API** in the left sidebar
3. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
4. **Keep these safe!** You'll add them to your `.env.local` file

## Step 4: Create Database Tables

1. In your Supabase dashboard, click the **SQL Editor** icon (</> symbol on left)
2. Click **New Query**
3. Open the file **`supabase/schema.sql`** from this project and copy its entire contents
4. Paste into the SQL Editor and click **Run** (or press Ctrl+Enter)

> The schema creates `profiles`, `properties`, and `notifications` tables with Row Level Security, triggers, and indexes.

## Step 5: Create Default Admin Account

After running the schema, you need to create your first admin account:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: your admin email
   - **Password**: create a strong password
   - **Auto Confirm User**: ✅ (check this)
4. Click **Create user**
5. Now go back to **SQL Editor** and run this query (replace `admin@example.com` with your email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

If the profile doesn't exist yet, create it manually:

```sql
-- Replace with your admin user ID from auth.users
INSERT INTO public.profiles (id, username, email, full_name, phone, role)
VALUES (
  'your-user-uuid-here',
  'admin',
  'admin@example.com',
  'Administrator',
  '+964-xxx-xxxx',
  'admin'
);
```

## Step 6: Configure Storage for Images

1. Go to **Storage** in Supabase dashboard
2. Click **Create bucket**
3. Name it: `property-images`
4. **Public bucket**: ✅ (check this - allows public image access)
5. Click **Create bucket**

### Set up Storage Policies

Go to **Storage** → **Policies** → **property-images** bucket:

1. Click **New Policy** → **Insert**
   - Name: `Users can upload property images`
   - Target roles: `authenticated`
   - Policy: `return true;`
   
2. Click **New Policy** → **Select**
   - Name: `Anyone can view property images`
   - Target roles: `public`
   - Policy: `return true;`

## Step 7: Enable Realtime (Optional)

For live updates when admins approve properties:

1. Go to **Database** → **Replication**
2. Find `public.properties` table
3. Toggle **Enable Realtime** ON
4. Do the same for `public.notifications`

## Next Steps

Once your Supabase project is ready:

1. Copy your Project URL and anon key
2. Create a `.env.local` file in your project root (see `.env.example`)
3. Add your Supabase credentials
4. The application will automatically use Supabase instead of localStorage

## Troubleshooting

### Can't create tables?
- Make sure you're connected to the right database
- Check if SQL Editor shows any error messages
- Try running the schema in smaller chunks

### RLS policies blocking access?
- Check your policies in **Authentication** → **Policies**
- Verify your user role is set correctly in the profiles table

### Images not uploading?
- Verify the bucket is set to public
- Check storage policies are configured
- Ensure file size is under 50MB limit

## Support

For detailed Supabase documentation:
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- Storage: https://supabase.com/docs/guides/storage
5. Create Default Admin Account

After running the schema, you need to create your first admin account:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: your admin email
   - **Password**: create a strong password
   - **Auto Confirm User**: ✅ (check this)
4. Click **Create user**

## Step 6: Disable Email Verification for User Registration

By default, Supabase requires users to verify their email. For testing/development, disable this:

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Scroll down to **Enable email confirmations**
3. **Uncheck this box**
4. Click **Save**
5. Wait 1-2 minutes for the changes to apply

## Step 7: Create Storage Bucket for Images

(Continue with existing steps...)
