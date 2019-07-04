#!/usr/bin/env bash

if [ "x" == "x${NPRBUTTON_NPR_URL}" ]; then
    NPRBUTTON_NPR_URL='https://wvpublic.streamguys1.com/wvpb'
fi

NPRBUTTON_VLC_PID="$(ps -fAH | grep "${NPRBUTTON_NPR_URL}" | grep "$(which vlc)" | awk '{ print $2 }')"
if [ "x" != "x${NPRBUTTON_VLC_PID}" ] || [ "xstop" == "x${1}" ]; then
    if [ "xstatus" == "x${1}" ]; then
        echo -n "started"
        exit 0
    fi
    for pid in $NPRBUTTON_VLC_PID; do
        kill -KILL $pid
    done
    echo -n "stopped"
else
    if [ "xstatus" == "x${1}" ]; then
        echo -n "stopped"
        exit 0
    fi
    setsid cvlc "${NPRBUTTON_NPR_URL}" > /dev/null 2>&1 &
    echo -n "started"
fi
exit 0