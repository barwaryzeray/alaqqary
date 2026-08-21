Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Set environment variables on Vercel
Write-Host "Setting up Vercel environment variables..."

# Extract values from .env.local
$envContent = Get-Content ".env.local" -Raw
$supabaseUrl = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_URL="([^"]+)"').Groups[1].Value
$supabaseKey = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"').Groups[1].Value
$mapsKey = [regex]::Match($envContent, 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="([^"]+)"').Groups[1].Value

Write-Host "Supabase URL: $supabaseUrl"
Write-Host "Maps Key: $mapsKey"

# Set environment variables using Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL $supabaseUrl
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY $supabaseKey
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY $mapsKey

Write-Host "Environment variables set successfully!"
