#!/bin/bash

ENV_FILE=.env

if [[ ! -e ${ENV_FILE} ]]; then
    echo "File .env not found, creating it using defaults"
    cp env-example ./${ENV_FILE}
fi

docker-compose up nginx postgres redis workspace
