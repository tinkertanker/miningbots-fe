Function Clear-Line {
    Write-Host "`r" -NoNewline  # Moves the cursor to the beginning of the line
    Write-Host (" " * $host.UI.RawUI.WindowSize.Width) -NoNewline  # Overwrites with spaces
    Write-Host "`r" -NoNewline  # Moves the cursor back to the start
}

Function Get-IsServerRunning {
    param ($ServerProcessName)
    Return (Get-Process -Name $ServerProcessName -ErrorAction SilentlyContinue)
}

Function Exit-Error {
    pause
    Exit 1
}
#preprocess the bash variables
$LaunchServer=$false
If ($env:START_WEB_SERVER -eq "true") { # convert the bash style string to actual booleans
    $LaunchServer=$true
}
$UIMode=$env:UI_MODE
$ServerPath=$env:REL_WEB_SERVER_PATH
If (-not (@("debug","minimalist","fullscreen") -contains ($UIMode.ToLower()))) {
    Write-Error "The UI Mode is invalid."
    Exit-Error
}

$ScriptLocation=$(Split-Path $PSCommandPath -Parent)
Set-Location $ScriptLocation

If ($LaunchServer) {
    $ServerProcessName=$(Get-Item $ServerPath).BaseName
    $ElapsedSeconds=0
    If (-not (Get-IsServerRunning $ServerProcessName)) {
        Start-Process $ServerPath -ErrorAction SilentlyContinue
        While (($ElapsedSeconds -le 20) -and -not (Get-IsServerRunning $ServerProcessName)) {
          Write-Host -NoNewline "`rLaunching server... ($ElapsedSeconds seconds elapsed)"
          Start-Sleep -Seconds 1
          $ElapsedSeconds++
        }
        If (-not (Get-IsServerRunning $ServerProcessName)) {
          Clear-Line
          Write-Host "`rServer failed to launch. Quitting."
          Exit-Error
        }
    }
}

$FirefoxPath=(Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe" -Name "(Default)")."(default)"
$FirefoxProfilesDirectory="$env:APPDATA\Mozilla\Firefox\Profiles"
If (-not (Test-Path (Join-Path $FirefoxProfilesDirectory "*.miningbots"))) {
    If (Get-Process -Name (Get-Item $FirefoxPath).BaseName -ErrorAction SilentlyContinue){
        Write-Error "Firefox is already running. Profiles cannot be created while Firefox is running."
    } else {
        Start-Process $FirefoxPath -Wait -ArgumentList "-CreateProfile","miningbots"
        New-Item -Path (Join-Path $FirefoxProfileDirectory "chrome") -ItemType Directory | Out-Null
        Copy-Item "firefox-chrome\userChrome.css" (Join-Path $FirefoxProfileDirectory "chrome")
    }
}
$FirefoxProfileDirectory=(Join-Path $FirefoxProfilesDirectory (Get-Item (Join-Path $FirefoxProfilesDirectory "*.miningbots")).Name)
$FirefoxArguments=@("-p","miningbots","localhost")
If ($UIMode -ieq "fullscreen") {
    $FirefoxArguments=@("--kiosk") + $FirefoxArguments
}
If ($UIMode -ieq "debug") {
    Copy-Item -Force "firefox-chrome\userdebug.win.js" (Join-Path $FirefoxProfileDirectory "user.js")
} Else {
    Copy-Item -Force "firefox-chrome\user.win.js" (Join-Path $FirefoxProfileDirectory "user.js")
}
Start-Process $FirefoxPath -ArgumentList $FirefoxArguments