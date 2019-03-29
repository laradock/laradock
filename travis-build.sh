#!/usr/bin/env bash

#### halt script on error
set -xe

echo '##### Print docker version'
docker --version

echo '##### Print environment'
env | sort

#### Build the Docker Images
if [ -n "${PHP_VERSION}" ]; then
    cp env-example .env
    sed -i -- "s/PHP_VERSION=.*/PHP_VERSION=${PHP_VERSION}/g" .env
    sed -i -- 's/=false/=true/g' .env
    sed -i -- 's/PHPDBG=true/PHPDBG=false/g' .env
    if [ "${PHP_VERSION}" == "5.6" ]; then
        # Aerospike C Client SDK 4.0.7, Debian 9.6 is not supported
        # https://github.com/aerospike/aerospike-client-php5/issues/145
        sed -i -- 's/PHP_FPM_INSTALL_AEROSPIKE=true/PHP_FPM_INSTALL_AEROSPIKE=false/g' .env
    fi
    if [ "${PHP_VERSION}" == "7.3" ]; then
        # V8JS extension does not yet support PHP 7.3.
        sed -i -- 's/WORKSPACE_INSTALL_V8JS=true/WORKSPACE_INSTALL_V8JS=false/g' .env
        # This ssh2 extension does not yet support PHP 7.3.
        sed -i -- 's/PHP_FPM_INSTALL_SSH2=true/PHP_FPM_INSTALL_SSH2=false/g' .env
        # xdebug extension does not yet support PHP 7.3.
        sed -i -- 's/PHP_FPM_INSTALL_XDEBUG=true/PHP_FPM_INSTALL_XDEBUG=false/g' .env
        # memcached extension does not yet support PHP 7.3.
        sed -i -- 's/PHP_FPM_INSTALL_MEMCACHED=true/PHP_FPM_INSTALL_MEMCACHED=false/g' .env
    fi
    cat .env
    docker-compose build ${BUILD_SERVICE}
    docker images
fi

#### Generate the Laradock Documentation site using Hugo
if [ -n "${HUGO_VERSION}" ]; then
    HUGO_PACKAGE=hugo_${HUGO_VERSION}_Linux-64bit
    HUGO_BIN=hugo_${HUGO_VERSION}_linux_amd64

    # Download hugo binary
    curl -L https://github.com/spf13/hugo/releases/download/v$HUGO_VERSION/$HUGO_PACKAGE.tar.gz | tar xz
    mkdir -p $HOME/bin
    mv ./${HUGO_BIN}/${HUGO_BIN} $HOME/bin/hugo

    # Remove existing docs
    if [ -d "./docs" ]; then
        rm -r ./docs
    fi

    # Build docs
    cd DOCUMENTATION
    hugo
fi
