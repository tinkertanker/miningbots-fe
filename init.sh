#!/bin/bash
./webserver/abyssws &
XAPP_FORCE_GTKWINDOW_ICON="$PWD/favicon.ico" firefox --kiosk --class="miningbots" localhost:8000