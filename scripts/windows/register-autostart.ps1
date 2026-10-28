# Register OrderRestro in Windows Startup folder for automatic start upon PC boot
param(
    [string]$ProjectRoot = ""
)

$ErrorActionPreference = "SilentlyContinue"

if (-not $ProjectRoot) {
    $ProjectRoot = (Get-Item "$PSScriptRoot\..\..").FullName
}

$vbsPath = "$ProjectRoot\scripts\windows\auto-start.vbs"
if (-not (Test-Path $vbsPath)) {
    Write-Error "auto-start.vbs not found at $vbsPath"
    exit 1
}

$startupFolder = [System.Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder "OrderRestro-Autostart.lnk"

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $ProjectRoot
$shortcut.Description = "OrderRestro Background POS Server"
$shortcut.Save()

Write-Host "Registered OrderRestro in Windows Startup: $shortcutPath" -ForegroundColor Green
