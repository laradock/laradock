#!/usr/bin/env bash

sudo systemctl stop apache2
sudo systemctl stop mongodb

# Docker
sudo usermod -aG docker $USER
sudo systemctl restart docker

# memmory for elasticsearch
sudo sysctl -w vm.max_map_count=262144

export BUILD="" # '--build'
export WORKSPACE_INSTALL_KRB5=false

declare -a arr=("apache2" \
"docker-registry" "docker-web-ui" \
"dejavu" "kibana" "manifoldcf" \
"memcached" "redis-webui" \
"mongo" \
"phpmyadmin" \
"pgadmin" \
"rabbitmq" "sqs" \
"mailhog"
)

# above also includes
# "php-fpm" "workspace"
# "docker"
# "redis"
# "mysql"
# "postgres"

# above can optinally do
# "mailcatcher"

# above fails for
# "mongo-webui" # It looks like you are trying to access MongoDB over HTTP on the native driver port.
# PermissionError: [Errno 1] Operation not permitted: '/var/lib/pgadmin/sessions'

for i in "${arr[@]}"
do
    export CONTAINER="$i"
    docker-compose up ${BUILD} -d ${CONTAINER}
done