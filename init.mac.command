#!/bin/zsh
function server_is_running(){
	source browsersettings.conf
        ps -x | grep "$(basename "$REL_WEB_SERVER_PATH")" | grep -v grep > /dev/null
}
function start_browser(){
    if ! ls -d ~/Library/"Application Support"/Firefox/Profiles/*.miningbots 1>/dev/null 2>&1; then
      if osascript -e 'tell application "System Events" to (name of processes) contains "firefox"' | grep true >/dev/null; then
        echo "Firefox is running"
        exit 1
      fi
      open -a "Firefox" --args -CreateProfile "miningbots"
      echo "Waiting for Firefox to create profile..."
      osascript << EOF
      tell application "System Events"
        repeat until exists (process "firefox")
          delay 1
        end repeat
        repeat while exists (process "firefox")
          delay 1
        end repeat
      end tell
EOF
      echo "Firefox profile created."
      cp -r "$PWD/firefox-chrome" "$PROFILE_DIR/chrome"
    fi
    PROFILE_DIR=$(ls -d ~/Library/"Application Support"/Firefox/Profiles/*.miningbots | head -n 1)
    source browsersettings.conf # simple way to load a name=value pairs config file
    if [[ "$UI_MODE" == "debug" ]]; then
        cp "firefox-chrome/userdebug.win.js" "$PROFILE_DIR/user.js"
      else
        cp "firefox-chrome/user.win.js" "$PROFILE_DIR/user.js"
      fi
    [[ $UI_MODE == "fullscreen" ]]  && KIOSK="--kiosk" || KIOSK=""
    open -a "Firefox" --args $KIOSK -p miningbots --new-window $FRONTEND_URL
}
cd $(dirname $0)
if server_is_running; then # if the frontend server is already running, only start the browser.
     start_browser
     exit
fi
source browsersettings.conf
if $START_WEB_SERVER; then
	echo "Server starting at $(date)" >> webserver/log/startup.log
	./"$REL_WEB_SERVER_PATH" &
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
start_browser
