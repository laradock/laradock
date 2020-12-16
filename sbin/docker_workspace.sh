#!/usr/bin/env sh

export USER_OPTION="--user=laradock" # ''

#cd laradock
docker-compose exec ${USER_OPTION} workspace bash