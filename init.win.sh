cd "$(dirname "$0")"
if [ ! -f browsersettings.conf ]; then
  cp browsersettings.conf.example browsersettings.conf
  echo "Created default browsersettings.conf. Please edit it as needed and re-run the script."
  exit 1
fi
source browsersettings.conf.example # load default settings
source browsersettings.conf
export UI_MODE START_WEB_SERVER REL_WEB_SERVER_PATH FRONTEND_URL
start powershell ./init.win.ps1 # windows only