#!/bin/bash
if [[ $# -eq 0 ]] ; then
    printf "Available commands:\n";
    printf "   install\t\t Installs docker-sync gem on the host machine.\n";
    printf "   up <services>\t Starts docker-sync and runs docker compose.\n";
    printf "   down \t\t Stops containers and docker-sync.\n";
    printf "   trigger \t\t Manually triggers the synchronization of files.\n";
    printf "   clean \t\t Removes all synched files from docker-sync container.\n";
    exit 1
fi

if [ "$1" == "up" ] ; then
    printf "Initializing Docker Sync (may take several minutes the first time)";
    docker-sync start;
    printf "Initializing Docker Compose";
    shift; # removing first argument
    docker-compose -f docker-compose.yml -f docker-compose.sync.yml up -d ${@};

elif [ "$1" == "down" ]; then
    printf "Stopping Docker Compose";
    docker-compose down;
    printf "Stopping Docker Sync";
    docker-sync stop;

elif [ "$1" == "install" ]; then
    printf "Installing docker-sync";
    gem install docker-sync;

elif [ "$1" == "trigger" ]; then
    printf "Manually triggering sync between host and docker-sync container.";
    docker-sync sync;

elif [ "$1" == "clean" ]; then
    printf "Removing and cleaning up files from the docker-sync container.";
    docker-sync clean;

else
    printf "Invalid argument. Use 'up','down','install','trigger' or 'clean' ";
fi
