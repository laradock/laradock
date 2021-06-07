#! /usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

(
cd "$SCRIPT_DIR" \
&& docker-compose build --pull --parallel caddy php-fpm workspace mysql mailhog redis
)
