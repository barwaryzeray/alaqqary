# Login Fix Applied

## The Problem

When users try to login, they got error:
```
PGRST116 Cannot coerce the result to a single JSON object
```

This happened during the profile fetch after successful auth login.

## Root Cause

The query was using `.single()` which requires exactly one row, but:
- Either the profile didn't exist (0 rows)
- Or there was a malformed response

## The Fix

Updated `getProfileById()` function to:

1. **Use `.maybeSingle()` instead of `.single()`**
   - `.maybeSingle()` returns null if no row found (instead of error)
   - Handles the case where profile doesn't exist gracefully

2. **Improved error handling during profile creation**
   - If profile insert fails but profile exists anyway, use it
   - Retry profile fetch if insert returns no data

3. **Better console logging**
   - Shows exactly what's happening at each step
   - Easy to debug future issues

## Changes Made

### File: utils/auth.ts

**Function: getProfileById()**
- Changed from `.eq("id", userId).single()`
- To `.filter("id", "eq", userId).maybeSingle()`
- Added null check for empty results
- Better error logging

**Function: registerUser()**
- After profile insert, verifies profile was actually created
- If insert fails but profile exists, uses it anyway
- Fallback retry if insert returns no data

## Test It

### New User Registration:
1. Click **Register**
2. Fill in form
3. Should auto-login ✅

### Login with Registered Account:
1. Click **Sign In**
2. Enter email and password
3. Should login successfully ✅
4. Check console for logs showing profile was fetched

## Expected Console Output

When logging in successfully:

```
=== LOGIN START ===
Attempting login with: {email: "user@example.com"}
Supabase auth response: {hasUser: true, hasSession: true, hasError: false}
✅ Auth successful, getting profile...
Getting profile for user: [user-id]
✅ Profile retrieved: {id, username, email, ...}
✅ Profile found, creating session...
=== LOGIN COMPLETE ===
```

## Why This Works

- `.maybeSingle()` returns `null` if no row exists instead of throwing error
- No error for 406 "Not Acceptable" responses
- Gracefully handles missing profiles
- Fallback recovery during registration

## Verification

To verify the fix:

1. ✅ Old users who could login should still work
2. ✅ New users should be able to login
3. ✅ Console shows clean login flow without PGRST116 errors
4. ✅ Auto-login after registration still works

## If Issues Persist

Check browser console (F12 → Console) when logging in:

- If you see `PGRST116` error → Still have the issue, clear cache and reload
- If you see `RLS policy` error → SELECT policy needs fixing
- If you see `Profile retrieved` ✅ → Profile fetch succeeded

## Files Modified

- `utils/auth.ts` - getProfileById() and registerUser() functions
- No database changes needed
- No RLS policy changes needed

