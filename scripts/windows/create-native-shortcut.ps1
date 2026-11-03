# Create Desktop Shortcut for Native OrderRestro POS
param(
    [string]$Url = "http://localhost:1995",
    [string]$ShortcutName = "OrderRestro POS.lnk"
)

$projectRoot = "D:\Flutter\flutter_projects\restaurant"
$launcherBat = "$projectRoot\Start-POS.bat"

# Browser App Mode detection
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
    if (Test-Path $p) { $browserExe = $p; break }
}
if (-not $browserExe) {
    foreach ($p in $edgePaths) {
        if (Test-Path $p) { $browserExe = $p; break }
    }
}

# Icon
$iconPath = "$projectRoot\apps\web\public\icons\favicon-32.png"
if (-not (Test-Path $iconPath)) { $iconPath = $browserExe }

# Create Shortcut on User Desktop
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath $ShortcutName

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "cmd.exe"
$shortcut.Arguments = "/c `"$launcherBat`""
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "OrderRestro Restaurant POS & Billing"
$shortcut.WindowStyle = 7 # Minimized
if (Test-Path $iconPath) {
    $shortcut.IconLocation = "$iconPath, 0"
}
$shortcut.Save()

Write-Host "Created Desktop Shortcut: $shortcutPath" -ForegroundColor Green

