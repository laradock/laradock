#!/bin/bash

if [[ -z "$ABSOLUTE_BIN_PATH" ]]; then
    ABSOLUTE_BIN_PATH="$( cd "$( dirname $(dirname "${BASH_SOURCE[0]}" ))" >/dev/null && pwd )"/
    ABSOLUTE_PATH="${ABSOLUTE_BIN_PATH}../"
    source ${ABSOLUTE_BIN_PATH}config.sh
fi

cd ${ABSOLUTE_PATH}

echo "Stopping container services..."
docker-compose stop