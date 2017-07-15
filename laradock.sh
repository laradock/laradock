#!/bin/bash
if [[ $# -eq 0 ]] ; then
    echo "Missing arguments. Please specify 'up' or 'down'.";
    exit 1
fi

if [[ $1 -eq "up" ]] ; then
    echo "Initializing Docker Sync";
    docker-sync start;
    echo "Initializing Docker Compose";
    docker-compose -f docker-compose.yml -f docker-compose.sync.yml -d nginx mysql;
else
    echo "Stopping Docker Compose";
    docker-compose down;
    echo "Stopping Docker Sync";
    docker-sync start;
fi
