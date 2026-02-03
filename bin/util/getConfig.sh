#!/bin/bash

getContainerComposeFile() {
    eval $1=$(dirname "$0")/../docker-compose.yml
    return
    CONTAINERS=($(docker ps -q -f label=laradock.workspace))
    NUM_CONTAINERS=${#CONTAINERS[@]}


    if [ $NUM_CONTAINERS -eq 1 ]; then
        eval $1=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}' ${CONTAINERS[0]})
        return
    fi

    echo "$NUM_CONTAINERS Workspaces gefunden. Welches soll verwendet werden?"

    for index in ${!CONTAINERS[@]}; do
        PROJECT_NAME=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' ${CONTAINERS[$index]})
        echo "$index) $PROJECT_NAME"
    done

    read -p "Container nummer: " CONTAINER_INDEX

    eval $1=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}' ${CONTAINERS[$CONTAINER_INDEX]})
}

# searches .env file in the same directory as docker-compose.yml
getEnvVariable() {
    getContainerComposeFile compose_file
    ENV_FILE=$(dirname $compose_file)/.env
    eval $2=$(grep -Po "(?<=^$1=).*" $ENV_FILE)
}
