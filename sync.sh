#!/bin/bash

# This shell script is an optional tool to simplify
# the installation and usage of laradock with docker-sync.

# Make sure that the DOCKER_SYNC_STRATEGY is set in the .env
# DOCKER_SYNC_STRATEGY=native_osx # osx
# DOCKER_SYNC_STRATEGY=unison # windows

# To run, make sure to add permissions to this file:
# chmod 755 sync.sh

# USAGE EXAMPLE:
# Install docker-sync: ./sync.sh install
# Start sync and services with nginx and mysql: ./sync.sh up nginx mysql
# Stop containers and sync: ./sync.sh down

# prints colored text
print_style () {

    if [ "$2" == "info" ] ; then
        COLOR="96m"
    elif [ "$2" == "success" ] ; then
        COLOR="92m"
    elif [ "$2" == "warning" ] ; then
        COLOR="93m"
    elif [ "$2" == "danger" ] ; then
        COLOR="91m"
    else #default color
        COLOR="0m"
    fi

    STARTCOLOR="\e[$COLOR"
    ENDCOLOR="\e[0m"

    printf "$STARTCOLOR%b$ENDCOLOR" "$1"
}

display_options () {
    printf "Available options:\n";
    print_style "   install" "info"; printf "\t\t Installs docker-sync gem on the host machine.\n"
    print_style "   up [services]" "success"; printf "\t Starts docker-sync and runs docker compose.\n"
    print_style "   down" "success"; printf "\t\t\t Stops containers and docker-sync.\n"
    print_style "   bash" "success"; printf "\t\t\t Opens bash on the workspace.\n"
    print_style "   sync" "info"; printf "\t\t\t Manually triggers the synchronization of files.\n"
    print_style "   clean" "danger"; printf "\t\t Removes all files from docker-sync.\n"
}

if [[ $# -eq 0 ]] ; then
    print_style "Missing arguments.\n" "danger"
    display_options
    exit 1
fi

if [ "$1" == "up" ] ; then
    print_style "Initializing Docker Sync\n" "info"
    print_style "May take a long time (15min+) on the first run\n" "info"
    docker-sync start;

    print_style "Initializing Docker Compose\n" "info"
    shift # removing first argument
    docker-compose up -d ${@}

elif [ "$1" == "down" ]; then
    print_style "Stopping Docker Compose\n" "info"
    docker-compose stop

    print_style "Stopping Docker Sync\n" "info"
    docker-sync stop

elif [ "$1" == "bash" ]; then
    docker-compose exec workspace bash

elif [ "$1" == "install" ]; then
    print_style "Installing docker-sync\n" "info"
    gem install docker-sync

elif [ "$1" == "sync" ]; then
    print_style "Manually triggering sync between host and docker-sync container.\n" "info"
    docker-sync sync;

elif [ "$1" == "clean" ]; then
    print_style "Removing and cleaning up files from the docker-sync container.\n" "warning"
    docker-sync clean
else
    print_style "Invalid arguments.\n" "danger"
    display_options
    exit 1
fi
