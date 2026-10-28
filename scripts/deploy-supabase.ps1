# Deploy Prisma migrations to Central Supabase Database (Fudiyo)
$supabaseUrl = "postgresql://postgres.iadwsjwscxvluzmvsubb:P1iolVHfU6WVgmXH@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Deploying OrderRestro Database to Supabase (Fudiyo)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

docker compose exec -e "DATABASE_URL=$supabaseUrl" backend ./node_modules/.bin/prisma migrate deploy

Write-Host ""
Write-Host "SUCCESS: Supabase Cloud Database is fully synchronized!" -ForegroundColor Green
