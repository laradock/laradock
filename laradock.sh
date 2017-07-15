#!/bin/bash
if [[ $# -eq 0 ]] ; then
    echo "Missing arguments. Please specify 'up' or 'down'.";
    exit 1
fi

if [ "$1" == "up" ] ; then
    echo "Initializing Docker Sync";
    docker-sync start;
    echo "Initializing Docker Compose";
    shift; # removing first argument
    docker-compose -f docker-compose.yml -f docker-compose.sync.yml up -d ${@};
elif [ "$1" == "down" ]; then
    echo "Stopping Docker Compose";
    docker-compose down;
    echo "Stopping Docker Sync";
    docker-sync stop;
elif [ "$1" == "install" ]; then
    echo "Installing docker-sync";
    gem install docker-sync;
elif [ "$1" == "sync" ]; then
    docker-sync sync;
elif [ "$1" == "clean" ]; then
    docker-sync clean;
else
    echo "Invalid argument. Use 'up','down','install','sync' or 'clean' ";
fi
