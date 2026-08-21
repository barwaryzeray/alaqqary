Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
$env:NEXT_PUBLIC_SUPABASE_URL=""
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY=""
npm run build 2>&1
