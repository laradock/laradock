#!/bin/bash

ENV_FILE=.env
SEPARATOR=" "

if [[ -z "$ABSOLUTE_BIN_PATH" ]]; then
    ABSOLUTE_BIN_PATH="$( cd "$( dirname $(dirname "${BASH_SOURCE[0]}" ))" >/dev/null && pwd )"/
    ABSOLUTE_PATH="${ABSOLUTE_BIN_PATH}../"
    source ${ABSOLUTE_BIN_PATH}config.sh
fi

cd ${ABSOLUTE_PATH}
if [[ ! -e ${ENV_FILE} ]]; then
    echo "File .env not found, creating it using defaults"
    cp env-example ./${ENV_FILE}
fi

CONTAINERS="$( printf "${SEPARATOR}%s" "${ONDOCKER_CONTAINERS_TO_RUN[@]}" )"
CONTAINERS="${CONTAINERS:${SEPARATOR}}"

echo "Starting container services..."
docker network create ${ONDOCKER_EXTERNAL_NETWORK}
docker-compose up ${CONTAINERS}
