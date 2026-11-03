$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$standaloneDir = Join-Path $scriptDir ".next\standalone\apps\web"
$logFile = Join-Path $scriptDir "web.log"

# Stop any existing server on port 1995
$existingPort = Get-NetTCPConnection -LocalPort 1995 -State Listen -ErrorAction SilentlyContinue
if ($existingPort) {
    Stop-Process -Id $existingPort.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Launch standalone server on PORT 1995
$cmd = "cmd.exe /c set PORT=1995&& set HOSTNAME=0.0.0.0&& node server.js > `"$logFile`" 2>&1"
$res = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd; CurrentDirectory = $standaloneDir }
Write-Output "Spawned Web PID: $($res.ProcessId)"

for ($i = 0; $i -lt 15; $i++) {
    $conn = Get-NetTCPConnection -LocalPort 1995 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Output "WEB_READY"
        exit 0
    }
    Start-Sleep -Milliseconds 500
}

Write-Output "WEB_TIMEOUT"
exit 0

