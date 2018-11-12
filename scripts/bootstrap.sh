#!/bin/bash
function package::update_steamcmd() {
	if [ ! -d "/opt/steamcmd" ]; then
		mkdir /opt/steamcmd
        printf "Installing SteamCMD..\n"

        wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz -O /opt/steamcmd/steamcmd.tar.gz
        tar -xvzf /opt/steamcmd/steamcmd.tar.gz -C /opt/steamcmd
        rm -f /opt/steamcmd/steamcmd.tar.gz
	fi
}

function package::update_unturned() {
	printf "Updating Unturned..\n"
	package::get_steam_user
	/opt/steamcmd/steamcmd.sh +login "${STEAM_USERNAME}" "${STEAM_PASSWORD}" +force_install_dir "/opt/unturned" +app_update 730200 +exit
}

function package::start_server() {
	printf "Starting server..\n"
	cd /opt/unturned/
	touch /var/log/unturned.log
	chmod 777 U4Server.sh
	sleep 5 && ./U4Server.sh -rconport=3000 > /var/log/unturned.log &
	cd /opt/panel/ && node index.js
}

function package::get_steam_user() {
	if [ -z ${STEAM_USERNAME+x} ]; then
		printf "Error: STEAM_USERNAME not defined!\n";
		exit
	fi

	if [ -z ${STEAM_PASSWORD+x} ]; then
		printf "Error: STEAM_PASSWORD not defined!\n";
		exit
	fi
}

package::update_steamcmd
package::update_unturned
while : ; do . /opt/scripts/updateCheck.sh && sleep 30 ; done &
package::start_server