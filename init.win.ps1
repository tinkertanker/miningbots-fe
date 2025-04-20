Function Clear-Line {
    Write-Host "`r" -NoNewline  # Moves the cursor to the beginning of the line
    Write-Host (" " * $host.UI.RawUI.WindowSize.Width) -NoNewline  # Overwrites with spaces
    Write-Host "`r" -NoNewline  # Moves the cursor back to the start
}

Function Server-IsRunning {
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
    If (-not (Server-IsRunning $ServerProcessName)) {
        Start-Process $ServerPath -ErrorAction SilentlyContinue
        While (($ElapsedSeconds -le 20) -and -not (Server-IsRunning $ServerProcessName)) {
          Write-Host -NoNewline "`rLaunching server... ($ElapsedSeconds seconds elapsed)"
          Start-Sleep -Seconds 1
          $ElapsedSeconds++
        }
        If (-not (Server-IsRunning $ServerProcessName)) {
          Clear-Line
          Write-Host "`rServer failed to launch. Quitting."
          Exit-Error
        }
    }
}

$FirefoxPath=(Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe" -Name "(Default)")."(default)"
$FirefoxArguments=@("-p","miningbots","localhost")
If ($UIMode -ieq "fullscreen") {
    $FirefoxArguments=@("--kiosk") + $FirefoxArguments
}
Start-Process $FirefoxPath -ArgumentList $FirefoxArguments