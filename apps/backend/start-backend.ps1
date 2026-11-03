$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = $scriptDir
$logFile = Join-Path $backendDir "backend.log"

# Stop any existing backend on port 4000
$existingPort = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
if ($existingPort) {
    Stop-Process -Id $existingPort.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Launch backend with output redirected to backend.log
$cmd = "cmd.exe /c node dist\src\main.js > `"$logFile`" 2>&1"
$res = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd; CurrentDirectory = $backendDir }
Write-Output "Spawned Backend PID: $($res.ProcessId)"

for ($i = 0; $i -lt 15; $i++) {
    $conn = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Output "BACKEND_READY"
        exit 0
    }
    Start-Sleep -Milliseconds 500
}

Write-Output "BACKEND_TIMEOUT"
exit 0
