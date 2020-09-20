#!/usr/bin/env bash

sudo systemctl stop apache2
sudo systemctl stop mongodb

# Docker
sudo usermod -a -G docker noud
sudo systemctl restart docker

# memmory for elasticsearch
sudo sysctl -w vm.max_map_count=262144

# export BUILD="--build"
export BUILD=""

declare -a arr=("apache2" "php-fpm" "workspace" \
# infra \
"kibana" "elasticsearch" \
"redis" "redis-webui" \
"mongo" "mongo-webui" \
"mariadb" "mysql" "phpmyadmin" \
"rabbitmq" \
"sqs" \
# docker \
"docker-web-ui" \
# mail \
"mailcatcher" \
# "mailhog" \
)

for i in "${arr[@]}"
do
    export CONTAINER="$i"
    docker-compose up ${BUILD} -d ${CONTAINER}
done

# @todo
# docker run -p 1358:1358 -d appbaseio/dejavu