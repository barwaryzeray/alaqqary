# Debug Guide - Login Issues

## Step 1: Check Your Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Users**
4. Find your user and check:
   - **Email**: Is it set correctly?
   - **Email confirmed?**: Should say "Yes"
   - **Has password?**: Should say "Yes"

5. Go to **Table Editor** → `profiles` table
6. Find your user by ID or email
7. Check that:
   - `email` field has your email
   - `username` field has your username
   - `role` is `'user'` or `'admin'`

## Step 2: Test Login Manually

Open browser console (F12) and run:

```javascript
// Import supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://fpuvdhjdqzeuabhqaivm.supabase.co',
  'sb_publishable_JM2f7i5ETbRAf8HX7xjz4Q_o4q0uO_u'
);

// Try to login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'YOUR_EMAIL_HERE',
  password: 'YOUR_PASSWORD_HERE'
});

console.log('Data:', data);
console.log('Error:', error);
```

## Step 3: Common Issues

### Issue 1: Email not confirmed
If the email isn't confirmed, you need to confirm it in the Supabase dashboard or enable "Enable email confirmations" in Authentication settings.

### Issue 2: Profile doesn't exist
Run this SQL in Supabase SQL Editor:

```sql
-- Check if profile exists
SELECT * FROM profiles WHERE email = 'your-email@example.com';

-- If not, create it (replace the user ID)
INSERT INTO profiles (id, email, username, full_name, phone, role)
VALUES ('user-id-here', 'your-email@example.com', 'your_username', 'Your Name', '+964 750 000 0000', 'user');
```

### Issue 3: Wrong password
If you forgot your password, reset it in Supabase dashboard:
1. Authentication → Users
2. Find your user
3. Click the three dots → "Send password recovery"

## Step 4: Check Network Tab

Open browser DevTools → Network tab and look for the Supabase API calls:
- Look for `auth/v1/token?grant_type=password`
- Check if the response shows 400 (bad request) or 200 (success)
- If 400, the response body will show the error message
