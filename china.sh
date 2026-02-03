#!/usr/bin/env bash

# G_NAME="$(basename "$0")"
G_PATH="$(dirname "$(readlink -f "$0")")"

cd "$G_PATH" || exit 1

if [ ! -f .env.example ]; then
    echo "Not found .env.example"
    exit 1
fi

cat .env.example |
    sed \
        -e '/^COMPOSE_PATH_SEPARATOR/s/=.*/=;/' \
        -e '/^DOCKER_SYNC_STRATEGY/s/=.*/=unison/' \
        -e '/^CHANGE_SOURCE/s/=.*/=true/' \
        -e '/^WORKSPACE_COMPOSER_REPO_PACKAGIST/s/=.*/=https:\/\/mirrors.aliyun.com\/composer\//' \
        -e '/^WORKSPACE_NVM_NODEJS_ORG_MIRROR/s/=.*/=https:\/\/npmmirror.com\/mirrors\/node\//' \
        -e '/^WORKSPACE_NPM_REGISTRY/s/=.*/=https:\/\/registry.npmmirror.com\//' \
        -e '/^WORKSPACE_TIMEZONE/s/=.*/=PRC/' >z.env

