#!/bin/bash
function server_is_running(){
        pidof abyssws-x64 >/dev/null || pidof abyssws-x86
}
function start_browser(){
    source browsersettings.conf # simple way to load a name=value pairs config file
    # update the ffconfig (Firefox Config) depending on the UI Mode
    if [ $UI_MODE == "debug" ]; then
      CLASS="Mining Bots (debug/test)"
      ./update_ffconfig.py toolkit.legacyUserProfileCustomizations.stylesheets=false browser.tabs.inTitlebar=1 || exit
    elif [ '(' "$UI_MODE" == "minimalist" ')' -o '(' "$UI_MODE" == "fullscreen" ')' ]; then
      CLASS="Mining Bots"
      ./update_ffconfig.py toolkit.legacyUserProfileCustomizations.stylesheets=true browser.tabs.inTitlebar=0 || exit
    else
      echo "Invalid UI mode" 1>&2
      return
    fi
    [ $UI_MODE == "fullscreen" ]  && KIOSK="--kiosk" || KIOSK=""
    XAPP_FORCE_GTKWINDOW_ICON="$PWD/favicon.ico" firefox $KIOSK -p miningbots --new-window --class="$CLASS" localhost:8000
}
cd $(dirname $0)
if server_is_running; then # if the frontend server is already running, only start the browser.
     start_browser
     exit
fi
echo "Server starting at $(date)" >> webserver/log/startup.log
./webserver/abyssws &
TIME=0
while ! server_is_running; do # wait for the frontend server to start before loading the the browser
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
TEST_MB_SERVER_DIR=$(dirname $TEST_MB_SERVER_PATH)
TEST_MB_SERVER_NAME=$(basename $TEST_MB_SERVER_PATH)
if $TEST_MODE; then
    CURRENT_DIR=$PWD # save the current directory before switching to another directory, so that we can restore it later
    cd $TEST_MB_SERVER_DIR
    $TEST_MB_SERVER_PATH & # launch the server automatically to ease testing
    cd $CURRENT_DIR # restore the previous current directory
fi
start_browser
pkill -2 abyssws
$TEST_MODE && pkill -2 $TEST_MB_SERVER_NAME # if the server was started by this script, quit it
echo "Server shut down on $(date)" >> webserver/log/startup.log
