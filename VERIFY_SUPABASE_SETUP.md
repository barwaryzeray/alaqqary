# Verify Supabase Setup

Since users still can't register with the "Database error saving new user" message, we need to verify your Supabase database is properly set up.

## Step 1: Check Database Tables

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Tables** (left sidebar)
4. Look for the `profiles` table

**If you don't see it:**
- The schema hasn't been created yet
- You need to run the SQL schema first

**If you see it:**
- Click on it to view the structure
- Check that these columns exist:
  - `id` (UUID, Primary Key)
  - `username` (Text, Unique)
  - `email` (Text)
  - `full_name` (Text)
  - `phone` (Text)
  - `role` (Text, default 'user')
  - `created_at` (Timestamp)
  - `updated_at` (Timestamp)

## Step 2: Run the Schema If Missing

If the `profiles` table doesn't exist:

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy the entire content from your project's `supabase/schema.sql` file
4. Paste it into the SQL editor
5. Click **Execute**

⏳ This will take a few seconds. Wait for the green checkmark.

## Step 3: Check RLS Policies

1. Go to **Authentication** → **Policies** in Supabase
2. Find the `profiles` table in the dropdown
3. You should see these policies:
   - "Public profiles are viewable by everyone" (SELECT)
   - "System can insert profiles" (INSERT) ← This is the key one
   - "Users can update own profile" (UPDATE)
   - "Admins can update any profile" (UPDATE)
   - "Admins can delete profiles" (DELETE)

**If "System can insert profiles" is missing:**
- Run this SQL in the SQL Editor:
```sql
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
```

## Step 4: Verify Triggers

1. Go to **Database** → **Functions** in Supabase
2. Look for `handle_new_user` function
3. It should exist and have code that inserts into profiles table

**If it doesn't exist:**
- Run this SQL in the SQL Editor:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Step 5: Test Registration with Console Logs

1. Open your app
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to register with a new email
5. Look for messages starting with `=== REGISTRATION START ===`
6. Copy all the console output (should show green ✅ or red ❌ messages)
7. Look for the exact error message

**Share the console output if you still get errors** - it will show exactly what's failing.

## Step 6: Check Supabase Logs

If you're still getting errors after verifying everything:

1. Go to **Logs** in Supabase dashboard (or **Monitoring** → **Logs**)
2. Look for any SQL errors
3. Filter by the timestamp when you tried to register
4. Copy any error messages you see

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "profiles table not found" | Run the full schema.sql from your project |
| "RLS policy violation" | Make sure "System can insert profiles" policy exists |
| "duplicate key value violates unique constraint" | Use a different username/email |
| "trigger does not exist" | Create the handle_new_user trigger (see above) |
| Auth succeeds but profile isn't created | Trigger may have an error - check database logs |

## If Everything Looks Correct

If the database setup looks correct but registration still fails:

1. Try registering with a completely new email (not previously attempted)
2. Try a different username (avoid special characters, use only letters/numbers/_)
3. Check browser console for detailed error logs (with our updated code, you'll see more details)

## Need More Help?

After verifying everything above, try registering again and:
1. Open the browser console (F12)
2. Look for the message starting with `=== REGISTRATION START ===`
3. Copy everything until `=== REGISTRATION COMPLETE ===` or the error
4. The detailed logs will show exactly where it's failing

