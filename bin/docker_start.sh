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
"kibana" "dejavu" \
"memcached" "redis" "redis-webui" \
"mongo" "mongo-webui" \
# cd /var/lib/mysql && rm ib_logfile0 ib_logfile1  \
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