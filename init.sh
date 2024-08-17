#!/bin/bash
echo "Server starting at $(date)" >> webserver/log/startup.log
./webserver/abyssws &
TIME=0
STARTED=false
while ! $STARTED; do
    echo -en "\rWaiting for frontend server to start... ($TIME seconds elapsed)"
    pidof abyssws-x64 >/dev/null && STARTED=true || pidof abyssws-x86 >/dev/null && STARTED=true
    sleep 1
    ((TIME++))
    if [ $TIME -gt 20 ]; then
        echo -e "\rFailed to start frontend server.                            "
        exit
    fi
done
echo -e "\rServer started successfully.                                "
source browsersettings.conf
$ENABLE_KIOSK_MODE && KIOSK="--kiosk" || KIOSK=""
$TEST_MODE && ../miningbots/build/bin/miningbots &
XAPP_FORCE_GTKWINDOW_ICON="$PWD/favicon.ico" firefox $KIOSK -p miningbots --class="Mining Bots" localhost:8000
pkill -2 abyssws
echo "Server shut down on $(date)" >> webserver/log/startup.log
