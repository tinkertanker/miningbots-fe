cd "$(dirname "$0")"
source browsersettings.conf
export UI_MODE START_WEB_SERVER REL_WEB_SERVER_PATH
start powershell ./init.win.ps1 # windows only