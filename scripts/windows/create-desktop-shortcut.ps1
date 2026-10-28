# Create Desktop Shortcut for OrderRestro POS in App Mode (Chrome or Edge)
param(
    [string]$Url = "http://localhost:1995",
    [string]$ShortcutName = "OrderRestro POS.lnk",
    [string]$ProjectRoot = ""
)

$ErrorActionPreference = "SilentlyContinue"

if (-not $ProjectRoot) {
    $ProjectRoot = (Get-Item "$PSScriptRoot\..\..").FullName
}

# 1. Detect browser (Prefer Chrome, fallback to Edge)
$chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
)

$edgePaths = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
)

$browserExe = $null

foreach ($p in $chromePaths) {
    if (Test-Path $p) {
        $browserExe = $p
        break
    }
}

if (-not $browserExe) {
    foreach ($p in $edgePaths) {
        if (Test-Path $p) {
            $browserExe = $p
            break
        }
    }
}

if (-not $browserExe) {
    Write-Warning "Neither Chrome nor Edge was found. Creating default browser shortcut."
    $browserExe = "explorer.exe"
    $arguments = $Url
} else {
    $arguments = "--app=$Url --start-maximized"
}

# 2. Determine icon
$iconPath = "$ProjectRoot\apps\web\public\icons\favicon-32.png"
if (-not (Test-Path $iconPath)) {
    $iconPath = $browserExe
}

# 3. Create shortcut on User Desktop
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath $ShortcutName

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $browserExe
$shortcut.Arguments = $arguments
$shortcut.WorkingDirectory = $ProjectRoot
$shortcut.Description = "OrderRestro Restaurant POS & Billing"
if (Test-Path $iconPath) {
    $shortcut.IconLocation = "$iconPath, 0"
}
$shortcut.Save()

Write-Host "Created Desktop Shortcut: $shortcutPath" -ForegroundColor Green

# 4. Also create on Public Desktop if writable (so all users can see it)
$publicDesktop = [System.Environment]::GetFolderPath('CommonDesktopDirectory')
if ($publicDesktop -and (Test-Path $publicDesktop)) {
    try {
        $publicShortcutPath = Join-Path $publicDesktop $ShortcutName
        $publicShortcut = $wshShell.CreateShortcut($publicShortcutPath)
        $publicShortcut.TargetPath = $browserExe
        $publicShortcut.Arguments = $arguments
        $publicShortcut.WorkingDirectory = $ProjectRoot
        $publicShortcut.Description = "OrderRestro Restaurant POS & Billing"
        if (Test-Path $iconPath) {
            $publicShortcut.IconLocation = "$iconPath, 0"
        }
        $publicShortcut.Save()
        Write-Host "Created Public Desktop Shortcut: $publicShortcutPath" -ForegroundColor Green
    } catch {}
}
