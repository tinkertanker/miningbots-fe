#!/bin/bash
function server_is_running(){
        pidof abyssws-x64 >/dev/null || pidof abyssws-x86
}
function start_browser(){
    source browsersettings.conf # simple way to load a name=value pairs config file
    # update the ffconfig (Firefox Config) depending on the UI Mode
    if [ $UI_MODE == "debug" ]; then
      CLASS="Mining Bots (debug/test)"
      ./update_ffconfig.py toolkit.legacyUserProfileCustomizations.stylesheets=false browser.tabs.inTitlebar=1
    elif [ '(' "$UI_MODE" == "minimalist" ')' -o '(' "$UI_MODE" == "fullscreen" ')' ]; then
      CLASS="Mining Bots"
      ./update_ffconfig.py toolkit.legacyUserProfileCustomizations.stylesheets=true browser.tabs.inTitlebar=0
    else
      echo "Invalid UI mode" 1>&2
      return
    fi
    [ $UI_MODE == "fullscreen" ]  && KIOSK="--kiosk" || KIOSK=""
    XAPP_FORCE_GTKWINDOW_ICON="$PWD/favicon.ico" firefox $KIOSK -p miningbots --new-window --class="$CLASS" localhost:8000
}
cd $(dirname $0)
echo "Server starting at $(date)" >> webserver/log/startup.log
if server_is_running; then
     start_browser
     exit
fi
./webserver/abyssws &
TIME=0
while ! server_is_running; do
    echo -en "\rWaiting for frontend server to start... ($TIME seconds elapsed)"
    sleep 1
    ((TIME++))
    if [ $TIME -gt 20 ]; then
        echo -e "\rFailed to start frontend server.                            "
        exit
    fi
done
echo -e "\rFrontend server started successfully.                                "
source browsersettings.conf
$TEST_MODE && sh -c "cd $(dirname $TEST_MB_SERVER_PATH);exec $TEST_MB_SERVER_PATH" & # launch the server automatically to ease testing
start_browser
pkill -2 abyssws
$TEST_MODE && pkill -2 $(basename $TEST_MB_SERVER_PATH) # if the server was started by this script, quit it
echo "Server shut down on $(date)" >> webserver/log/startup.log
