# Helper to create a new Restaurant Tenant in OrderRestro / Fudiyo
param(
    [Parameter(Mandatory=$true)]
    [string]$RestaurantName,
    
    [Parameter(Mandatory=$false)]
    [string]$BranchName = "Main Branch",
    
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$Prefix = "BR1",
    
    [Parameter(Mandatory=$false)]
    [switch]$CloudSupabase
)

$ErrorActionPreference = "Stop"

if ($CloudSupabase) {
    $dbUrl = "postgresql://postgres.iadwsjwscxvluzmvsubb:P1iolVHfU6WVgmXH@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
    Write-Host "Creating tenant on Cloud Supabase..." -ForegroundColor Cyan
    Get-Content "$PSScriptRoot\create-tenant.js" -Raw | docker compose exec -T -e "DATABASE_URL=$dbUrl" backend node - "$RestaurantName" "$BranchName" "$Email" "$Password" "$Prefix"
} else {
    Write-Host "Creating tenant on Local Database..." -ForegroundColor Cyan
    Get-Content "$PSScriptRoot\create-tenant.js" -Raw | docker compose exec -T backend node - "$RestaurantName" "$BranchName" "$Email" "$Password" "$Prefix"
}
