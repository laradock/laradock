#!/bin/bash

# prints colored text
print_style () {

    if [ "$2" == "info" ] ; then
        COLOR="96m";
    elif [ "$2" == "success" ] ; then
        COLOR="92m";
    elif [ "$2" == "warning" ] ; then
        COLOR="93m";
    elif [ "$2" == "danger" ] ; then
        COLOR="41m";
    else #white
        COLOR="97m";
    fi

    STARTCOLOR="\e[1;$COLOR";
    ENDCOLOR="\e[m";

    printf "$STARTCOLOR%b$ENDCOLOR" "$1";
}

if [[ $# -eq 0 ]] ; then
    print_style "Invalid argument." "danger"; printf " Available commands:\n";
    print_style "   install" "success"; printf "\t\t Installs docker-sync gem on the host machine.\n";
    print_style "   up <services>" "success"; printf "\t Starts docker-sync and runs docker compose.\n";
    print_style "   down" "success"; printf "\t\t\t Stops containers and docker-sync.\n";
    print_style "   trigger" "success"; printf "\t\t Manually triggers the synchronization of files.\n";
    print_style "   clean" "warning"; printf "\t\t Removes all synched files from docker-sync container.\n";

    exit 1
fi

if [ "$1" == "up" ] ; then
    print_style "Initializing Docker Sync\n" "info";
    print_style "(May take a long time (15min+) on the 'Looking for changes' step the first time)\n" "warning";
    docker-sync start;
    print_style "Initializing Docker Compose\n" "info";
    shift; # removing first argument
    docker-compose -f docker-compose.yml -f docker-compose.sync.yml up -d ${@};

elif [ "$1" == "down" ]; then
    print_style "Stopping Docker Compose\n" "info";
    docker-compose down;
    print_style "Stopping Docker Sync\n" "info";
    docker-sync stop;

elif [ "$1" == "install" ]; then
    print_style "Installing docker-sync\n" "info";
    gem install docker-sync;

elif [ "$1" == "trigger" ]; then
    print_style "Manually triggering sync between host and docker-sync container.\n" "info";
    docker-sync sync;

elif [ "$1" == "clean" ]; then
    print_style "Removing and cleaning up files from the docker-sync container.\n" "warning";
    docker-sync clean;

else
    print_style "Invalid argument. Use 'up','down','install','trigger' or 'clean'" "danger";
fi
