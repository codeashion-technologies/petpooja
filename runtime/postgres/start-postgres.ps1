$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pgData = Join-Path $scriptDir "data"
$pgBin = Join-Path $scriptDir "bin"
$postgresExe = Join-Path $pgBin "postgres.exe"
$pidFile = Join-Path $pgData "postmaster.pid"

# 1. Clean stale pid file if postgres is not running
$existing = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if (-not $existing -and (Test-Path $pidFile)) {
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# 2. Start postgres detached via WMI (independent process)
if (-not $existing) {
    $cmd = "`"$postgresExe`" -D `"$pgData`""
    $res = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd; CurrentDirectory = $pgBin }
    Write-Output "Spawned Postgres PID: $($res.ProcessId)"
}

# 3. Wait up to 5 seconds for port 5432
for ($i = 0; $i -lt 10; $i++) {
    $conn = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Output "POSTGRES_READY"
        exit 0
    }
    Start-Sleep -Milliseconds 500
}

Write-Output "POSTGRES_STARTED"
exit 0
