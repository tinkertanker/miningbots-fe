#!/bin/bash
function server_is_running(){
        pidof abyssws-x64 >/dev/null || pidof abyssws-x86
}
function start_browser(){
    source browsersettings.conf
    if [ $UI_MODE == "debug" ]; then
      sed -i -e 's/true/false/' firefox-chrome/user.js
    elif [ '(' "$UI_MODE" == "minimalist" ')' -o '(' "$UI_MODE" == "fullscreen" ')' ]; then
      sed -i -e 's/false/true/' firefox-chrome/user.js
    else
      echo "Invalid UI mode" 1>&2
      return
    fi
    [ $UI_MODE == "fullscreen" ]  && KIOSK="--kiosk" || KIOSK=""
    XAPP_FORCE_GTKWINDOW_ICON="$PWD/favicon.ico" firefox $KIOSK -p miningbots --new-window --class="Mining Bots" localhost:8000
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
$TEST_MODE && ../miningbots/build/mb-server &
start_browser
pkill -2 abyssws
$TEST_MODE && pkill -2 mb-server
echo "Server shut down on $(date)" >> webserver/log/startup.log
