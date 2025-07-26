#!/bin/bash
function server_is_running(){
	source browsersettings.conf
        ps -x | grep $(basename $REL_WEB_SERVER_PATH) | grep -v grep > /dev/null
}
function start_browser(){
    if [ ! -f firefox-chrome/user.js ]; then
      ./utilities/update_ffconfig.py browser.shell.checkDefaultBrowser=false
    fi
    if ! ls -d ~/.mozilla/firefox/*.miningbots 1>/dev/null 2>&1; then
      ps -x | grep firefox | grep -v grep >/dev/null && exit 1
      firefox -CreateProfile miningbots || exit 1
      PROFILE_DIR=$(ls -d ~/.mozilla/firefox/*.miningbots | head -n 1)
      ln -s "$PWD/firefox-chrome" "$PROFILE_DIR/chrome"
      ln -s "chrome/user.js" "$PROFILE_DIR/user.js"
    fi
    source browsersettings.conf # simple way to load a name=value pairs config file
    # update the ffconfig (Firefox Config) depending on the UI Mode
    if [ $UI_MODE == "debug" ]; then
      CLASS="Mining Bots (debug/test)"
      ./utilities/update_ffconfig.py toolkit.legacyUserProfileCustomizations.stylesheets=false browser.tabs.inTitlebar=1 || exit 1
    elif [ '(' "$UI_MODE" == "minimalist" ')' -o '(' "$UI_MODE" == "fullscreen" ')' ]; then
      CLASS="Mining Bots"
      ./utilities/update_ffconfig.py toolkit.legacyUserProfileCustomizations.stylesheets=true browser.tabs.inTitlebar=0 || exit 1
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
source browsersettings.conf
if $START_WEB_SERVER; then
	echo "Server starting at $(date)" >> webserver/log/startup.log
	./$REL_WEB_SERVER_PATH &
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
fi
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
