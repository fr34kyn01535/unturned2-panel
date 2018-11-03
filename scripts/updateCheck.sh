#!/bin/bash
rm -f /home/unturned/Steam/appcache/appinfo.vdf
appinfo=$(/opt/steamcmd/steamcmd.sh +login anonymous +app_info_update 1 +app_info_print "730200" +quit)
newbuildid=$(echo $appinfo | pcregrep -o1 '\"public\"[\sa-z\"0-9{}]*\"timeupdated\"[\s]*\"([0-9]*)\"')
if [ -z "$newbuildid" ];
then
    exit
else
    if [ ! -e "/opt/buildid" ]; then
        echo Loading version id
        echo $newbuildid > /opt/buildid
    else
        buildid=$(</opt/buildid)
        if [ "$buildid" -ne "$newbuildid" ]; then 
            echo New update found, exiting 
            echo $buildid
            echo $newbuildid
            echo $newbuildid > /opt/buildid
            pkill U4Server*
        fi
    fi
fi