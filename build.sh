#! /usr/bin/env bash
docker-compose build --pull --parallel caddy php-fpm workspace mysql mailhog redis
